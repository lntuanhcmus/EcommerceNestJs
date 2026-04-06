import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AdminSessionGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        // Kiểm tra xem Passport đã xác thực session này chưa
        return request.isAuthenticated() && request.user.type === 'admin';
    }
}
