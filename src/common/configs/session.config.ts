import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import passport from 'passport';
import { createClient } from 'redis';

export async function setupSession(app: INestApplication) {
    const configService = app.get(ConfigService);

    // Khởi tạo Redis
    const redisClient = createClient({
        url: `redis://${configService.get('REDIS_HOST') || 'localhost'}:${configService.get('REDIS_PORT') || 6379}`,
    });
    redisClient.connect().catch(console.error);

    const redisStore = new RedisStore({
        client: redisClient,
        prefix: "medusa_sess:",
    });

    // Cấu hình Session
    app.use(
        session({
            store: redisStore,
            secret: configService.get<string>('SESSION_SECRET') || 'default_fallback_secret',
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 3600000 * 24, // 24h
                httpOnly: true,
                // secure: true, // Bật lên khi dùng HTTPS (Production)
            },
        }),
    );

    // Kích hoạt Passport Session
    app.use(passport.initialize());
    app.use(passport.session());
}
