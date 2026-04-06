import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // Thêm '||' để đảm bảo không bao giờ bị undefined
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret',
        });
    }

    // Hàm này chạy sau khi Token đã được giải mã thành công
    async validate(payload: any) {
        // Trả về thông tin người dùng để NestJS gắn vào request.user
        return {
            userId: payload.sub,
            email: payload.email,
            type: payload.type
        };
    }
}
