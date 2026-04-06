import { CommandHandler, EventBus, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { CreateOrderCommand } from "./create-order.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../../entities/order.entity";
import { OrderItem } from "../../entities/order-item.entity";
import { OrderCreatedEvent } from "../../events/order-created.even";
import { InventoryService } from "src/modules/inventory/inventory.service";
import { GetProductVariantByIdQuery } from "src/modules/products/application/queries/get-product-variant-by-id/get-product-variant-by-id.query";

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
    constructor(
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly inventoryService: InventoryService
    ) { }

    async execute(command: CreateOrderCommand) {
        let totalCartAmount = 0;
        const orderItemsToSave: OrderItem[] = [];
        const successfullyReservedSkus: Array<{ sku: string, qty: number }> = []; // Biến ghi nhớ để gỡ bom

        try {
            // DUYỆT QUA TỪNG MÓN TRONG GIỎ HÀNG
            for (const itemPayload of command.items) {
                // 1. Phân giải Variant
                const variant = await this.queryBus.execute(new GetProductVariantByIdQuery(itemPayload.variantId));

                // 2. Tước cọc Ngay Lập Tức (Nếu trong vòng lặp có 1 ông hết hàng, nó sẽ văng Lỗi ngay ở đây)
                await this.inventoryService.reserveInventory(variant.sku, itemPayload.quantity);

                // Ghi vào sổ tay: Nếu Lỗi ở món sau, thì nhớ tao đã cọc thằng này rồi nha, phải nhả nhé!
                successfullyReservedSkus.push({ sku: variant.sku, qty: itemPayload.quantity });

                // 3. Chuẩn bị Bill Tính Tiền
                const itemTotal = variant.price * itemPayload.quantity;
                totalCartAmount += itemTotal;

                // 4. Tạo mô hình Thẻ Line Item
                const orderItem = new OrderItem();
                orderItem.variantId = variant.id; // Lát sửa Database thay UUID sau
                orderItem.quantity = itemPayload.quantity;
                orderItem.unitPrice = variant.price;

                orderItemsToSave.push(orderItem);
            }

            // ===================================
            // SỐNG SÓT QUA VÒNG LẶP -> TẤT CẢ ĐỀU CÒN HÀNG -> OK, IN HÓA ĐƠN TRÙM KÍN!
            const newOrder = this.orderRepo.create({
                totalAmount: totalCartAmount,
                items: orderItemsToSave // TypeORM tự động Cascade lưu Mảng này xuống DB OrderItem
            });

            const savedOrder = await this.orderRepo.save(newOrder);

            // BẮN PHÁO SÁNG YÊU CẦU BULLMQ TRANH THỦ RÚT KHO VĨNH VIỄN
            this.eventBus.publish(new OrderCreatedEvent(savedOrder.id, successfullyReservedSkus));

            return savedOrder;

        } catch (error) {
            // NẾU CÓ BẤT KỲ 1 MÓN NÀO TRONG VÒNG LẶP HẾT HÀNG / VĂNG LỖI CÁP QUANG DB...
            console.log(`\n💥 [CRITICAL] 1 Món Hết Hàng Lẫn Lộn! Kích hoạt quy trình SAGA Cứu Hộ...`);

            for (const undoItem of successfullyReservedSkus) {
                // Trả lại Cọc cho các món đã trót rút ở các vòng lặp trước đó
                await this.inventoryService.releaseInventory(undoItem.sku, undoItem.qty);
            }
            throw error; // Báo Lỗi 400 ra cho Khách Hàng biết
        }
    }
}
