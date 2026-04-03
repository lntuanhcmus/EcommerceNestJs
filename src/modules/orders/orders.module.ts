// src/modules/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { CreateOrderHandler } from './commands/create-order/create-order.handler';
import { InventoryModule } from '../inventory/inventory.module';
import { OrderItem } from './entities/order-item.entity';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([
            Order,
            OrderItem,
        ]),
        InventoryModule
    ], // Khai báo Bảng Order
    controllers: [OrdersController],
    providers: [CreateOrderHandler],
})
export class OrdersModule { }
