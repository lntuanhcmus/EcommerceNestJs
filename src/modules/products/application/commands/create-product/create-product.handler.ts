import { CommandHandler, ICommandHandler, EventBus, CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateProductCommand } from "./create-product.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductCreatedEvent } from "../../events/product-created.event";
import { Product } from "../../../entities/product.entity";
import { ProductVariant } from "../../../entities/product-variant.entity";
import slugify from 'slugify';
import { ProductImage } from "../../../entities/product-image.entity";
import { LinkProductCategoryCommand } from "src/modules/categories/commands/link-product-category/link-product-category.command";
import { GetProductCategoriesQuery } from "src/modules/categories/queries/get-product-categories/get-product-categories.command";

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(ProductVariant)
        private readonly variantRepo: Repository<ProductVariant>,

        private readonly eventBus: EventBus,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) { }

    async execute(command: CreateProductCommand): Promise<any> {
        // ==========================================
        // 🟢 BƯỚC 1: XỬ LÝ PHẦN TĨNH & MEDIA POOL
        // ==========================================
        const handle = await this.generateUniqueHandle(command.name);

        // Chuẩn bị mảng đối tượng ProductImage từ danh sách URL đã upload
        const imageEntities = (command.images || []).map(url => {
            const img = new ProductImage();
            img.url = url;
            return img;
        });

        const product = this.productRepository.create({
            name: command.name,
            handle: handle,
            thumbnail: command.thumbnail,
            options: command.options || [],
            images: imageEntities // Gán toàn bộ ảnh vào Gallery (Pool) của sản phẩm
        });

        // Lưu sản phẩm (TypeORM sẽ tự động lưu các ProductImage nhờ cascade: true)
        const savedProduct = await this.productRepository.save(product);

        // ==========================================
        // 🔴 BƯỚC 2: DỆT BIẾN THỂ & GÁN ẢNH TỪ POOL
        // ==========================================
        let variantsToSave: ProductVariant[] = [];

        if (!command.variants || command.variants.length === 0) {
            // Trường hợp 2.1: KHÔNG có Variant -> Tạo bản mặc định
            const defaultVariant = this.variantRepo.create({
                title: "Mặc định",
                sku: `DEFAULT-${Date.now()}`,
                price: command.defaultPrice || 0,
                product: savedProduct
            });
            variantsToSave.push(defaultVariant);
        } else {
            // Trường hợp 2.2: Có mảng Variant từ Admin gửi lên
            variantsToSave = command.variants.map(vPayload => {
                const variant = this.variantRepo.create({
                    title: vPayload.title,
                    sku: vPayload.sku,
                    price: vPayload.price,
                    product: savedProduct
                });

                // 🟢 GÁN ẢNH CHO BIẾN THỂ (Medusa Style)
                // Nhặt ảnh từ Pool (savedProduct.images) dựa trên mảng index gửi từ Client
                if (vPayload.imageIndices && Array.isArray(vPayload.imageIndices)) {
                    variant.images = vPayload.imageIndices
                        .map(index => savedProduct.images[index])
                        .filter(img => !!img); // Lọc bỏ giá trị undefined nếu index sai
                }

                // Logic gán OptionValue (Giữ nguyên)
                if (vPayload.optionValues) {
                    variant.optionValues = vPayload.optionValues.map((valPayload: any) => {
                        const matchedOption = savedProduct.options.find(
                            opt => opt.title === valPayload.optionTitle
                        );
                        return {
                            value: valPayload.value,
                            option: matchedOption
                        };
                    });
                }
                return variant;
            });
        }

        // Lưu toàn bộ Biến thể xuống DB
        await this.variantRepo.save(variantsToSave);

        // ==========================================
        // 🔵 BƯỚC 3: PHÁT EVENT & TRẢ KẾT QUẢ
        // ==========================================
        const variantPayloads = variantsToSave.map(v => {
            const originalPayload = command.variants?.find(cmdV => cmdV.sku === v.sku);
            return {
                sku: v.sku,
                stockQuantity: originalPayload?.stockQuantity || 0
            };
        });

        this.eventBus.publish(new ProductCreatedEvent(savedProduct.id, variantPayloads));

        // Ở cuối hàm execute, trước khi return savedProduct:
        if (command.categoryIds && command.categoryIds.length > 0) {
            await this.commandBus.execute(
                new LinkProductCategoryCommand(savedProduct.id, command.categoryIds)
            );
        }

        let categories = [];
        if (command.categoryIds && command.categoryIds.length > 0) {
            categories = await this.queryBus.execute(
                new GetProductCategoriesQuery(savedProduct.id)
            );
        }

        return { ...savedProduct, categories };
    }

    /**
     * Hàm sinh Handle duy nhất (Unique Slug)
     */
    private async generateUniqueHandle(name: string): Promise<string> {
        const baseSlug = slugify(name, {
            lower: true,
            strict: true,
            locale: 'vi'
        });

        let slug = baseSlug;
        let isUnique = false;
        let counter = 1;

        while (!isUnique) {
            const existing = await this.productRepository.findOne({ where: { handle: slug } });
            if (!existing) {
                isUnique = true;
            } else {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
        }
        return slug;
    }
}
