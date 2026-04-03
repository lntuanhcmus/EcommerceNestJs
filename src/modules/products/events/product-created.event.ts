export class ProductCreatedEvent {
    constructor(
        public readonly productId: string,
        // Logistics chả quan tâm tới Size hay Màu Sắc, nó chỉ quan tâm tới SKU và Số lượng
        public readonly variants: Array<{ sku: string, stockQuantity: number }>
    ) { }
}