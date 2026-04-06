import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { AuthModule } from '../auth/auth.module';
import { CustomerController } from './customer.controller';

import { CqrsModule } from '@nestjs/cqrs';
import { RegisterCustomerHandler } from './commands/register-customer/register-customer.handler';

@Module({
    imports: [
        AuthModule,
        CqrsModule,
        TypeOrmModule.forFeature([Customer])
    ],
    controllers: [CustomerController],
    providers: [
        RegisterCustomerHandler,
    ],
    exports: [TypeOrmModule], // Export để Auth Module có thể dùng Repository
})
export class CustomerModule { }
