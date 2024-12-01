import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // async validateUser(username: string, password: string): Promise<any> {
  //   const user = await this.usersService.findByUsername(username);
  //   if (user && user.password === password) {
  //     const { password, ...result } = user; // Exclude the password
  //     return result;
  //   }
  //   return null;
  // }

  // async login(user: any): Promise<{ accessToken: string }> {
  //   const payload = { username: user.username, role: user.role };
  //   const accessToken = this.jwtService.sign(payload);
  //   return { accessToken };
  // }

  async login(authCredentialsDto: AuthCredentialsDto) {
    const { username, password } = authCredentialsDto;
    const user = await this.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload: JwtPayload = { username: user.username, role: user.role };
    const accessToken = await this.jwtService.sign(payload);

    return { accessToken };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async register(createUserDto: any) {
    return this.usersService.create(createUserDto);
  }
}
