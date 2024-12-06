import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    console.log('roles:', roles);
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('User:', user); // Log user to verify its structure

    if (!user) {
      return false; // If no user is attached (e.g., authentication failed)
    }

    return roles.some((role) => user.role?.includes(role)); // Check if user's role matches
  }
}
