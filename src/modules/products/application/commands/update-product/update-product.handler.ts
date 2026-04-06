import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateProductCommand } from "./update-product.command";
import { DataSource } from "typeorm";
import { Product } from "../../../entities/product.entity";
import { ProductVariant } from "../../../entities/product-variant.entity";
import { NotFoundException, InternalServerErrorException } from "@nestjs/common";

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand> {
    constructor(private readonly dataSource: DataSource) { }

    async execute(command: UpdateProductCommand) {
        const { id, dto } = command;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Tìm Product kèm theo Variants hiện tại
            const product = await queryRunner.manager.findOne(Product, {
                where: { id },
                relations: ['variants']
            });

            if (!product) {
                throw new NotFoundException(`Product with ID ${id} not found`);
            }

            // 2. Cập nhật thông tin cơ bản của Product
            if (dto.name) product.name = dto.name;
            if (dto.thumbnail) product.thumbnail = dto.thumbnail;
            if (dto.isPublished !== undefined) product.isPublished = dto.isPublished;

            await queryRunner.manager.save(Product, product);

            // 3. Xử lý cập nhật Variants (nếu có gửi lên)
            if (dto.variants && dto.variants.length > 0) {
                for (const vDto of dto.variants) {
                    if (vDto.id) {
                        // A. Nếu có ID -> Cập nhật Variant cũ
                        await queryRunner.manager.update(ProductVariant, vDto.id, {
                            title: vDto.title,
                            sku: vDto.sku,
                            price: vDto.price
                        });
                    } else {
                        // B. Nếu không có ID -> Tạo Variant mới cho Product này
                        const newVariant = queryRunner.manager.create(ProductVariant, {
                            ...vDto,
                            product: product
                        });
                        await queryRunner.manager.save(ProductVariant, newVariant);
                    }
                }
            }

            await queryRunner.commitTransaction();
            return { message: "Product updated successfully", id };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException("Update failed: " + error.message);
        } finally {
            await queryRunner.release();
        }
    }
}
