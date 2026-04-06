import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginAdminDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(10, { message: 'Admin password should be at least 10 characters for better security' })
    password: string;
}
