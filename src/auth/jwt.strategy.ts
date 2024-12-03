import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../common/config/constants';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {

    console.log('Payload: ', payload);
    const user = await this.userService.findByUsername(payload.username);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Ensure the user role is extracted correctly from the payload
    if (!payload.role) {
      console.error('Role is missing from JWT payload');
    }

    // Validate against lastLogoutTime
    if (user.lastLogoutTime && payload.iat * 1000 < user.lastLogoutTime.getTime()) {
      throw new UnauthorizedException('Token is invalid (revoked)');
    }

    return { id: user.id, username: payload.username, role: payload.role };
  }
}
