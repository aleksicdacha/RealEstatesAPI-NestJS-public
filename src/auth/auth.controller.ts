import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
// import { LoginDto } from './dto/login.dto'; // DTO for login

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Call the AuthService's login method
    const token = await this.authService.login(loginDto);
    return { accessToken: token }; // Return the token
  }
}
