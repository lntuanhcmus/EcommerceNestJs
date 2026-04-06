import { IsString, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';

export class UpdateVariantDto {
    @IsOptional() @IsString()
    id?: string; // Nếu có ID thì là cập nhật, không có là tạo mới

    @IsOptional() @IsString()
    title?: string;

    @IsOptional() @IsString()
    sku?: string;

    @IsOptional() @IsNumber()
    price?: number;
}

export class UpdateProductDto {
    @IsOptional() @IsString()
    name?: string;

    @IsOptional() @IsString()
    thumbnail?: string;

    @IsOptional() @IsBoolean()
    isPublished?: boolean;

    @IsOptional() @IsArray()
    variants?: UpdateVariantDto[];
}
