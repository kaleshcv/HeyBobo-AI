import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import { existsSync, mkdirSync } from 'fs';

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

export const APP_LOG_DIR       = path.join(LOG_DIR, 'app');
export const ERROR_LOG_DIR     = path.join(LOG_DIR, 'errors');
export const HTTP_LOG_DIR      = path.join(LOG_DIR, 'http');

// Ensure all subdirectories exist before transports are created
for (const dir of [APP_LOG_DIR, ERROR_LOG_DIR, HTTP_LOG_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// ── Formats ────────────────────────────────────────────────────────────────

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
    const ctx     = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).filter((k) => k !== 'service').length
      ? ` ${JSON.stringify(meta)}`
      : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `${timestamp} ${String(level).padEnd(17)} ${ctx} ${message}${metaStr}${stackStr}`;
  }),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// ── Shared rotate defaults ──────────────────────────────────────────────────
const rotateBase = {
  format:        fileFormat,
  datePattern:   'YYYY-MM-DD',
  zippedArchive: true,   // gzip old files to save space
  maxSize:       '20m',  // rotate when file hits 20 MB
} as const;

// ── Main application logger ─────────────────────────────────────────────────
// Writes to:
//   logs/app/app-YYYY-MM-DD.log   — all levels (debug+), 30-day retention
//   logs/errors/error-YYYY-MM-DD.log — error level only, 90-day retention
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'eduplatform-api' },
  transports: [
    // Console — colourised, human-readable
    new winston.transports.Console({ format: consoleFormat }),

    // Combined app log
    new winston.transports.DailyRotateFile({
      ...rotateBase,
      filename: path.join(APP_LOG_DIR, 'app-%DATE%.log'),
      level:    'debug',
      maxFiles: '30d',
    } as any),

    // Errors-only — separate folder, longer retention
    new winston.transports.DailyRotateFile({
      ...rotateBase,
      filename: path.join(ERROR_LOG_DIR, 'error-%DATE%.log'),
      level:    'error',
      maxFiles: '90d',
    } as any),
  ],
});

// ── HTTP access logger ──────────────────────────────────────────────────────
// Used exclusively by LoggingInterceptor.
// Writes to: logs/http/access-YYYY-MM-DD.log — 30-day retention
export const httpLogger = winston.createLogger({
  level: 'info',
  defaultMeta: { service: 'eduplatform-api', type: 'http' },
  transports: [
    new winston.transports.DailyRotateFile({
      ...rotateBase,
      filename: path.join(HTTP_LOG_DIR, 'access-%DATE%.log'),
      level:    'info',
      maxFiles: '30d',
    } as any),
  ],
});

