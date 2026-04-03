// Sửa phần DTO
import { IsNotEmpty, IsNumber, IsString, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
    @IsString() @IsNotEmpty()
    variantId: string;

    @IsNumber() @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[]; // Lưới hứng mảng
}
