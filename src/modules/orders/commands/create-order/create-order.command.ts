// Sửa phần Command
export class CreateOrderCommand {
    constructor(
        // Nay nó xách theo cả Bọc Hàng (Array) đi gặp Handler
        public readonly items: Array<{ variantId: string, quantity: number }>
    ) { }
}