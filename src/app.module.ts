import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './common/config/config.module';
import { ConfigService } from './common/config/config.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppDataSource } from './data-source';

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
          migrations: [  // Specify the migration files location
            'src/migrations/**/*{.ts,.js}',  // Adjust the path if necessary
          ],
          migrationsRun: false,  // Set to false to manually run migrations
          cli: {
            migrationsDir: 'src/migrations',  // Directory to create migration files
          },
        };
      },
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {
  constructor() {
    // Make sure to initialize the DataSource here
    AppDataSource.initialize()
      .then(() => {
        console.log('DataSource has been initialized!');
      })
      .catch((error) => {
        console.error('Error during DataSource initialization:', error);
      });
  }
}
