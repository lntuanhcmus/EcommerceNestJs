import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { AddToCartCommand } from './add-to-cart.command';
import { Cart } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { GetProductVariantByIdQuery } from 'src/modules/products/queries/get-product-variant-by-id/get-product-variant-by-id.query';

@CommandHandler(AddToCartCommand)
export class AddToCartHandler implements ICommandHandler<AddToCartCommand> {
    constructor(
        @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
        @InjectRepository(CartItem) private readonly itemRepo: Repository<CartItem>,
        private readonly queryBus: QueryBus,
    ) { }

    async execute(command: AddToCartCommand): Promise<Cart> {
        const { cartId, variantId, quantity } = command;

        // 1. Tìm giỏ hàng (nạp kèm danh sách items để kiểm tra trùng)
        const cart = await this.cartRepo.findOne({
            where: { id: cartId },
            relations: ['items'],
        });
        if (!cart) throw new BadRequestException('Giỏ hàng không tồn tại.');

        // 2. Lấy thông tin giá & tồn kho từ Product Module thông qua QueryBus
        const variant = await this.queryBus.execute(new GetProductVariantByIdQuery(variantId));
        if (!variant) throw new BadRequestException('Sản phẩm không tồn tại.');

        // 3. Xử lý logic gộp món hàng (Upsert)
        let item = cart.items.find((i) => i.variantId === variantId);

        if (item) {
            // Nếu đã có -> Tăng số lượng
            item.quantity += quantity;
        } else {
            // Nếu món mới -> Tạo record mới & Chốt giá (Snapshot price)
            item = this.itemRepo.create({
                cartId,
                variantId,
                quantity,
                unitPrice: variant.price, // Chốt giá ngay tại đây!
            });
            cart.items.push(item);
        }

        // 4. Lưu lại (Cơ chế Cascade sẽ tự động lưu CartItem)
        return this.cartRepo.save(cart);
    }
}
