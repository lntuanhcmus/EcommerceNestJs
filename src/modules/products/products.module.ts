import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { GetProductsHandler } from './application/queries/get-products/get.products.handler';
import { GetProductByIdHandler } from './application/queries/get-product-by-id/get-product-by-id.handler';
import { ProductOrderCreatedHandler } from './application/events/order-created.handler';
import { BullModule } from '@nestjs/bullmq';
import { ProductOption } from './entities/product-option.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductOptionValue } from './entities/product-option-value.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { GetProductVariantByIdHandler } from './application/queries/get-product-variant-by-id/get-product-variant-by-id.handler';
import { AdminProductsController } from './api/admin/admin-product.controller';
import { StoreProductsController } from './api/store/store-product.controller';
import { CreateProductHandler } from './application/commands/create-product/create-product.handler';
import { InventoryProcessor } from './application/events/inventory.processor';
import { UpdateProductHandler } from './application/commands/update-product/update-product.handler';
import { DeleteProductHandler } from './application/commands/delete-product/delete-product.handler';
import { MediaModule } from '../media/media.module';
import { ProductImage } from './entities/product-image.entity';
@Module({
    imports: [
        CqrsModule,// Cực kỳ quan trọng để CommandBus hoạt động
        TypeOrmModule.forFeature([
            Product,
            ProductOption,
            ProductVariant,
            ProductOptionValue,
            ProductImage
        ]), // Bắt buộc: Cấp quyền gọi Database trực tiếp cho module này!
        BullModule.registerQueue({
            name: 'product-inventory', // Đặt tên cho đường ống
        }),
        InventoryModule,
        MediaModule
    ],
    controllers: [AdminProductsController, StoreProductsController],
    providers: [
        CreateProductHandler,
        GetProductsHandler,
        GetProductByIdHandler,
        GetProductVariantByIdHandler,
        ProductOrderCreatedHandler,
        InventoryProcessor,
        UpdateProductHandler,
        DeleteProductHandler,
        // Sau này bạn khai báo thêm các GetProductQueriesHandler ở đây
    ],
})
export class ProductsModule { }