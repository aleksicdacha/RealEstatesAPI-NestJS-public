import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard triggered');
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    if (err || !user) {
      console.log('JwtAuthGuard error or user not found:', err, user);
      throw err || new UnauthorizedException('Unauthorized');
    }
    console.log('JwtAuthGuard user:', user); // Log the user
    return user;
  }
}