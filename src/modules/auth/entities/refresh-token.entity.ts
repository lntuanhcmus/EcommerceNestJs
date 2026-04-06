import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AuthIdentity } from './auth-identity.entity';

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    token: string; // Token được mã hóa hoặc chuỗi ngẫu nhiên

    @Column()
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    authIdentityId: string;

    @ManyToOne(() => AuthIdentity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'authIdentityId' })
    authIdentity: AuthIdentity;
}
