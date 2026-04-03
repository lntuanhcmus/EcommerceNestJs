import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartController } from './cart.controller';
import { CreateCartHandler } from './commands/create-cart/create-cart.handler';
import { AddToCartHandler } from './commands/add-to-cart/add-to-cart.handler';
import { GetCartHandler } from './queries/get-cart/get-cart.handler';
import { MarkCartAsCompletedHandler } from './commands/mark-completed/mark-completed.handler';

const QueryHandlers = [GetCartHandler]; // Thêm mảng Query
const CommandHandlers = [CreateCartHandler, AddToCartHandler, MarkCartAsCompletedHandler];

@Module({
    imports: [
        TypeOrmModule.forFeature([Cart, CartItem]),
        CqrsModule,
    ],
    controllers: [CartController],
    providers: [...CommandHandlers, ...QueryHandlers],
})
export class CartModule { }
