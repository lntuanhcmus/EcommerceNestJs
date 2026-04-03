// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import mới
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BullModule } from '@nestjs/bullmq';
import { CartModule } from './modules/cart/cart.module';
import { CheckoutModule } from './modules/checkout/checkout.module';

@Module({
  imports: [
    // 1. Phải nạp ConfigModule lên hàng đầu tiên để quét file .env!
    ConfigModule.forRoot({ isGlobal: true }),

    // DÒNG NÀY LÀ THIẾT LẬP KẾT NỐI REDIS GLOBALLY
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),


    // 2. Thay vì forRoot, nay ta xài forRootAsync để chờ nhau
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Nạp kho đồ nghề
      inject: [ConfigService], // Inject thằng lấy đồ nghề

      // Factory (Xưởng) này sẽ lấy thông số dựa vào file .env
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'), // Số thì parse ra số
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Vẫn xài tạm môi trường Dev để tự sinh bảng
      }),
    }),

    ProductsModule,
    OrdersModule,
    CartModule,
    CheckoutModule
  ],
})
export class AppModule { }
