import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { LoginCustomerCommand } from './login-customer.command';
import { AuthIdentity } from '../../entities/auth-identity.entity';
import { PasswordHasherService } from '../../services/password-hasher.service';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { DataSource } from 'typeorm';

@CommandHandler(LoginCustomerCommand)
export class LoginCustomerHandler implements ICommandHandler<LoginCustomerCommand> {
    constructor(
        @InjectRepository(AuthIdentity)
        private readonly authIdentityRepo: Repository<AuthIdentity>,
        private readonly passwordHasher: PasswordHasherService,
        private readonly jwtService: JwtService,
        private readonly dataSource: DataSource,
    ) { }

    async execute(command: LoginCustomerCommand) {
        const { dto } = command;

        // 1. Tìm danh tính (Phải dùng select để lấy passwordHash ra)
        const identity = await this.authIdentityRepo.findOne({
            where: { identifier: dto.email, actorType: 'customer' },
            select: ['id', 'actorId', 'actorType', 'passwordHash', 'identifier'] // Thêm dòng này
        });


        // 2. Kiểm tra mật khẩu
        if (!identity || !(await this.passwordHasher.comparePassword(dto.password, identity.passwordHash))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 3. Tạo JWT Payload (Medusa v2 thường để actor_id vào sub)
        const payload = {
            sub: identity.actorId,
            email: identity.identifier,
            type: identity.actorType
        };

        // 3. Tạo Access Token (Ngắn hạn - 1h)
        const accessToken = this.jwtService.sign(payload);
        const refreshTokenValue = this.jwtService.sign(
            { sub: identity.id },
            { secret: 'REFRESH_SECRET', expiresIn: '7d' }
        );

        // 5. Lưu Refresh Token vào Database
        const refreshTokenRepo = this.dataSource.getRepository(RefreshToken);
        const newRefreshToken = refreshTokenRepo.create({
            token: refreshTokenValue,
            authIdentityId: identity.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày sau
        });
        await refreshTokenRepo.save(newRefreshToken);
        return {
            access_token: accessToken,
            refresh_token: refreshTokenValue,
        };
    }
}
