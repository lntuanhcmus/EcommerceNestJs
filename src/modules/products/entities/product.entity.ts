import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { ProductOption } from "./product-option.entity";
import { ProductVariant } from "./product-variant.entity";


@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    name: string;
    // Price đã bị xóa! Nó sẽ nằm ở Variant.
    @OneToMany(() => ProductOption, option => option.product, { cascade: true })
    options: ProductOption[];
    @OneToMany(() => ProductVariant, variant => variant.product, { cascade: true })
    variants: ProductVariant[];
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}