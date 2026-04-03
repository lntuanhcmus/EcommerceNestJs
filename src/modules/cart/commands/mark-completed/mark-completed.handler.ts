import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarkCartAsCompletedCommand } from './mark-completed.command';
import { Cart } from '../../entities/cart.entity';

@CommandHandler(MarkCartAsCompletedCommand)
export class MarkCartAsCompletedHandler implements ICommandHandler<MarkCartAsCompletedCommand> {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepo: Repository<Cart>,
    ) { }

    async execute(command: MarkCartAsCompletedCommand): Promise<void> {
        await this.cartRepo.update(command.cartId, {
            completedAt: new Date(),
        });
    }
}
