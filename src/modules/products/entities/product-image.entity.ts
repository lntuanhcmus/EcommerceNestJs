import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class ProductImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ type: 'text' })
    url: string;
}