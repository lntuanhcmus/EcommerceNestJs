import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CheckoutController } from './checkout.controller';
import { CheckoutHandler } from './commands/checkout.handler';

@Module({
    imports: [CqrsModule],
    controllers: [CheckoutController],
    providers: [CheckoutHandler],
})
export class CheckoutModule { }
