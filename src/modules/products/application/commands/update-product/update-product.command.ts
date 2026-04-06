import { UpdateProductDto } from "../../../api/admin/dto/update-product.dto";

export class UpdateProductCommand {
    constructor(
        public readonly id: string,
        public readonly dto: UpdateProductDto
    ) { }
}
