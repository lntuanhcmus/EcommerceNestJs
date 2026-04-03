import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { CreateProductCommand } from "./create-product.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "../../entities/product.entity";
import { Repository } from "typeorm";
import { ProductVariant } from "../../entities/product-variant.entity";
import { ProductCreatedEvent } from "../../events/product-created.event";

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(ProductVariant)
        private readonly variantRepo: Repository<ProductVariant>,

        private readonly eventBus: EventBus
    ) { }
    async execute(command: CreateProductCommand) {
        // ==========================================
        // 🟢 NHỊP 1: LƯU PHẦN TĨNH (PRODUCT & OPTIONS)
        // ==========================================
        const product = this.productRepository.create({
            name: command.name,
            options: command.options || [] // VD: [{title: 'Size'}, {title: 'Color'}]
        });
        // Lúc này TypeORM xông xuống DB cắm điện. Postgres sẽ rặn ra ID cho Product và các ID cho mảng Options.
        const savedProduct = await this.productRepository.save(product);

        // ==========================================
        // 🔴 NHỊP 2: DỆT MA TRẬN VARIANT & BẢNG CẦU NỐI (OPTION_VALUES)
        // ==========================================
        let variantsToSave: ProductVariant[] = [];
        if (!command.variants || command.variants.length === 0) {
            // Trường hợp 2.1: KHÔNG có Variant -> Đẻ bảng Mặc Định
            const defaultVariant = this.variantRepo.create({
                title: "Mặc định",
                sku: `DEFAULT-${Date.now()}`,
                price: command.defaultPrice || 0,
                product: savedProduct // CỰC KỲ QUAN TRỌNG: Móc khóa ngoại về Product cha nãy vừa đẻ
            });
            variantsToSave.push(defaultVariant);

        } else {
            // Trường hợp 2.2: User gửi lên 1 Ma Trận Variant Xịn
            variantsToSave = command.variants.map(variantPayload => {

                // A. Tạo vỏ Variant vật lý
                const variant = this.variantRepo.create({
                    title: variantPayload.title,
                    sku: variantPayload.sku,
                    price: variantPayload.price,
                    product: savedProduct // Chân nối 1: Móc về Thẻ Product
                });
                // B. Trí Tuệ Móc Nối Bảng Ngã Tư (ProductOptionValue)
                if (variantPayload.optionValues) {
                    variant.optionValues = variantPayload.optionValues.map(valPayload => {

                        // Chiêu lừa RAM: Tìm cái thẻ Option nãy vừa tạo ở Nhịp 1 có tên trùng khớp (VD: 'Size')
                        const matchedOption = savedProduct.options.find(
                            opt => opt.title === valPayload.optionTitle
                        );
                        return {
                            value: valPayload.value, // (Ví dụ: "Màu Đỏ", "Size L")
                            option: matchedOption    // Chân nối 2: Áp thẳng thẻ ID Option Nhịp 1 vào đây!
                        };
                    });
                }
                return variant;
            });
        }
        // ==========================================
        // 🟢 CHỐT MẠCH: LƯU TOÀN BỘ CỤC VARIANT XUỐNG DB
        // ==========================================
        // TypeORM sẽ tự động dệt mảng Variants chung với mảng OptionValues vào DB cực mượt bằng Multi-Insert
        await this.variantRepo.save(variantsToSave);
        console.log('✅ Đã dệt xong Ma Trận Cây Sản Phẩm (2-Phase Save):', savedProduct.id);
        const variantPayloads = variantsToSave.map(v => {
            // MÓC LẠI DỮ LIỆU GỐC MÀ ÔNG SELLER VỪA GÕ TỪ FRONTEND TRUYỀN LÊN
            const originalPayload = command.variants?.find(cmdV => cmdV.sku === v.sku);
            return {
                sku: v.sku,
                // Lấy Cục Vàng Tồn Kho gõ từ bàn phím nhét vô. Nếu Frontend lười không gửi, cho mặc định = 0.
                stockQuantity: originalPayload?.stockQuantity || 0
            };
        });

        this.eventBus.publish(new ProductCreatedEvent(savedProduct.id, variantPayloads));

        return savedProduct;
    }
}