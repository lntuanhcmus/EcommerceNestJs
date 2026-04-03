// src/common/filters/global-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

// Decorator @Catch() không tham số nghĩa là: Bắt toàn bộ TẤT CẢ các loại lỗi trên đời
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // 1. Phân loại lỗi (Có khai báo vs Không lường trước)
        const status =
            exception instanceof HttpException
                ? exception.getStatus() // Nếu là lỗi 400 Bad Request, hay 404 Not Found từ Nest
                : HttpStatus.INTERNAL_SERVER_ERROR; // Còn lại nếu code sập (như rớt DB), mặc định 500

        // 2. Chọc vào cái cục BadRequest bóc lấy cái mảng lỗi Validation
        let errorTitle = 'Internal Server Error';
        let validationDetails = null;

        if (exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse() as any;
            errorTitle = exceptionResponse.error || exception.message;
            validationDetails = exceptionResponse.message; // Lôi cái mảng ["Hàng không được âm"] vào đây
        } else {
            // Lỗi hệ thống sâu, in log đỏ ra terminal để Dev debug 
            console.error('Lỗi sập Server tự bắt được:', exception);
        }

        // 3. Quy chuẩn hóa JSON Response trả về cho Frontend
        response.status(status).json({
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: errorTitle,
            details: validationDetails, // Dồn chi tiết mảng lỗi vào key này
        });
    }
}
