import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterAdminDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(10)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;
}
