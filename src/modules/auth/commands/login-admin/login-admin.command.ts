import { LoginAdminDto } from '../../dto/login-admin.dto';

export class LoginAdminCommand {
    constructor(public readonly dto: LoginAdminDto) { }
}
