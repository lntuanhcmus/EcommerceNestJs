import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductOptionValue } from "./product-option-value.entity";
import { Product } from "./product.entity";

@Entity()
export class ProductOption {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    title: string; // VD: "Kích cỡ", "Màu sắc"
    @ManyToOne(() => Product, product => product.options, { onDelete: 'CASCADE' })
    product: Product;
    @OneToMany(() => ProductOptionValue, value => value.option, { cascade: true })
    values: ProductOptionValue[];
}