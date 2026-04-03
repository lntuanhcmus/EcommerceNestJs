import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    cartId: string;

    @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cartId' })
    cart: Cart;

    @Column()
    variantId: string; // Chỉ lưu ID của Product Variant để tránh dính chặt vào Product Module

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    unitPrice: number; // Snapshot giá tại thời điểm cho vào giỏ

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>; // Lưu thông tin tùy biến (màu sắc, size, quà tặng kèm...)
}
