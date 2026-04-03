// src/modules/products/queries/get-product-by-id/get-product-by-id.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductByIdQuery } from './get-product-by-id.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler implements IQueryHandler<GetProductByIdQuery> {
    constructor(
        @InjectRepository(Product) private readonly productRepo: Repository<Product>
    ) { }

    async execute(query: GetProductByIdQuery) {
        const product = await this.productRepo.findOne({ where: { id: query.productId } });
        if (!product) {
            // Ném lỗi này thì cái GlobalFilter lúc nãy sẽ tóm gọn và báo 404 cho user!
            throw new NotFoundException(`Không tìm thấy sản phẩm mã: ${query.productId}`);
        }
        return product;
    }
}
