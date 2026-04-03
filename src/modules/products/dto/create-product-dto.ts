// src/modules/products/dto/create-product.dto.ts
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class CreateProductDto {
    @IsString({ message: "Tên sản phẩm phải là một chuỗi văn bản" })
    @IsNotEmpty({ message: "Tên sản phẩm không được để trống" })
    name: string;
    @IsOptional() // Giờ đây Price có thể không cần gửi lên nếu có Matrix Variant
    @IsNumber({}, { message: "Giá tiền mặc định phải là số" })
    @Min(0, { message: "Hàng bán không thể có giá âm" })
    defaultPrice?: number;
    @IsOptional()
    @IsArray()
    options?: any[]; // Mảng Tùy chọn (Color, Size...)
    @IsOptional()
    @IsArray()
    variants?: any[]; // Ma trận Biến Thể
}