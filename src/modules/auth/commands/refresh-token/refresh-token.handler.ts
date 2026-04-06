import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenCommand } from './refresh-token.command';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { AuthIdentity } from '../../entities/auth-identity.entity';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
    constructor(
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService,
    ) { }

    async execute(command: RefreshTokenCommand) {
        const { refreshToken: tokenValue } = command;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Tìm token trong Database
            const refreshToken = await queryRunner.manager.findOne(RefreshToken, {
                where: { token: tokenValue },
                relations: ['authIdentity'] // Lấy thông tin identity đi kèm
            });

            // 2. Kiểm tra tính hợp lệ
            if (!refreshToken || refreshToken.expiresAt < new Date()) {
                throw new UnauthorizedException('Invalid or expired refresh token');
            }

            const identity = refreshToken.authIdentity;

            // 3. Xóa token cũ (Xoay vòng - Token Rotation)
            await queryRunner.manager.remove(refreshToken);

            // 4. Tạo bộ Token mới
            const newAccessToken = this.jwtService.sign({
                sub: identity.actorId,
                type: identity.actorType
            });
            const newRefreshTokenValue = this.jwtService.sign(
                { sub: identity.id },
                { secret: 'REFRESH_SECRET', expiresIn: '7d' }
            );

            // 5. Lưu Refresh Token mới vào DB
            const newRefreshToken = queryRunner.manager.create(RefreshToken, {
                token: newRefreshTokenValue,
                authIdentityId: identity.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            await queryRunner.manager.save(newRefreshToken);

            await queryRunner.commitTransaction();

            return {
                access_token: newAccessToken,
                refresh_token: newRefreshTokenValue,
            };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
