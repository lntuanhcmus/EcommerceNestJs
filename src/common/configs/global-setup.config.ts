import { INestApplication, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from '../../common/filters/global-exception.filter';

export function setupGlobalConfig(app: INestApplication) {
    // Bật máy soi chiếu ở cửa ngõ
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true, // Tự động chuyển đổi kiểu dữ liệu trong DTO
    }));

    // Gắn phễu lọc lỗi
    app.useGlobalFilters(new GlobalExceptionFilter());
}
