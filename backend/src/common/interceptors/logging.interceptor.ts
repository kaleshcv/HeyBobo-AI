import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { logger, httpLogger } from '@/common/logger/winston.config';

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
        const meta = {
          context: 'HTTP',
          method,
          url,
          statusCode: response.statusCode,
          duration: delay,
          ip,
          userAgent,
          userId,
        };
        // Write to console + app log via main logger
        logger.info(`${method} ${url} ${response.statusCode} ${delay}ms`, meta);
        // Write to dedicated HTTP access log
        httpLogger.info(`${method} ${url} ${response.statusCode} ${delay}ms`, meta);
      }),
      catchError((err) => {
        const delay = Date.now() - now;
        const meta = {
          context: 'HTTP',
          method,
          url,
          duration: delay,
          ip,
          userId,
          stack: err.stack,
        };
        logger.error(`${method} ${url} ERROR ${delay}ms — ${err.message}`, meta);
        httpLogger.error(`${method} ${url} ERROR ${delay}ms — ${err.message}`, meta);
        return throwError(() => err);
      }),
    );
  }
}
