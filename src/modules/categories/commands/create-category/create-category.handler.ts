import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from './create-category.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Category } from '../../entities/category.entity';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
    constructor(
        @InjectRepository(Category) private readonly categoryRepo: Repository<Category>
    ) { }

    async execute(command: CreateCategoryCommand) {
        const handle = slugify(command.name, { lower: true, strict: true });

        const category = this.categoryRepo.create({
            name: command.name,
            handle: handle,
            description: command.description,
        });

        if (command.parentId) {
            const parent = await this.categoryRepo.findOne({ where: { id: command.parentId } });
            if (parent) {
                category.parent = parent;
            }
        }

        return this.categoryRepo.save(category);
    }
}
