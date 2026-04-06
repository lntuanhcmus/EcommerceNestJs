import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ProcessPaymentCommand } from './process-payment.command';
import { Payment, PaymentStatus } from '../../entities/payment.entity';

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentHandler implements ICommandHandler<ProcessPaymentCommand> {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
    ) { }

    async execute(command: ProcessPaymentCommand): Promise<Payment> {
        const { cartId, amount } = command;

        // 1. Khởi tạo bản ghi thanh toán ở trạng thái Chờ (Pending)
        const payment = this.paymentRepo.create({ cartId, amount });
        await this.paymentRepo.save(payment);

        console.log(`\n💳 [PAYMENT-GATEWAY] Đang xử lý giao dịch ${payment.id} cho giỏ hàng ${cartId}...`);

        // 2. Giả lập gọi API cổng thanh toán (Stripe/Paypal)
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Đợi 2 giây

        // Tỉ lệ thành công 90%
        const isSuccess = Math.random() < 0.9;

        if (isSuccess) {
            payment.status = PaymentStatus.CAPTURED;
            await this.paymentRepo.save(payment);
            console.log(`✅ [PAYMENT-GATEWAY] Giao dịch THÀNH CÔNG!`);
            return payment;
        } else {
            payment.status = PaymentStatus.FAILED;
            await this.paymentRepo.save(payment);
            console.log(`❌ [PAYMENT-GATEWAY] Giao dịch THẤT BẠI!`);
            throw new BadRequestException('Thanh toán không thành công. Vui lòng kiểm tra lại thẻ.');
        }
    }
}
