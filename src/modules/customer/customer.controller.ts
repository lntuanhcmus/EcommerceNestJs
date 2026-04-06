import { Controller, Get, UseGuards, Req, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerJwtGuard } from '../auth/infrastructure/guards/customer-jwt.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { RegisterCustomerCommand } from './commands/register-customer/register-customer.command';

@Controller('customers')
export class CustomerController {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepo: Repository<Customer>,
        private readonly commandBus: CommandBus,
    ) { }

    @Post('register')
    async register(@Body() dto: RegisterCustomerDto) {
        return this.commandBus.execute(new RegisterCustomerCommand(dto));
    }

    @Get('me')
    @UseGuards(CustomerJwtGuard)
    async getProfile(@Req() req: any) {
        return this.customerRepo.findOne({ where: { id: req.user.userId } });
    }
}
