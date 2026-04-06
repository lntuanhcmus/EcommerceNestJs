import { RegisterAdminDto } from "../../dto/register-admin.dto";

export class RegisterAdminCommand {
    constructor(public readonly dto: RegisterAdminDto) { }
}
