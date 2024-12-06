// src/auth/jwt-payload.interface.ts

export interface JwtPayload {
  username: string;
  role: string;
  sub: number;
}
