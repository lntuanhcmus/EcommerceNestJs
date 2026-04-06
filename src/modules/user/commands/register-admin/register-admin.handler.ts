import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { RegisterAdminCommand } from './register-admin.command';
import { PasswordHasherService } from 'src/modules/auth/services/password-hasher.service';
import { User } from '../../entities/user.entity';
import { AuthIdentity } from 'src/modules/auth/entities/auth-identity.entity';
import { AuthService } from 'src/modules/auth/services/auth.service';

@CommandHandler(RegisterAdminCommand)
export class RegisterAdminHandler implements ICommandHandler<RegisterAdminCommand> {
    constructor(
        private readonly dataSource: DataSource,
        private readonly authService: AuthService
    ) { }

    async execute(command: RegisterAdminCommand) {
        const { dto } = command;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Kiểm tra email đã tồn tại hay chưa
            const existingAdmin = await queryRunner.manager.findOne(User, { where: { email: dto.email } });
            if (existingAdmin) {
                throw new ConflictException('Admin with this email already exists');
            }

            // 2. Tạo Profile Admin (Bảng User)
            const user = queryRunner.manager.create(User, {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                role: 'admin',
            });
            const savedUser = await queryRunner.manager.save(User, user) as User;

            // 3. Gọi AuthService để lưu mật khẩu (bảng auth_identities)
            await this.authService.createIdentity(queryRunner.manager, {
                email: dto.email,
                password: dto.password,
                actorId: savedUser.id,
                actorType: 'admin'
            });

            await queryRunner.commitTransaction();

            return {
                message: 'Admin registered successfully',
                id: savedUser.id,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof ConflictException) throw error;
            throw new InternalServerErrorException('Failed to register admin: ' + error.message);
        } finally {
            await queryRunner.release();
        }
    }
}
