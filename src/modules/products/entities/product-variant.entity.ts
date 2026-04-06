import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { ProductOptionValue } from "./product-option-value.entity";
import { ProductImage } from "./product-image.entity";

@Entity()
export class ProductVariant {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    title: string; // VD: "Size L / Màu Đen"
    @Column({ unique: true })
    sku: string; // BẮT BUỘC: Mã kho hàng
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;
    @ManyToOne(() => Product, product => product.variants, { onDelete: 'CASCADE' })
    product: Product;
    @OneToMany(() => ProductOptionValue, value => value.variant, { cascade: true })
    optionValues: ProductOptionValue[];
    @ManyToMany(() => ProductImage, { cascade: true })
    @JoinTable()
    images: ProductImage[];
}