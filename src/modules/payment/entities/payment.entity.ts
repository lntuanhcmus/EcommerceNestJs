import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum PaymentStatus {
    PENDING = 'PENDING',
    CAPTURED = 'CAPTURED',
    REFUNDED = 'REFUNDED',
    FAILED = 'FAILED',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    cartId: string;

    @Column('decimal')
    amount: number;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @CreateDateColumn()
    createdAt: Date;
}
