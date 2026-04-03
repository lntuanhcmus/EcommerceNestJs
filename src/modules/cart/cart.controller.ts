import { Controller, Post, Body, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCartCommand } from './commands/create-cart/create-cart.command';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { AddToCartCommand } from './commands/add-to-cart/add-to-cart.command';

@Controller('cart')
export class CartController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post()
    async createCart() {
        return this.commandBus.execute(new CreateCartCommand());
    }

    @Post(':cartId/items')
    async addItem(
        @Param('cartId') cartId: string,
        @Body() dto: AddToCartDto,
    ) {
        return this.commandBus.execute(
            new AddToCartCommand(cartId, dto.variantId, dto.quantity),
        );
    }
}
