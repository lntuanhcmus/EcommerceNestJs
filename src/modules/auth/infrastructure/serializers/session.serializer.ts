import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
    // Lưu thông tin tối thiểu vào Session (thường là ID)
    serializeUser(user: any, done: (err: Error | null, user: any) => void): any {
        done(null, { id: user.userId, type: user.type });
    }

    // Lấy lại thông tin từ Session ra Request trong mỗi lần truy cập
    deserializeUser(payload: any, done: (err: Error | null, payload: string) => void): any {
        done(null, payload);
    }
}
