import { Injectable, BadRequestException } from '@nestjs/common';
import { path } from 'app-root-path'; // Đảm bảo bạn đã cài thư mục gốc hoặc dùng process.cwd()
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // Nếu chưa có, hãy npm install uuid

@Injectable()
export class MediaService {
    private readonly uploadPath = `${process.cwd()}/uploads`;

    constructor() {
        // Tự động tạo folder /uploads nếu chưa có
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    async uploadImage(file: Express.Multer.File): Promise<string> {
        if (!file) throw new BadRequestException('No file uploaded');

        // Tạo tên file ngẫu nhiên để tránh trùng lặp (VD: a12b-34cd.jpg)
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${this.uploadPath}/${fileName}`;

        // Lưu file vật lý
        fs.writeFileSync(filePath, file.buffer);

        // Trả về URL để lưu vào Database (VD: /uploads/ten-file.jpg)
        return `/uploads/${fileName}`;
    }

    async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
        if (!files || files.length === 0) return [];

        // Sử dụng Promise.all để upload đồng loạt tất cả file
        const uploadPromises = files.map(file => this.uploadImage(file));
        return Promise.all(uploadPromises);
    }

    decorateUrl(path: string): string {
        const storageType = process.env.STORAGE_TYPE;
        const appUrl = process.env.APP_URL;
        if (storageType === 's3') {
            // ... code s3 ...
            return `https://cdn.yourstore.com/${path.replace(/^\//, '')}`;
        }
        // 🟢 Cách sửa nhanh nhất: Bỏ dấu / ở giữa vì path đã bắt đầu bằng /
        // Chỉnh từ `${appUrl}/${path}` thành `${appUrl}${path}`
        return `${appUrl}${path}`;
    }
}
