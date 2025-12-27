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
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const nestjs_i18n_1 = require("nestjs-i18n");
let EmailService = class EmailService {
    configService;
    i18n;
    transporter;
    constructor(configService, i18n) {
        this.configService = configService;
        this.i18n = i18n;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('MAIL_HOST', 'smtp.gmail.com'),
            port: this.configService.get('MAIL_PORT', 587),
            secure: false,
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASSWORD'),
            },
        });
    }
    async sendPasswordResetEmail(to, resetToken, lang = 'en') {
        const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3001')}/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: this.configService.get('MAIL_FROM', 'noreply@realestates.com'),
            to,
            subject: this.i18n.t('email.passwordReset.subject', { lang }),
            html: this.getPasswordResetTemplate(resetUrl, lang),
        };
        await this.transporter.sendMail(mailOptions);
    }
    getPasswordResetTemplate(resetUrl, lang = 'en') {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
          }
          .title {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            color: #555;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #007bff;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #0056b3;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #999;
            font-size: 12px;
          }
          .link {
            word-break: break-all;
            color: #007bff;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏡 Real Estate Admin</div>
          </div>
          
          <h1 class="title">${this.i18n.t('email.passwordReset.subject', { lang })}</h1>
          
          <div class="content">
            <p>${this.i18n.t('email.passwordReset.greeting', { lang })},</p>
            <p>${this.i18n.t('email.passwordReset.message', { lang })}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">${this.i18n.t('email.passwordReset.button', { lang })}</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ ${this.i18n.t('email.passwordReset.security', { lang })}</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>${this.i18n.t('email.passwordReset.expiry', { lang })}</li>
              <li>${this.i18n.t('email.passwordReset.ignore', { lang })}</li>
            </ul>
          </div>
          
          <div class="content">
            <p class="link">${resetUrl}</p>
          </div>
          
          <div class="footer">
            <p>${this.i18n.t('email.passwordReset.footer', { lang })}</p>
            <p>&copy; ${new Date().getFullYear()} Real Estate Admin. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    async sendWelcomeEmail(to, username) {
        const mailOptions = {
            from: this.configService.get('MAIL_FROM', 'noreply@realestates.com'),
            to,
            subject: 'Welcome to Real Estate Admin',
            html: this.getWelcomeTemplate(username),
        };
        await this.transporter.sendMail(mailOptions);
    }
    getWelcomeTemplate(username) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #28a745;
            margin-bottom: 10px;
          }
          .title {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏡 Real Estate Admin</div>
          </div>
          
          <h1 class="title">Welcome, ${username}! 🎉</h1>
          
          <div>
            <p>Your account has been successfully created.</p>
            <p>You can now log in and start managing your real estate properties.</p>
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Real Estate Admin. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        nestjs_i18n_1.I18nService])
], EmailService);
//# sourceMappingURL=email.service.js.map