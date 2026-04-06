import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminSessionGuard } from '../../../auth/infrastructure/guards/admin-session.guard';
import { CreateProductDto } from './dto/create-product-dto';
import { GetProductsQuery } from '../../application/queries/get-products/get-products.query';
import { GetProductByIdQuery } from '../../application/queries/get-product-by-id/get-product-by-id.query';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductCommand } from '../../application/commands/create-product/create-product.command';
import { UpdateProductCommand } from '../../application/commands/update-product/update-product.command';
import { DeleteProductCommand } from '../../application/commands/delete-product/delete-product.command';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from 'src/modules/media/media.service';

@Controller('api/admin/products')
@UseGuards(AdminSessionGuard) // Chỉ Admin mới được vào đây
export class AdminProductsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly mediaService: MediaService
    ) { }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 10 },
    ]))
    async create(
        @Body() body: any,
        @Body('categoryIds') categoryIds: any,
        @UploadedFiles() files: { thumbnail?: Express.Multer.File[], images?: Express.Multer.File[] }
    ) {
        // 1. Xử lý Thumbnail
        let thumbnailUrl: string | null = null;
        if (files.thumbnail) {
            thumbnailUrl = await this.mediaService.uploadImage(files.thumbnail[0]);
        }
        // 2. Xử lý Gallery (nhiều ảnh)
        let imageUrls: string[] = [];
        if (files.images) {
            imageUrls = await this.mediaService.uploadImages(files.images);
        }

        const finalCategoryIds = typeof categoryIds === 'string'
            ? JSON.parse(categoryIds)
            : (categoryIds || []);

        // 3. Parse JSON các trường khác (như bài trước)
        const options = typeof body.options === 'string' ? JSON.parse(body.options) : body.options;
        const variants = typeof body.variants === 'string' ? JSON.parse(body.variants) : body.variants;
        const defaultPrice = body.defaultPrice ? Number(body.defaultPrice) : 0;



        return this.commandBus.execute(new CreateProductCommand(
            body.name,
            defaultPrice,
            options,
            variants,
            thumbnailUrl,
            imageUrls, // Truyền mảng ảnh vào đây,
            finalCategoryIds
        ));
    }

    @Get()
    async listAll() {
        return this.queryBus.execute(new GetProductsQuery());
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.queryBus.execute(new GetProductByIdQuery(id));
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.commandBus.execute(new UpdateProductCommand(id, dto));
    }
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.commandBus.execute(new DeleteProductCommand(id));
    }
}
