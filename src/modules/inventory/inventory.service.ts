import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InventoryItem } from "./entities/inventory-item.entity";

@Injectable()
export class InventoryService {
    constructor(
        @InjectRepository(InventoryItem) private readonly inventoryRepo: Repository<InventoryItem>
    ) { }

    // HÀM CẢNH SÁT GIAO THÔNG CHẶN CỔNG
    async reserveInventory(sku: string, requestedQuantity: number): Promise<boolean> {
        // TÌM THEO SỢI DÂY SKU (Sợi dây chung duy nhất giữa 2 Module)
        const item = await this.inventoryRepo.findOne({ where: { sku } });

        if (!item) {
            throw new BadRequestException(`Cảnh báo: Mã kho ${sku} không tồn tại trên hệ thống Logistics.`);
        }

        // KIỂM TRA MẠNG SỐNG TỒN KHO THỰC TẾ
        if (item.availableQuantity < requestedQuantity) {
            // Chặn họng ngay lập tức! NestJS sẽ văng thẳng mã lỗi 400 về Client.
            throw new BadRequestException(`Rất tiếc! Mã ${sku} chỉ còn lại ${item.availableQuantity} chiếc.`);
        }

        // TÍN DỤNG QUA - THỰC HIỆN ĐẶT GẠCH
        item.reservedQuantity += requestedQuantity;  // Nhét tạm vào cột Đặt Gạch
        await this.inventoryRepo.save(item);

        return true;
    }

    async deductInventory(sku: string, deductedQuantity: number): Promise<void> {
        const item = await this.inventoryRepo.findOne({ where: { sku } });
        if (!item) return; // Lỗi trôi dạt thì kết thúc âm thầm
        console.log(`\n👷‍♂️ [WORKER-LOG] Tiến hành xả kho: Trừ ${deductedQuantity} số lượng Cọc, Trừ ${deductedQuantity} số lượng Cơ Vật Lý...`);
        // Xóa cọc: Giải phóng sự kìm kẹp cho biến Đặt Gạch (Vì nay đã đóng gói nhận tiền rồi)
        item.reservedQuantity -= deductedQuantity;
        // Xóa Vĩnh Viễn: Trừ thẳng vào mạng sống nhà kho chứa vật lý
        item.stockedQuantity -= deductedQuantity;

        await this.inventoryRepo.save(item);
    }

    // HÀM NHẢ CỌC RÁC: DÙNG ĐỂ CẤP CỨU KHI GIAO DỊCH LỖI
    async releaseInventory(sku: string, releasedQuantity: number): Promise<void> {
        const item = await this.inventoryRepo.findOne({ where: { sku } });
        if (!item) return;
        console.log(`\n🚑 [SAGA CẤP CỨU] Mua hàng thất bại: Đang Nhả ${releasedQuantity} cọc cho mã SKU: ${sku} về biên chế cũ!`);
        item.reservedQuantity -= releasedQuantity;
        await this.inventoryRepo.save(item);
    }
}