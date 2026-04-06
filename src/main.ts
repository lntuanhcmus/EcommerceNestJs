import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSession } from './common/configs/session.config';
import { setupGlobalConfig } from './common/configs/global-setup.config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Cấu hình Session & Redis
  await setupSession(app);

  // Cấu hình để truy cập ảnh qua URL: http://localhost:3000/uploads/ten-anh.jpg
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // 2. Cấu hình Pipes & Filters
  setupGlobalConfig(app);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
