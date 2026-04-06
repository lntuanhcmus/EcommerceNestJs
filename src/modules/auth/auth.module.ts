import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthIdentity } from './entities/auth-identity.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { PasswordHasherService } from './services/password-hasher.service';
import { LoginCustomerHandler } from './commands/login-customer/login-customer.handler';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenHandler } from './commands/refresh-token/refresh-token.handler';
import { SessionSerializer } from './infrastructure/serializers/session.serializer';
import { LoginAdminHandler } from './commands/login-admin/login-admin.handler';
import { AuthService } from './services/auth.service';

export const CommandHandlers = [
    LoginCustomerHandler,
    RefreshTokenHandler,
    LoginAdminHandler
]

@Module({
    imports: [
        TypeOrmModule.forFeature([AuthIdentity, RefreshToken]),
        CqrsModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                // Thêm fallback để đảm bảo secret luôn là string
                secret: config.get<string>('JWT_SECRET') || 'default_secret',
                signOptions: {
                    // Ép kiểu sang any để bỏ qua kiểm tra nghiêm ngặt của JwtModule
                    expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '1h') as any,
                },
            }),
        }),
    ],
    controllers: [
        AuthController
    ],
    providers: [
        PasswordHasherService,
        JwtStrategy,
        SessionSerializer,
        AuthService,
        ...CommandHandlers
    ],
    exports: [
        PasswordHasherService,
        TypeOrmModule,
        AuthService
    ]
})
export class AuthModule { }
