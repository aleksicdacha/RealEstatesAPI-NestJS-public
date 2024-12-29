import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './common/config/config.module';
import { ConfigService } from './common/config/config.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from '@src/entities/user/user.module';
import { PropertyModule } from '@src/entities/property/property.module';
import { PropertyImageModule } from '@src/entities/property-image/property-image.module';
import { UploadModule } from '@src/entities/upload/upload.module';
import { ClientModule } from '@src/entities/client/client.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],  // Import ConfigModule
      inject: [ConfigService],  // Inject ConfigService
      useFactory: async (configService: ConfigService) => {
        // Return the database configuration
        return {
          type: (configService.get('DB_TYPE') || 'postgres') as 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.getNumber('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME') || 'estates',
          synchronize: configService.get('DB_SYNC') === 'true',  // Synchronize schema based on environment variable
          autoLoadEntities: true,  // Automatically load all entities
          logging: true,  // Enable logging for debugging
        };
      },
    }),
    AuthModule,
    UserModule,
    PropertyModule,
    PropertyImageModule,
    UploadModule,
    ClientModule
  ],
})
export class AppModule {}
