import { CommandHandler, ICommandHandler, CommandBus, QueryBus } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { GetCartQuery } from '../../cart/queries/get-cart/get-cart.query';
import { CreateOrderCommand } from '../../orders/commands/create-order/create-order.command';
import { MarkCartAsCompletedCommand } from '../../cart/commands/mark-completed/mark-completed.command';
import { CheckoutCommand } from './checkout.command';
import { ProcessPaymentCommand } from 'src/modules/payment/commands/process-payment/process-payment.command';
import { RefundPaymentCommand } from 'src/modules/payment/commands/refund-payment/refund-payment.command';

@CommandHandler(CheckoutCommand)
export class CheckoutHandler implements ICommandHandler<CheckoutCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    async execute(command: CheckoutCommand): Promise<any> {
        const { cartId } = command;

        // 1. "Alo" sang Cart Module để xin thông tin giỏ hàng
        const cart = await this.queryBus.execute(new GetCartQuery(cartId));

        if (!cart.items || cart.items.length === 0) {
            throw new BadRequestException('Giỏ hàng trống, không thể thanh toán.');
        }

        if (cart.completedAt) {
            throw new BadRequestException('Giỏ hàng này đã được thanh toán trước đó.');
        }

        // 2. Tính toán tổng tiền (Dựa trên Snapshot Price đã lưu trong CartItem)
        const totalAmount = cart.items.reduce((sum, item) => {
            return sum + (Number(item.unitPrice) * item.quantity);
        }, 0);


        // 3. THỦ TỤC THANH TOÁN (Giai đoạn quan trọng)
        // Nếu quẹt thẻ lỗi (10% rủi ro đã code), Handler này sẽ quăng Exception và dừng ngay lập tức tại đây,
        // giúp bảo vệ kho hàng và database không bị tạo Order ảo.
        await this.commandBus.execute(new ProcessPaymentCommand(cartId, totalAmount));
        // 4. Nếu thanh toán sống sót -> Tiến hành tạo Đơn hàng & Giữ cọc tồn kho
        // 3. KHỐI CỨU HỘ SAGA
        try {
            const orderItems = cart.items.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
            }));
            // Gọi lệnh tạo đơn (Luồng này có thể văng lỗi nếu Hết hàng giữa chừng)
            const order = await this.commandBus.execute(new CreateOrderCommand(orderItems));
            // Chốt sổ giỏ hàng
            await this.commandBus.execute(new MarkCartAsCompletedCommand(cartId));
            return order;
        } catch (error) {
            // 🚨 NẾU CÓ LỖI XẢY RA SAU KHI ĐÃ TRỪ TIỀN -> KÍCH HOẠT HOÀN TIỀN
            console.log(`\n💥 [CHECKOUT-ERROR] Có lỗi xảy ra. Tiến hành bồi hoàn (Rollback)...`);

            await this.commandBus.execute(new RefundPaymentCommand(cartId));
            // Ném lỗi gốc ra ngoài để Client biết lý do (Hết hàng / Lỗi DB...)
            throw error;
        }
    }
}
