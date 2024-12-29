import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@src/entities/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async login(authCredentialsDto: AuthCredentialsDto) {
    const { username, password } = authCredentialsDto;
    const user = await this.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload: JwtPayload = { username: user.username, role: user.role, sub:user.id }; //TODO:: CheckTHIS

    console.log('Payload:', payload);
    // this.jwtService.sign(payload);

    const accessToken = this.jwtService.sign(payload);
    //
    // return { accessToken };

    const tokens = await this.issueTokens(user.id, user.username);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    console.log('Tokens:', tokens);

    // return tokens;
    return { accessToken, refreshToken: tokens.refreshToken };
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
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      const user = await this.userService.findOne(payload.sub);

      if (!user || !(await this.userService.validateRefreshToken(user.id, refreshToken))) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Ensure the token hasn't been revoked
      if (user.lastLogoutTime && payload.iat * 1000 < user.lastLogoutTime.getTime()) {
        throw new UnauthorizedException('Token has been revoked');
      }

      const newPayload: JwtPayload = { username: user.username, role: user.role, sub: user.id };

      const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: process.env.JWT_EXPIRES_IN });

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
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }
}
