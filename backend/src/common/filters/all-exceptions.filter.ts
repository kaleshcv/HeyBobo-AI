import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '@/common/logger/winston.config';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof Error) {
      message = exception.message;
      logger.error('Unhandled exception', {
        context: 'AllExceptionsFilter',
        message: exception.message,
        stack: exception.stack,
        method: request.method,
        url: request.url,
        ip: request.ip,
        userId: request.headers['x-user-id'] || 'anonymous',
      });
    } else {
      logger.error('Unknown exception', {
        context: 'AllExceptionsFilter',
        exception: String(exception),
        method: request.method,
        url: request.url,
      });
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
