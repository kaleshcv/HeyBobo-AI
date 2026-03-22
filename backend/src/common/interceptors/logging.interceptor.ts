import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { logger } from '@/common/logger/winston.config';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = request.headers['x-user-id'] || 'anonymous';

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        logger.info(`${method} ${url} ${response.statusCode} ${delay}ms`, {
          context: 'HTTP',
          method,
          url,
          statusCode: response.statusCode,
          duration: delay,
          ip,
          userAgent,
          userId,
        });
      }),
      catchError((err) => {
        const delay = Date.now() - now;
        logger.error(`${method} ${url} ERROR ${delay}ms — ${err.message}`, {
          context: 'HTTP',
          method,
          url,
          duration: delay,
          ip,
          userId,
          stack: err.stack,
        });
        return throwError(() => err);
      }),
    );
  }
}
