import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCartCommand } from './create-cart.command';
import { Cart } from '../../entities/cart.entity';

@CommandHandler(CreateCartCommand)
export class CreateCartHandler implements ICommandHandler<CreateCartCommand> {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepo: Repository<Cart>,
    ) { }

    async execute(command: CreateCartCommand): Promise<Cart> {
        const newCart = this.cartRepo.create({}); // Tạo object Cart mới (UUID tự sinh)
        return this.cartRepo.save(newCart);
    }
}
