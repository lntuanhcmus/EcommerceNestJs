import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetCartQuery } from './get-cart.query';
import { Cart } from '../../entities/cart.entity';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetCartQuery)
export class GetCartHandler implements IQueryHandler<GetCartQuery> {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepo: Repository<Cart>,
    ) { }

    async execute(query: GetCartQuery): Promise<Cart> {
        const cart = await this.cartRepo.findOne({
            where: { id: query.cartId },
            relations: ['items'],
        });
        if (!cart) {
            throw new NotFoundException(`Không tìm thấy giỏ hàng: ${query.cartId}`);
        }
        return cart;
    }
}
