// src/modules/products/commands/create-product/create-product.command.ts
export class CreateProductCommand {
    constructor(
        public readonly name: string,
        // Dành cho trường hợp Product MỘT MÌNH (Không có Options/Phân loại)
        public readonly defaultPrice?: number,

        // Dành cho trường hợp Product có MA TRẬN 
        public readonly options?: any[],
        public readonly variants?: any[],
    ) { }
}