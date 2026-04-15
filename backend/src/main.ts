import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { WinstonLoggerService } from '@/common/logger/logger.service';

// ── Ensure log directories exist before the logger module is loaded ──────────
const LOG_ROOT = process.env.LOG_DIR || join(process.cwd(), 'logs');
for (const sub of ['app', 'errors', 'http', 'general-log']) {
  const dir = join(LOG_ROOT, sub);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function bootstrap(): Promise<void> {
  // Validate required secrets before starting
  if (process.env.NODE_ENV === 'production') {
    const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
      process.stderr.write(`FATAL: Missing required environment variables: ${missing.join(', ')}\n`);
      process.exit(1);
    }
    const insecureDefaults = ['your-super-secret-jwt-key', 'your-super-secret-refresh-key'];
    if (insecureDefaults.includes(process.env.JWT_SECRET!) || insecureDefaults.includes(process.env.JWT_REFRESH_SECRET!)) {
      process.stderr.write('FATAL: JWT secrets must not use default values in production\n');
      process.exit(1);
    }
  }

  const winstonLogger = new WinstonLoggerService();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: winstonLogger,
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Ensure upload directories exist
  const uploadBase = join(process.cwd(), 'uploads');
  const subfolders = ['avatars', 'documents', 'media', 'meals', 'textbooks'];
  for (const folder of subfolders) {
    const dir = join(uploadBase, folder);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  // Serve uploaded files statically
  app.useStaticAssets(uploadBase, { prefix: '/uploads/' });

  // Trust proxy
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Security
  app.use(helmet());

  // Rate limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 auth POST requests per windowMs (login, register, etc.)
    message: 'Too many authentication attempts, please try again in 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'GET', // Don't rate-limit GET requests (e.g. username availability check)
  });

  const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 password reset requests per hour
    message: 'Too many password reset attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(generalLimiter);
  app.use('/api/v1/auth/forgot-password', passwordResetLimiter);
  app.use('/api/v1/auth/reset-password', passwordResetLimiter);
  app.use('/api/v1/auth', authLimiter);

  // CORS — allow configured frontend URL plus the Vite dev server
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const allowedOrigins = [frontendUrl];
  if (nodeEnv !== 'production') {
    // Accept common local dev ports so the Vite proxy and direct requests both work
    allowedOrigins.push('http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173');
  }
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Swagger, mobile) or from allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters (HttpExceptionFilter first so it handles HTTP errors; AllExceptionsFilter catches the rest)
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // API prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Health check endpoint (used by Docker health checks and load balancers)
  app.getHttpAdapter().getInstance().get(`/${apiPrefix}/health`, (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EduPlatform API')
    .setDescription('Complete API documentation for the EduPlatform education backend')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
      'access-token',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your refresh token',
      },
      'refresh-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
    },
  });

  // Graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.log(`${signal} received, starting graceful shutdown...`);
      await app.close();
      process.exit(0);
    });
  });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger API docs: http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(`Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
}

bootstrap().catch((error: Error) => {
  process.stderr.write(`Fatal error during application bootstrap: ${error.message}\n${error.stack}\n`);
  process.exit(1);
});
