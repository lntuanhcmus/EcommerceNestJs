import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { RegisterCustomerCommand } from './register-customer.command';
import { Customer } from '../../entities/customer.entity';
import { AuthService } from '../../../auth/services/auth.service'; // Import AuthService

@CommandHandler(RegisterCustomerCommand)
export class RegisterCustomerHandler implements ICommandHandler<RegisterCustomerCommand> {
    constructor(
        private readonly dataSource: DataSource,
        private readonly authService: AuthService, // Inject AuthService thay vì Hasher và Repository
    ) { }

    async execute(command: RegisterCustomerCommand) {
        const { dto } = command;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Tạo Customer profile (bảng customers)
            const customer = queryRunner.manager.create(Customer, {
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
            });
            const savedCustomer = await queryRunner.manager.save(Customer, customer) as Customer;

            // 2. Gọi AuthService để tạo Identity (bảng auth_identities)
            // AuthService sẽ tự kiểm tra trùng lặp email và băm mật khẩu cho bạn
            await this.authService.createIdentity(queryRunner.manager, {
                email: dto.email,
                password: dto.password,
                actorId: savedCustomer.id,
                actorType: 'customer',
            });

            await queryRunner.commitTransaction();

            return savedCustomer;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
