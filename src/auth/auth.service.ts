// import { Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { UserService } from '../user/user.service';
// import { JwtPayload } from './jwt-payload.interface'; // A simple interface to describe the JWT payload
//
// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly userService: UserService,
//     private readonly jwtService: JwtService,
//   ) {}
//
//   async login(username: string, password: string): Promise<string | null> {
//     const user = await this.userService.validateUser(username, password);
//
//     console.log(user);
//
//     if (!user) {
//       // If user is not found or password is incorrect, return null or throw an exception
//       throw new Error('Invalid credentials');
//     }
//
//     // If user is valid, create a payload for the JWT
//     const payload: JwtPayload = {
//       username: user.username,
//       sub: user.id, // Use the user ID or another unique identifier
//       role: user.role, // Assuming you have a role field in the user entity
//     };
//
//     // Generate the JWT token
//     return this.jwtService.sign(payload);
//   }
//
//   async generateToken(user: any) {
//     console.log('here');
//
//     const payload: JwtPayload = {
//       username: user.username,
//       sub: user.id,
//       role: user.role, // Ensure the role is added
//     };
//     console.log('Generated token payload:', payload);
//
//     return this.jwtService.sign(payload);
//   }
//
//   // Example validate function
//   async validateUser(username: string, password: string) {
//     const user = await this.userService.findByUsername(username);
//     if (user && user.password === password) {
//       return user;
//     }
//     return null;
//   }
// }

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // async validateUser(username: string, password: string): Promise<any> {
  //   const user = await this.userService.findByUsername(username);
  //   if (user && user.password === password) {
  //     // Use proper hashing for passwords
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   return null;
  // }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async login(user: LoginDto) {
    const payload = { username: user.username, role: user.role }; // Ensure these fields match the ones you validate in JwtStrategy
    console.log('Generating token with payload:', payload); // Debug payload
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
