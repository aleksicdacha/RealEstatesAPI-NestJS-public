import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import * as hpp from 'hpp';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  // ── Security middleware (must be first) ─────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],  // Allow inline styles for Swagger UI
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],            // Clickjacking protection
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,          // Needed for Swagger UI
      hsts: {
        maxAge: 31536000,                        // 1 year
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // HTTP Parameter Pollution protection
  app.use(hpp());

  // Body size limits — keep 2MB for newsletter HTML payloads
  // Protected from DoS by rate limiting on the newsletter endpoint
  app.use(bodyParser.json({ limit: '2mb' }));
  app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }));

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── CORS — strict allowlist, no fallthrough ────────────────────────────────
  // Reads CORS_ORIGIN env for easy per-env override:
  //   CORS_ORIGIN=http://localhost:3001,http://localhost:3002
  const corsEnv = configService.get<string>('CORS_ORIGIN') || '';
  const allowedOrigins = [
    ...corsEnv.split(',').map((o) => o.trim()).filter(Boolean),
    // Fallback hardcoded list (edit if IP/domain changes)
    'http://46.224.231.217:3001',
    'http://46.224.231.217:3002',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3000',
  ].filter((v, i, a) => a.indexOf(v) === i);   // deduplicate

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, Postman in dev)
      if (!origin) return callback(null, true);

      // In development allow all origins
      if (nodeEnv === 'development') return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In production: REJECT — do NOT fall through
        logger.warn(`CORS blocked request from unauthorized origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400,   // Pre-flight cache 24h
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Static files for image uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 422,
    }),
  );

  // Global serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Swagger API Documentation
  if (nodeEnv === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Real Estate API')
      .setDescription('Property Management System API Documentation')
      .setVersion('2.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Properties', 'Property management endpoints')
      .addTag('Clients', 'Client management endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Upload', 'File upload endpoints')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('📚 Swagger documentation available at: http://localhost:' + port + '/api/docs');
  }

  await app.listen(port);

  logger.log(`🚀 Real Estate API is running on: http://localhost:${port}`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`🔗 API Base URL: http://localhost:${port}/v1`);
  logger.log(`📁 Static files (uploads): http://localhost:${port}/uploads`);
}

bootstrap();
