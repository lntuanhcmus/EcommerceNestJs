import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InventoryService } from 'src/modules/inventory/inventory.service';

@Processor('product-inventory')
export class InventoryProcessor extends WorkerHost {
    constructor(private readonly inventoryService: InventoryService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        if (job.name === 'reduce-stock-job') {
            const { items } = job.data; // items lúc này là mảng các món hàng

            console.log('\n--- KHỞI TẠO BỘ MÁY XỬ LÝ BACKGROUND JOB (REDIS) ---');
            console.log(`[Worker] Nhận được đơn hàng gồm ${items.length} món hàng cần xuất kho.`);

            // DUYỆT QUA TỪNG MÓN ĐỂ TRỪ KHO
            for (const item of items) {
                console.log(`[Worker] Đang xả kho cho mã SKU: ${item.sku} (Số lượng: ${item.qty})...`);

                // Giả lập đóng gói 1 giây cho mỗi món
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Gọi hàm trừ kho chính chủ từ Inventory Module
                // Lưu ý: Tên biến trong mảng là item.sku và item.qty
                await this.inventoryService.deductInventory(item.sku, item.qty);
            }

            console.log(`[Worker] ✨ Đã hoàn thành xả kho toàn bộ đơn hàng!`);
            console.log('-----------------------------------------------\n');
        }
    }
}
