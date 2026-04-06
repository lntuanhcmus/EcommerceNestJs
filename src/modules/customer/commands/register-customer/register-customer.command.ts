import { RegisterCustomerDto } from '../../dto/register-customer.dto';

export class RegisterCustomerCommand {
    constructor(public readonly dto: RegisterCustomerDto) { }
}
