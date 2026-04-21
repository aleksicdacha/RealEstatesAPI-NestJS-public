import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // 5 attempts per 15 minutes — brute-force protection (disabled when THROTTLE_SKIP=true)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.login(authCredentialsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    const userId = req.user.id;
    this.logger.debug(`User ${req.user.username} logging out`);
    return this.authService.logout(userId);
  }

  // 3 accounts per hour from same IP
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @Public()
  @Post('register')
  async register(@Body() createUserDto: any) {
    return this.authService.register(createUserDto);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  // 3 requests per 15 minutes — prevents email bombing
  @Throttle({ default: { limit: 3, ttl: 900000 } })
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  // 5 attempts per 15 minutes
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
