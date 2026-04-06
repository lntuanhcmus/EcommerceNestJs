export class ProcessPaymentCommand {
    constructor(
        public readonly cartId: string,
        public readonly amount: number,
    ) { }
}
