import { LoginCustomerDto } from "../../dto/login-customer.dto";


export class LoginCustomerCommand {
    constructor(public readonly dto: LoginCustomerDto) { }
}
