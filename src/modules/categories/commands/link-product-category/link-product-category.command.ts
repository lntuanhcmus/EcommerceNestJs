export class LinkProductCategoryCommand {
    constructor(
        public readonly productId: string,
        public readonly categoryIds: string[]
    ) { }
}
