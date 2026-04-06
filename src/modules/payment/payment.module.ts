import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Payment } from './entities/payment.entity';
import { ProcessPaymentHandler } from './commands/process-payment/process-payment.handler';
import { RefundPaymentHandler } from './commands/refund-payment/refund-payment.handler';

@Module({
    imports: [TypeOrmModule.forFeature([Payment]), CqrsModule],
    providers: [ProcessPaymentHandler, RefundPaymentHandler],
})
export class PaymentModule { }
