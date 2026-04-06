import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('auth_identities')
@Unique(['identifier', 'actorType']) // Tránh việc một email đăng ký làm cả customer và admin nếu ta muốn tách rời
export class AuthIdentity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    identifier: string; // Thường là email

    @Column({ select: false }) // Ẩn mật khẩu khi query thông thường để bảo mật
    passwordHash: string;

    @Column()
    actorId: string; // ID của Customer hoặc User (Admin)

    @Column({ default: 'customer' })
    actorType: 'customer' | 'admin';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
