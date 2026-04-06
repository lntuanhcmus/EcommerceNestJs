import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { GetProductCategoriesQuery } from './get-product-categories.command';
import { CategoryProduct } from '../../entities/category-product';

@QueryHandler(GetProductCategoriesQuery)
export class GetProductCategoriesHandler implements IQueryHandler<GetProductCategoriesQuery> {
    constructor(
        @InjectRepository(CategoryProduct) private readonly linkRepo: Repository<CategoryProduct>,
        @InjectRepository(Category) private readonly categoryRepo: Repository<Category>
    ) { }

    async execute(query: GetProductCategoriesQuery) {
        // Nhịp 1: Tìm tất cả category_id của sản phẩm này
        const links = await this.linkRepo.find({ where: { productId: query.productId } });
        if (links.length === 0) return [];

        const categoryIds = links.map(l => l.categoryId);

        // Nhịp 2: Lấy thông tin chi tiết của các Category đó
        return this.categoryRepo.findBy({ id: In(categoryIds) });
    }
}
