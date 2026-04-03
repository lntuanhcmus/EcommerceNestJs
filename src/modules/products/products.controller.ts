
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProductCommand } from './commands/create-product/create-product.command';
import { GetProductsQuery } from './queries/get-products/get-products.query';
import { CreateProductDto } from './dto/create-product-dto';
@Controller('products')
export class ProductsController {
    // Inject CommandBus của NestJS
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus

    ) { }
    @Post()
    async createProduct(@Body() body: CreateProductDto) {
        // 1. Map dữ liệu từ Body thành Command Object (Mang theo cả mảng)
        const command = new CreateProductCommand(
            body.name,
            body.defaultPrice,
            body.options,
            body.variants
        );
        // 2. Giao phó cho hệ thống tự tìm Handler tương ứng để xử lý
        return this.commandBus.execute(command);
    }

    // --- LUỒNG QUERY (READ) ---
    @Get()
    async getProducts() {
        // 1. Tạo đơn nhặt hàng
        const query = new GetProductsQuery();

        // 2. Ném vào QueryBus xử lý
        return this.queryBus.execute(query);
    }
}