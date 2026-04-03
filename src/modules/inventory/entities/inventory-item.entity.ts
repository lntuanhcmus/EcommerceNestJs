import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class InventoryItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ unique: true })
    sku: string; // Sợi dây huyết mạch liên kết với ProductVariant bên kia! Không bao giờ dùng Foreign Key (Khoá ngoại) ở đây.
    @Column({ type: 'int', default: 0 })
    stockedQuantity: number; // Số lượng tồn kho vật lý (Đếm bằng tay trong nhà kho)
    @Column({ type: 'int', default: 0 })
    reservedQuantity: number; // MẤU CHỐT KIẾN TRÚC: Hàng bị Giữ Chỗ (Có khách bỏ Giỏ chưa trả tiền, hoặc Đang chờ Giao hàng)
    // Một ảo giác (Getter) cho hệ thống biết THỰC SỰ CÒN BAO NHIÊU ĐỂ BÁN
    get availableQuantity(): number {
        return this.stockedQuantity - this.reservedQuantity;
    }
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}