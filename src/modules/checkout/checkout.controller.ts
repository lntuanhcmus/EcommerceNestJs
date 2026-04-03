import { Controller, Post, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CheckoutCommand } from './commands/checkout.command';

@Controller('checkout')
export class CheckoutController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post(':cartId')
    async checkout(@Param('cartId') cartId: string) {
        return this.commandBus.execute(new CheckoutCommand(cartId));
    }
}
