import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import { ProductCreatedEvent } from '../../products/events/product-created.event'; // Móc nối sang nhà Product

@EventsHandler(ProductCreatedEvent)
export class InventoryProductCreatedHandler implements IEventHandler<ProductCreatedEvent> {
    constructor(
        @InjectRepository(InventoryItem) private inventoryRepo: Repository<InventoryItem>
    ) { }

    // Bất cứ khi nào Pháo sáng nổ, hàm handle này tự động bị triệu hồi ngầm cút dưới nền
    async handle(event: ProductCreatedEvent) {
        console.log(`\n📦 [INVENTORY] Radar nghe tin Sản phẩm ID: ${event.productId} chào đời. Tiến hành setup Mạng Nhện Kho...`);

        // Tạo ra các Ô két sắt lưu trữ (Inventory Item) theo số lượng Variant bắn sang
        const inventoryItems = event.variants.map(variant => {
            return this.inventoryRepo.create({
                sku: variant.sku,
                stockedQuantity: variant.stockQuantity,
                reservedQuantity: 0
            });
        });

        // Insert cái rụp 1 nhát toàn bộ thẻ Kho xuống DB
        await this.inventoryRepo.save(inventoryItems);

        console.log(`✅ [INVENTORY] Đã đóng cọc thành công ${inventoryItems.length} ô tồn kho! Sẵn sàng nghênh chiến Đơn Đặt Hàng!`);
    }
}
