import { Controller, Get, UseGuards, Req, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AdminSessionGuard } from '../auth/infrastructure/guards/admin-session.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterAdminCommand } from './commands/register-admin/register-admin.command';

@Controller('users')
export class UserController {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly commandBus: CommandBus,
    ) { }

    @Post('register')
    async register(@Body() dto: RegisterAdminDto) {
        return this.commandBus.execute(new RegisterAdminCommand(dto));
    }

    @Get('me')
    @UseGuards(AdminSessionGuard)
    async getProfile(@Req() req: any) {
        return this.userRepo.findOne({ where: { id: req.user.id } });
    }
}
