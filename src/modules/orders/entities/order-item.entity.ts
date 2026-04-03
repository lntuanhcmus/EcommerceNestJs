import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    variantId: string; // SKU code / Variant ID

    @Column()
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number; // Lưu cái giá tại đúng thời điểm mua!

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    order: Order; // Cái cọc để neo vào Hóa Đơn Mẹ
}
