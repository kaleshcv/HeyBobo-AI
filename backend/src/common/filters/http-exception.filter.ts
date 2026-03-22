import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '@/common/logger/winston.config';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Internal server error';
    let errors: string[] = [];

    if (typeof exceptionResponse === 'object') {
      const body = exceptionResponse as any;
      message = body.message || message;
      errors = Array.isArray(body.message) ? body.message : [];
    }

    const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    logger.log(logLevel, `HTTP ${status} ${request.method} ${request.url} — ${message}`, {
      context: 'HttpExceptionFilter',
      statusCode: status,
      method: request.method,
      url: request.url,
      ip: request.ip,
      errors: errors.length ? errors : undefined,
      userId: request.headers['x-user-id'] || 'anonymous',
    });

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
