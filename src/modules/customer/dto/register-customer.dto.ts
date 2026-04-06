import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterCustomerDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;
}
