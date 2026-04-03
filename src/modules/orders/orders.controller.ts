// src/modules/orders/orders.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateOrderCommand } from './commands/create-order/create-order.command';
import { CreateOrderDto } from './dto/create-dto.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post()
    async createOrder(@Body() body: CreateOrderDto) {
        return this.commandBus.execute(new CreateOrderCommand(body.items));
    }
}
