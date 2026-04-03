import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductsController } from './products.controller';
import { CreateProductHandler } from './commands/create-product/create-product.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { GetProductsHandler } from './queries/get-products/get.products.handler';
import { GetProductByIdHandler } from './queries/get-product-by-id/get-product-by-id.handler';
import { ProductOrderCreatedHandler } from './events/order-created.handler';
import { BullModule } from '@nestjs/bullmq';
import { InventoryProcessor } from './inventory.processor';
import { ProductOption } from './entities/product-option.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductOptionValue } from './entities/product-option-value.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { GetProductVariantByIdHandler } from './queries/get-product-variant-by-id/get-product-variant-by-id.handler';
@Module({
    imports: [
        CqrsModule,// Cực kỳ quan trọng để CommandBus hoạt động
        TypeOrmModule.forFeature([
            Product,
            ProductOption,
            ProductVariant,
            ProductOptionValue
        ]), // Bắt buộc: Cấp quyền gọi Database trực tiếp cho module này!
        BullModule.registerQueue({
            name: 'product-inventory', // Đặt tên cho đường ống
        }),
        InventoryModule
    ],
    controllers: [ProductsController],
    providers: [
        CreateProductHandler,
        GetProductsHandler,
        GetProductByIdHandler,
        GetProductVariantByIdHandler,
        ProductOrderCreatedHandler,
        InventoryProcessor,
        // Sau này bạn khai báo thêm các GetProductQueriesHandler ở đây
    ],
})
export class ProductsModule { }