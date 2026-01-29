"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../entities/user/user.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const email_service_1 = require("../email/email.service");
const bcrypt = require("bcryptjs");
const nestjs_i18n_1 = require("nestjs-i18n");
let AuthService = class AuthService {
    userService;
    jwtService;
    configService;
    emailService;
    i18n;
    constructor(userService, jwtService, configService, emailService, i18n) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
        this.i18n = i18n;
    }
    async login(authCredentialsDto) {
        const { username, password } = authCredentialsDto;
        const user = await this.validateUser(username, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        const payload = { username: user.username, role: user.role, sub: user.id };
        const accessToken = this.jwtService.sign(payload);
        const tokens = await this.issueTokens(user.id, user.username);
        await this.userService.updateRefreshToken(user.id, tokens.refreshToken);
        const expiresIn = this.parseExpiresIn(this.configService.get('jwt.expiresIn') || '7d');
        return {
            accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        };
    }
    parseExpiresIn(expiresIn) {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match)
            return 3600;
        const value = parseInt(match[1]);
        const unit = match[2];
        const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
        return value * (multipliers[unit] || 3600);
    }
    async logout(userId) {
        const user = await this.userService.findOne(userId);
        if (!user || !user.id) {
            throw new Error('User ID is required to log out');
        }
        await this.userService.updateLastLogoutTime(userId);
        await this.userService.clearRefreshToken(userId);
        return { message: 'User logged out successfully' };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.userService.findOne(payload.sub);
            if (!user || !(await this.userService.validateRefreshToken(user.id, refreshToken))) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            if (user.lastLogoutTime && payload.iat * 1000 < user.lastLogoutTime.getTime()) {
                throw new common_1.UnauthorizedException('Token has been revoked');
            }
            const newPayload = { username: user.username, role: user.role, sub: user.id };
            const newAccessToken = this.jwtService.sign(newPayload);
            return { accessToken: newAccessToken };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async validateUser(username, password) {
        const user = await this.userService.findByUsername(username);
        if (!user) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        return user;
    }
    async register(createUserDto) {
        return this.userService.create(createUserDto);
    }
    async issueTokens(userId, username) {
        const payload = { sub: userId, username };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
        return { accessToken, refreshToken };
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const lang = nestjs_i18n_1.I18nContext.current()?.lang || 'en';
        const user = await this.userService.findByEmail(email);
        if (!user) {
            return { message: this.i18n.t('errors.auth.passwordResetSent', { lang }) };
        }
        const resetToken = await this.userService.createPasswordResetToken(user.id);
        await this.emailService.sendPasswordResetEmail(user.email, resetToken, lang);
        return { message: this.i18n.t('errors.auth.passwordResetSent', { lang }) };
    }
    async resetPassword(resetPasswordDto) {
        const { token, password } = resetPasswordDto;
        const lang = nestjs_i18n_1.I18nContext.current()?.lang || 'en';
        const user = await this.userService.findByResetToken(token);
        if (!user) {
            throw new common_1.BadRequestException(this.i18n.t('errors.auth.invalidToken', { lang }));
        }
        await this.userService.resetPassword(user.id, password);
        return { message: this.i18n.t('errors.auth.passwordResetSuccess', { lang }) };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService,
        nestjs_i18n_1.I18nService])
], AuthService);
//# sourceMappingURL=auth.service.js.map