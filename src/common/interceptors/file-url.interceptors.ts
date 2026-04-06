import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { MediaService } from '../../modules/media/media.service';

@Injectable()
export class FileUrlInterceptor implements NestInterceptor {
    constructor(private readonly mediaService: MediaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => {
                // Đệ quy qua toàn bộ dữ liệu trả về để tìm và sửa URL
                return this.transform(data);
            }),
        );
    }

    private transform(data: any): any {
        if (!data) return data;

        // Nếu là Mảng (ví dụ: Danh sách sản phẩm)
        if (Array.isArray(data)) {
            return data.map(item => this.transform(item));
        }

        // Nếu là Object (ví dụ: Chi tiết sản phẩm)
        if (typeof data === 'object') {
            const newData = { ...data };

            for (const key in newData) {
                const value = newData[key];

                // 🟢 QUY TẮC: Nếu Key là 'url' hoặc 'thumbnail' và có giá trị chuỗi
                if ((key === 'url' || key === 'thumbnail') && typeof value === 'string') {
                    newData[key] = this.mediaService.decorateUrl(value);
                }
                // 🟡 ĐỆ QUY tiếp nếu gặp Object/Array bên trong (như variants, images...)
                else if (typeof value === 'object') {
                    newData[key] = this.transform(value);
                }
            }
            return newData;
        }

        return data;
    }
}
