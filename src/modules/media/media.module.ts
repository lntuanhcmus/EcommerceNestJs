import { Module } from '@nestjs/common';
import { MediaService } from './media.service';

@Module({
    providers: [MediaService],
    exports: [MediaService], // Chỉ export Service cho các module khác dùng
})
export class MediaModule { }
