import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    customerId: string; // Để null nếu là khách vãng lai

    @Column({ nullable: true })
    email: string;

    // Thuận tiện cho việc quản lý vòng đời giỏ hàng
    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date; // Nếu có giá trị -> Giỏ hàng này đã biến thành Order

    @OneToMany(() => CartItem, (item) => item.cart, { cascade: true, eager: true })
    items: CartItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
