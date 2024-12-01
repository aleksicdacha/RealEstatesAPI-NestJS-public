import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { developmentConfig } from './environments/development';
import { productionConfig } from './environments/production';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => {
          const env = process.env.NODE_ENV || 'development';
          switch (env) {
            case 'production':
              return productionConfig;
            default:
              return developmentConfig;
          }
        },
      ],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
