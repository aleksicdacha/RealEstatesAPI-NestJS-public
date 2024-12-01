import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // Ensure this matches your .env value
    });
  }

  async validate(payload: JwtPayload) {
    console.log('Payload received by JwtStrategy:', payload); // Debug payload

    const user = await this.userService.findByUsername(payload.username);

    if (!user) {
      console.error('User not found or invalid token');
      throw new UnauthorizedException('Invalid token or user not found');
    }

    // Ensure the user's role is included in the returned object
    return { ...user, role: user.role };
  }
}
