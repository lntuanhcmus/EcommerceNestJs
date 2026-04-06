import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LinkProductCategoryCommand } from './link-product-category.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryProduct } from '../../entities/category-product';

@CommandHandler(LinkProductCategoryCommand)
export class LinkProductCategoryHandler implements ICommandHandler<LinkProductCategoryCommand> {
    constructor(
        @InjectRepository(CategoryProduct) private readonly linkRepo: Repository<CategoryProduct>
    ) { }

    async execute(command: LinkProductCategoryCommand) {
        const { productId, categoryIds } = command;

        // Tạo các bản ghi liên kết ID thuần túy (No Foreign Keys)
        const links = categoryIds.map(catId => this.linkRepo.create({
            productId,
            categoryId: catId
        }));

        return this.linkRepo.save(links);
    }
}
