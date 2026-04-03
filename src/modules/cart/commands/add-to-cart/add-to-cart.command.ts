export class AddToCartCommand {
    constructor(
        public readonly cartId: string,
        public readonly variantId: string,
        public readonly quantity: number,
    ) { }
}
