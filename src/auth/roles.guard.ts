// src/auth/roles.guard.ts
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // If no roles are required, allow the request
    }

    const request = context.switchToHttp().getRequest();

    console.log(request.user);

    const token = request.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header
    const user = request.user;

    if (!token) {
      throw new Error('Token is missing');
    }

    if (!user || !user.role) {
      throw new ForbiddenException('Role is missing in the payload');
    }

    const payload: JwtPayload = this.jwtService.decode(token) as JwtPayload;

    console.log(payload);

    if (!payload || !payload.role) {
      throw new Error('Role is missing in the payload');
    }

    // Check if the role in the payload matches the required role
    return requiredRoles.includes(payload.role);
  }
}
