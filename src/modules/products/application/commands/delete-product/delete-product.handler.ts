import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteProductCommand } from "./delete-product.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "../../../entities/product.entity";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";

@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler implements ICommandHandler<DeleteProductCommand> {
    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>
    ) { }

    async execute(command: DeleteProductCommand) {
        const { id } = command;

        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Xóa sản phẩm (TypeORM sẽ tự động xóa Variants nếu bạn để onDelete: 'CASCADE')
        return this.productRepo.remove(product);
    }
}
