import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCategoryTreeQuery } from './get-category-tree.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../../entities/category.entity';
// 🟢 Thêm IsNull vào import
import { IsNull, Repository } from 'typeorm';

@QueryHandler(GetCategoryTreeQuery)
export class GetCategoryTreeHandler implements IQueryHandler<GetCategoryTreeQuery> {
    constructor(
        @InjectRepository(Category) private readonly categoryRepo: Repository<Category>
    ) { }

    async execute() {
        // 🟢 Sửa null thành IsNull()
        return this.categoryRepo.find({
            where: { parent: IsNull() }, // Lấy các danh mục gốc (không có cha)
            relations: ['children', 'children.children']
        });
    }
}
