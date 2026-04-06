import { Injectable, BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AuthIdentity } from '../entities/auth-identity.entity';
import { PasswordHasherService } from './password-hasher.service';

@Injectable()
export class AuthService {
    constructor(private readonly passwordHasher: PasswordHasherService) { }

    /**
     * Tạo một Identity mới bên trong một Transaction có sẵn
     */
    async createIdentity(
        manager: EntityManager,
        data: { email: string; password: string; actorId: string; actorType: 'customer' | 'admin' }
    ) {
        // 1. Kiểm tra xem Email đã tồn tại chưa (trong AuthIdentity)
        const existingIdentity = await manager.findOne(AuthIdentity, {
            where: { identifier: data.email, actorType: data.actorType }
        });

        if (existingIdentity) {
            throw new BadRequestException(`${data.actorType === 'admin' ? 'Admin' : 'Customer'} email already exists`);
        }

        // 2. Hash mật khẩu
        const passwordHash = await this.passwordHasher.hashPassword(data.password);

        // 3. Tạo và lưu Identity
        const authIdentity = manager.create(AuthIdentity, {
            identifier: data.email,
            passwordHash: passwordHash,
            actorId: data.actorId,
            actorType: data.actorType,
        });

        return manager.save(AuthIdentity, authIdentity);
    }
}
