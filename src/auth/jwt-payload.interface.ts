export interface JwtPayload {
  username?: string; // Make sure this matches what your JWT includes
  sub: number; // 'sub' is a common field for the user ID (optional, based on your needs)
  role: string;
  iat?: number; // Optional 'issued at' timestamp
  exp?: number; // Optional 'expiration' timestamp
}
