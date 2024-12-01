// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { JwtStrategy } from './jwt.strategy';
// import { UserModule } from '../user/user.module';
// import { ConfigModule } from '@nestjs/config';
// import { JwtAuthGuard } from './jwt-auth.guard';
// import { PassportModule } from '@nestjs/passport'; // Import User module to access the user service
//
// @Module({
//   imports: [
//     PassportModule.register({ defaultStrategy: 'jwt' }),
//     JwtModule.register({
//       secret: process.env.JWT_SECRET,
//       signOptions: { expiresIn: '1h' },
//     }),
//     ConfigModule.forRoot(), // Make sure to import the ConfigModule
//     UserModule,
//   ],
//   providers: [AuthService, JwtStrategy, JwtAuthGuard],
//   exports: [AuthService, JwtModule],
//   controllers: [AuthController],
// })
// export class AuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule for environment variables
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Get secret from environment variables
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') }, // Optional expiration time
      }),
    }),
    UserModule, // Import UserModule to access UserService
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

