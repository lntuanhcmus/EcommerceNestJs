// src/modules/orders/events/order-created.event.ts
export class OrderCreatedEvent {
    constructor(
        public readonly orderId: string,
        public readonly items: Array<{ sku: string, qty: number }>
    ) { }
}