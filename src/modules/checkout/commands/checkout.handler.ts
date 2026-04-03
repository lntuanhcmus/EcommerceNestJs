import { CommandHandler, ICommandHandler, CommandBus, QueryBus } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { GetCartQuery } from '../../cart/queries/get-cart/get-cart.query';
import { CreateOrderCommand } from '../../orders/commands/create-order/create-order.command';
import { MarkCartAsCompletedCommand } from '../../cart/commands/mark-completed/mark-completed.command';
import { CheckoutCommand } from './checkout.command';

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

        // 2. Chuyển đổi dữ liệu sang định dạng mà Order Module yêu cầu
        const orderItems = cart.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
        }));

        // 3. "Ra lệnh" cho Order Module tạo đơn hàng
        // Luồng Saga (kiểm tra tồn kho, giữ cọc...) sẽ tự động chạy bên trong Handler này
        const order = await this.commandBus.execute(new CreateOrderCommand(orderItems));

        // 4. Nếu tạo đơn thành công, quay lại bảo Cart Module "Chốt sổ" giỏ hàng này
        await this.commandBus.execute(new MarkCartAsCompletedCommand(cartId));

        return order;
    }
}
