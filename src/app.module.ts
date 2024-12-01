import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './common/config/config.module';
import { ConfigService } from './common/config/config.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],  // Import ConfigModule
      inject: [ConfigService],  // Inject ConfigService
      useFactory: async (configService: ConfigService) => {
        // Log the DB connection settings to ensure they're correct
        const dbHost = configService.get('DB_HOST');
        const dbPort = configService.getNumber('DB_PORT');
        const dbUsername = configService.get('DB_USERNAME');
        const dbPassword = configService.get('DB_PASSWORD');
        const dbName = configService.get('DB_NAME') || 'estates';  // Default value if DB_NAME is not set

        // console.log('DB Connection Settings:');
        // console.log('DB_HOST:', dbHost);
        // console.log('DB_PORT:', dbPort);
        // console.log('DB_USERNAME:', dbUsername);
        // console.log('DB_PASSWORD:', dbPassword);  // Be careful about logging sensitive info like password
        // console.log('DB_NAME:', dbName);

        // Return the database configuration
        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          synchronize: configService.get('DB_SYNC') === 'true',  // Synchronize schema based on environment variable
          autoLoadEntities: true,  // Automatically load all entities
          logging: true,  // Enable logging for debugging
        };
      },
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
