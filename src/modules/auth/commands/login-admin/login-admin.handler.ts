import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { LoginAdminCommand } from './login-admin.command';
import { AuthIdentity } from '../../entities/auth-identity.entity';
import { PasswordHasherService } from '../../services/password-hasher.service';

@CommandHandler(LoginAdminCommand)
export class LoginAdminHandler implements ICommandHandler<LoginAdminCommand> {
    constructor(
        @InjectRepository(AuthIdentity)
        private readonly authIdentityRepo: Repository<AuthIdentity>,
        private readonly passwordHasher: PasswordHasherService,
    ) { }

    async execute(command: LoginAdminCommand) {
        const { dto } = command;

        // 1. Tìm danh tính (Chỉ tìm loại admin)
        const identity = await this.authIdentityRepo.findOne({
            where: { identifier: dto.email, actorType: 'admin' },
            select: ['id', 'actorId', 'actorType', 'passwordHash']
        });

        // 2. Kiểm tra mật khẩu
        if (!identity || !(await this.passwordHasher.comparePassword(dto.password, identity.passwordHash))) {
            throw new UnauthorizedException('Invalid admin credentials');
        }

        // 3. Trả về thông tin để Controller thực hiện Session Login
        return {
            userId: identity.actorId,
            type: identity.actorType,
        };
    }
}
