import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OrderCreatedEvent } from 'src/modules/orders/events/order-created.even';

@EventsHandler(OrderCreatedEvent)
export class ProductOrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
    constructor(
        @InjectQueue('product-inventory') private readonly inventoryQueue: Queue, // Inject ống nước vào!
    ) { }

    async handle(event: OrderCreatedEvent) {
        console.log(`\n[Product EventBus Lắng Nghe] Nghe thấy Lệnh Order! Đang quăng vào Redis Queue...`);

        // Quăng cái cục Event mua hàng thẳng vào trong Redis. 
        // Lệnh này mất 0.001 giây, cực nhanh vì nó không chạy logic trừ kho.
        await this.inventoryQueue.add('reduce-stock-job', {
            items: event.items
        });
    }
}
