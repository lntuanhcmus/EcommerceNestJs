export class CreateProductCommand {
    constructor(
        public readonly name: string,
        public readonly defaultPrice: number,
        public readonly options: any[],
        public readonly variants: any[],
        public readonly thumbnail?: string | null,
        public readonly images: string[] = [], // Thêm mảng URL ảnh Gallery
        public readonly categoryIds: string[] = [] // 🟢 Thêm danh sách ID danh mục
    ) { }
}
