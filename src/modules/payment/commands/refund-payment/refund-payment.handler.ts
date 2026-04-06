import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundPaymentCommand } from './refund-payment.command';
import { Payment, PaymentStatus } from '../../entities/payment.entity';

@CommandHandler(RefundPaymentCommand)
export class RefundPaymentHandler implements ICommandHandler<RefundPaymentCommand> {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
    ) { }

    async execute(command: RefundPaymentCommand): Promise<void> {
        const { cartId } = command;

        // Tìm bản ghi thanh toán CAPTURED mới nhất của giỏ hàng này
        const payment = await this.paymentRepo.findOne({
            where: { cartId, status: PaymentStatus.CAPTURED },
            order: { createdAt: 'DESC' }
        });

        if (payment) {
            payment.status = PaymentStatus.REFUNDED;
            await this.paymentRepo.save(payment);
            console.log(`\n🚑 [PAYMENT-SAGA] Phát hiện lỗi sau thanh toán. Đã HOÀN TIỀN giao dịch: ${payment.id}`);
        }
    }
}
