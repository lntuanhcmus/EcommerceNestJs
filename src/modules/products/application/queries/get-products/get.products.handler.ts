import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductsQuery } from './get-products.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../../entities/product.entity';
import { Repository } from 'typeorm';
@QueryHandler(GetProductsQuery)
export class GetProductsHandler implements IQueryHandler<GetProductsQuery> {
    // Bơm đồ nghề Database tương tự như bên Command
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }
    async execute(query: GetProductsQuery) {
        console.log('Đang nhận lệnh lấy danh sách sản phẩm từ DB...');

        // Yêu cầu TypeORM ném trả rổ sản phẩm
        const products = await this.productRepository.find({
            order: {
                createdAt: 'DESC' // Thêm một tùy chọn nhỏ: Xếp sản phẩm mới tạo lên đầu
            }
        });

        return products;
    }
}