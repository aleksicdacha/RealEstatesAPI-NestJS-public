import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@src/entities/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findByUsername(payload.username);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    if (!payload.role) {
      this.logger.warn(`Role missing from JWT payload for user: ${payload.username}`);
    }

    // Validate against lastLogoutTime
    if (user.lastLogoutTime && payload.iat * 1000 < user.lastLogoutTime.getTime()) {
      throw new UnauthorizedException('Token is invalid (revoked)');
    }

    return { id: user.id, username: payload.username, role: payload.role };
  }
}
