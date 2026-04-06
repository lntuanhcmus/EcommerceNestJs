import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { ProductOption } from "./product-option.entity";
import { ProductVariant } from "./product-variant.entity";
import { ProductImage } from "./product-image.entity";


@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    thumbnail: string | null

    @Column({ default: false })
    isPublished: boolean;
    // Price đã bị xóa! Nó sẽ nằm ở Variant.
    @OneToMany(() => ProductOption, option => option.product, { cascade: true })
    options: ProductOption[];
    @OneToMany(() => ProductVariant, variant => variant.product, { cascade: true })
    variants: ProductVariant[];
    @Column({ unique: true })
    handle: string;
    @ManyToMany(() => ProductImage, { cascade: true })
    @JoinTable() // Bắt buộc ở 1 phía của quan hệ ManyToMany
    images: ProductImage[];
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}