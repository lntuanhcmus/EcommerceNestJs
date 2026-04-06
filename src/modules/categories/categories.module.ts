import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Category } from './entities/category.entity';
import { CreateCategoryHandler } from './commands/create-category/create-category.handler';
import { GetCategoryTreeHandler } from './queries/get-category-tree/get-category-tree.handler';
import { LinkProductCategoryHandler } from './commands/link-product-category/link-product-category.handler';
import { GetProductCategoriesHandler } from './queries/get-product-categories/get-product-categories.handler';
import { CategoriesController } from './categories.controller';
import { CategoryProduct } from './entities/category-product';

@Module({
    imports: [
        TypeOrmModule.forFeature([Category, CategoryProduct]),
        CqrsModule
    ],
    controllers: [CategoriesController], // Chúng ta sẽ thêm Controller sau
    providers: [
        CreateCategoryHandler,
        GetCategoryTreeHandler,
        LinkProductCategoryHandler,
        GetProductCategoriesHandler
    ],   // Chúng ta sẽ thêm CommandHandler sau
    exports: [TypeOrmModule] // Export để Module khác có thể dùng Repository nếu cần
})
export class CategoriesModule { }
