// src/modules/products/queries/get-product-by-id/get-product-by-id.handler.ts
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetProductByIdQuery } from './get-product-by-id.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../../entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetProductCategoriesQuery } from 'src/modules/categories/queries/get-product-categories/get-product-categories.command';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler implements IQueryHandler<GetProductByIdQuery> {
    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        private readonly queryBus: QueryBus
    ) { }

    async execute(query: GetProductByIdQuery) {
        const { productId } = query;
        let product;
        // Kiểm tra xem productId truyền lên có phải định dạng UUID không
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(query.productId);

        if (isUuid) {
            // Tìm theo ID
            product = await this.productRepo.findOne({
                where: { id: productId },
                relations: [
                    'images',           // Lấy Gallery của Sản phẩm
                    'variants',
                    'variants.images'   // Lấy Ảnh riêng của từng Biến thể
                ]
            });
        } else {
            // Tìm theo Handle (Slug)
            product = await this.productRepo.findOne({
                where: { handle: productId },
                relations: [
                    'images',           // Lấy Gallery của Sản phẩm
                    'variants',
                    'variants.images'   // Lấy Ảnh riêng của từng Biến thể
                ]
            });
        }
        if (!product) {
            // Ném lỗi này thì cái GlobalFilter lúc nãy sẽ tóm gọn và báo 404 cho user!
            throw new NotFoundException(`Không tìm thấy sản phẩm mã: ${query.productId}`);
        }

        // 2. 🟢 AGGREGATION: Hỏi Module Category để lấy danh mục của sản phẩm này
        const categories = await this.queryBus.execute(
            new GetProductCategoriesQuery(product.id)
        );

        // 3. Trộn dữ liệu lại
        return {
            ...product,
            categories: categories || []
        };
    }
}
