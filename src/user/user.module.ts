import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../auth/roles.guard';
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Make sure to configure the secret from .env or another secure place
      signOptions: { expiresIn: '60m' }, // Optional: Set the expiration time for your JWT token
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Globally apply the RolesGuard
    },
  ],
  exports: [UserService],
})
export class UserModule {}
