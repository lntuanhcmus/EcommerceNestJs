import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetProductsQuery } from '../../application/queries/get-products/get-products.query';
import { GetProductByIdQuery } from '../../application/queries/get-product-by-id/get-product-by-id.query';
import { FileUrlInterceptor } from 'src/common/interceptors/file-url.interceptors';

@Controller('api/store/products')
@UseInterceptors(FileUrlInterceptor)
export class StoreProductsController {
    constructor(private readonly queryBus: QueryBus) { }

    @Get()
    async listPublished() {
        // Lưu ý: Bạn cần cập nhật GetProductsHandler để chỉ lấy sản phẩm isPublished = true
        return this.queryBus.execute(new GetProductsQuery());
    }

    @Get(':identifier') // Route có thể là :id hoặc :handle
    async getDetails(@Param('identifier') identifier: string) {
        return this.queryBus.execute(new GetProductByIdQuery(identifier));
    }
}
