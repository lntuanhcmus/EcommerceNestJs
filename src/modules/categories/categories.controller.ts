import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCategoryCommand } from './commands/create-category/create-category.command';
import { GetCategoryTreeQuery } from './queries/get-category-tree/get-category-tree.query';
import { AdminSessionGuard } from '../auth/infrastructure/guards/admin-session.guard';

@Controller()
export class CategoriesController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) { }

    @Post()
    @UseGuards(AdminSessionGuard)
    async create(@Body() body: any) {
        return this.commandBus.execute(new CreateCategoryCommand(
            body.name,
            body.description,
            body.parentId
        ));
    }

    @Get('tree')
    async getTree() {
        return this.queryBus.execute(new GetCategoryTreeQuery());
    }
}
