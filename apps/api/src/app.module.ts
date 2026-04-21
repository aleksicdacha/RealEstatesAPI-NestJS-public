import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigurableThrottlerGuard } from './common/guards/configurable-throttler.guard';
import { APP_GUARD } from '@nestjs/core';
import {
  I18nModule,
  AcceptLanguageResolver,
  QueryResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import * as path from 'path';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UserModule } from '@src/entities/user/user.module';
import { PropertyModule } from '@src/entities/property/property.module';
import { PropertyImageModule } from '@src/entities/property-image/property-image.module';
import { UploadModule } from '@src/entities/upload/upload.module';
import { ClientModule } from '@src/entities/client/client.module';
import { ChatbotModule } from '@src/entities/chatbot/chatbot.module';
import { AgentChatModule } from '@src/entities/agent-chat/agent-chat.module';
import { EmailModule } from './email/email.module';
import { ContactModule } from './contact/contact.module';
import { NewsletterSubscriberModule } from '@src/entities/newsletter-subscriber/newsletter-subscriber.module';

// Configuration
import { databaseConfig } from '@src/common/config/database.config';
import { appConfig } from '@src/common/config/app.config';
import { jwtConfig } from '@src/common/config/jwt.config';
import { configValidationSchema } from '@src/common/config/validation.schema';

// Middleware
import { OptionsMiddleware } from '@src/common/middleware/options-middleware';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [databaseConfig, appConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
      validationSchema: configValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        synchronize: configService.get<boolean>('database.synchronize'),
        autoLoadEntities: true,
        logging: configService.get<string>('NODE_ENV') === 'development',
        retryAttempts: 3,
        retryDelay: 5000,
      }),
    }),

    // Internationalization
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'src', 'i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          // Global default — overridden per-route with @Throttle({ default: {...} })
          name: 'default',
          ttl: 60000,
          limit: 200,
        },
        {
          name: 'short',
          ttl: 1000,
          limit: 10,
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 50,
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 100,
        },
      ],
    }),

    // Feature modules
    AuthModule,
    UserModule,
    PropertyModule,
    PropertyImageModule,
    UploadModule,
    ClientModule,
    ChatbotModule,
    AgentChatModule,
    EmailModule,
    ContactModule,
    NewsletterSubscriberModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ConfigurableThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OptionsMiddleware).forRoutes('*');
  }
}
