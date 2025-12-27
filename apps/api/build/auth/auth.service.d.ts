import { UserService } from '@src/entities/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';
import { I18nService } from 'nestjs-i18n';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    private readonly configService;
    private readonly emailService;
    private readonly i18n;
    constructor(userService: UserService, jwtService: JwtService, configService: ConfigService, emailService: EmailService, i18n: I18nService);
    login(authCredentialsDto: AuthCredentialsDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            username: any;
            role: any;
        };
    }>;
    logout(userId: number): Promise<{
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    validateUser(username: string, password: string): Promise<any>;
    register(createUserDto: any): Promise<import("../entities/user/user.entity").User>;
    private issueTokens;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
