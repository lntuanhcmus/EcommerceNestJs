import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InventoryService } from './inventory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryProductCreatedHandler } from './events/product-created.handler';

@Module({
    imports: [
        TypeOrmModule.forFeature([InventoryItem]),
        CqrsModule
    ],
    providers: [
        InventoryService,
        InventoryProductCreatedHandler
    ],
    exports: [InventoryService] // <-- THÊM DÒNG NÀY VÀO 
})
export class InventoryModule { }