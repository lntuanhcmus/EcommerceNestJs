import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductOption } from "./product-option.entity";
import { ProductVariant } from "./product-variant.entity";

@Entity()
export class ProductOptionValue {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    value: string; // VD: "L", "Đen"
    @ManyToOne(() => ProductOption, option => option.values, { onDelete: 'CASCADE' })
    option: ProductOption;
    @ManyToOne(() => ProductVariant, variant => variant.optionValues, { onDelete: 'CASCADE' })
    variant: ProductVariant;
}