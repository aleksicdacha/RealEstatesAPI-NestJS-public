import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './common/config/config.service';
import { ValidationPipe } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  app.enableCors();

  // Serve static files from the "uploads" directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads', // The URL prefix for accessing the static files
  });

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform input to DTO types
      whitelist: true, // Strip properties not in the DTO
      forbidNonWhitelisted: true, // Throw error for extra properties
    }),
  );

  // Enable global class serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
