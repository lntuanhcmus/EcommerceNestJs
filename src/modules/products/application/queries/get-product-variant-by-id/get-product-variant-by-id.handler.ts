// src/modules/products/queries/get-product-by-id/get-product-by-id.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetProductVariantByIdQuery } from './get-product-variant-by-id.query';
import { ProductVariant } from '../../../entities/product-variant.entity';

@QueryHandler(GetProductVariantByIdQuery)
export class GetProductVariantByIdHandler implements IQueryHandler<GetProductVariantByIdQuery> {
    constructor(
        @InjectRepository(ProductVariant) private readonly productVariantRepo: Repository<ProductVariant>
    ) { }

    async execute(query: GetProductVariantByIdQuery) {
        const productVariant = await this.productVariantRepo.findOne({ where: { id: query.variantId } });
        if (!productVariant) {
            throw new NotFoundException(`Không tìm thấy sản phẩm mã: ${query.variantId}`);
        }
        return productVariant;
    }
}
