import { Controller, Post, Body, Req } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { LoginCustomerCommand } from './commands/login-customer/login-customer.command';
import { RefreshTokenCommand } from './commands/refresh-token/refresh-token.command';
import { LoginAdminCommand } from './commands/login-admin/login-admin.command';
import { LoginAdminDto } from './dto/login-admin.dto';
import { AuthIdentity } from './entities/auth-identity.entity'; // This may not be needed anymore depending on use
@Controller() 
export class AuthController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post('login')
    async login(@Body() dto: LoginCustomerDto) {
        return this.commandBus.execute(new LoginCustomerCommand(dto));
    }

    @Post('refresh')
    async refresh(@Body('refresh_token') token: string) {
        return this.commandBus.execute(new RefreshTokenCommand(token));
    }

    @Post('admin/login')
    async loginAdmin(@Body() dto: LoginAdminDto, @Req() req: any) {
        // 1. Chạy Command để xác thực Admin
        const user = await this.commandBus.execute(new LoginAdminCommand(dto));
        // 2. Yêu cầu Passport ghi nhớ user này vào Session (Redis)
        return new Promise((resolve, reject) => {
            req.logIn(user, (err) => {
                if (err) return reject(err);
                resolve({ message: 'Admin logged in successfully' });
            });
        });
    }
}
