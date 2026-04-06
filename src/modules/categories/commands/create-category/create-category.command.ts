export class CreateCategoryCommand {
    constructor(
        public readonly name: string,
        public readonly description?: string,
        public readonly parentId?: string // Link đến danh mục cha nếu có
    ) { }
}
