import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { UserService } from '@src/entities/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly i18n: I18nService,
  ) {}

  async login(authCredentialsDto: AuthCredentialsDto) {
    const { username, password } = authCredentialsDto;
    const user = await this.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload: JwtPayload = { username: user.username, role: user.role, sub: user.id };

    const accessToken = this.jwtService.sign(payload);
    const tokens = await this.issueTokens(user.id, user.username);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return { 
      accessToken, 
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  }

  async logout(userId: number) {
    const user = await this.userService.findOne(userId);

    if (!user || !user.id) {
      throw new Error('User ID is required to log out');
    }

    // Set lastLogoutTime to the current time
    await this.userService.updateLastLogoutTime(userId);

    await this.userService.clearRefreshToken(userId);
    return { message: 'User logged out successfully' };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findOne(payload.sub);

      if (!user || !(await this.userService.validateRefreshToken(user.id, refreshToken))) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Ensure the token hasn't been revoked
      if (user.lastLogoutTime && payload.iat * 1000 < user.lastLogoutTime.getTime()) {
        throw new UnauthorizedException('Token has been revoked');
      }

      const newPayload: JwtPayload = { username: user.username, role: user.role, sub: user.id };

      const newAccessToken = this.jwtService.sign(newPayload);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async register(createUserDto: any) {
    return this.userService.create(createUserDto);
  }

  private async issueTokens(userId: number, username: string) {
    const payload = { sub: userId, username };
    
    // Use the global JWT configuration without overrides
    const accessToken = this.jwtService.sign(payload);
    
    // For refresh token, we'll use a longer expiration but same secret for now
    // In production, you'd want separate secrets
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return { accessToken, refreshToken };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const lang = I18nContext.current()?.lang || 'en';
    
    const user = await this.userService.findByEmail(email);
    
    // Always return success message to prevent email enumeration
    if (!user) {
      return { message: this.i18n.t('errors.auth.passwordResetSent', { lang }) };
    }
    
    // Generate and store reset token
    const resetToken = await this.userService.createPasswordResetToken(user.id);
    
    // Send email with reset link
    await this.emailService.sendPasswordResetEmail(user.email, resetToken, lang);
    
    return { message: this.i18n.t('errors.auth.passwordResetSent', { lang }) };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password } = resetPasswordDto;
    const lang = I18nContext.current()?.lang || 'en';
    
    // Find user by valid reset token
    const user = await this.userService.findByResetToken(token);
    
    if (!user) {
      throw new BadRequestException(this.i18n.t('errors.auth.invalidToken', { lang }));
    }
    
    // Reset the password
    await this.userService.resetPassword(user.id, password);
    
    return { message: this.i18n.t('errors.auth.passwordResetSuccess', { lang }) };
  }
}
