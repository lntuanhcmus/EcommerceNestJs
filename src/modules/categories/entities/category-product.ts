import { Column, Entity, PrimaryGeneratedColumn, Index } from "typeorm";

@Entity()
export class CategoryProduct {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index() // Index để tìm kiếm theo Sản phẩm nhanh hơn
    productId: string;

    @Column()
    @Index() // Index để tìm kiếm theo Danh mục nhanh hơn
    categoryId: string;
}
