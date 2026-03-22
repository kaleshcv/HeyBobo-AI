import { LoggerService } from '@nestjs/common';
import { logger } from './winston.config';

/**
 * NestJS LoggerService adapter backed by Winston.
 * Plugs into NestFactory.create({ logger: new WinstonLoggerService() })
 */
export class WinstonLoggerService implements LoggerService {
  log(message: string, context?: string) {
    logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    logger.error(message, { context, stack: trace });
  }

  warn(message: string, context?: string) {
    logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    logger.verbose(message, { context });
  }
}
