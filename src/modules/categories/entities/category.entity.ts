import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    handle: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    // QUAN HỆ TỰ THAM CHIẾU (TREE STRUCTURE)
    @ManyToOne(() => Category, category => category.children, { nullable: true, onDelete: 'CASCADE' })
    parent: Category;

    @OneToMany(() => Category, category => category.parent)
    children: Category[];
}
