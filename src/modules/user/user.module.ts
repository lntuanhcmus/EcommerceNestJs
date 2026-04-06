import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';

import { AuthModule } from '../auth/auth.module';
import { RegisterAdminHandler } from './commands/register-admin/register-admin.handler';

@Module({
    imports: [
        AuthModule,
        CqrsModule,
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [
        UserController
    ],
    providers: [
        RegisterAdminHandler,
    ],
    exports: [TypeOrmModule],
})
export class UserModule { }
