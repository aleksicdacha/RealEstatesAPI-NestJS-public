import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.debug('No user found in request');
      return false;
    }

    const hasRole = roles.some((role) => user.role?.includes(role));
    
    if (!hasRole) {
      this.logger.debug(`User ${user.username} lacks required roles: ${roles.join(', ')}`);
    }

    return hasRole;
  }
}
