import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string, lang: string = 'en'): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001')}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM', 'noreply@realestates.com'),
      to,
      subject: this.i18n.t('email.passwordReset.subject', { lang }),
      html: this.getPasswordResetTemplate(resetUrl, lang),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private getPasswordResetTemplate(resetUrl: string, lang: string = 'en'): string {
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

  async sendWelcomeEmail(to: string, username: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM', 'noreply@realestates.com'),
      to,
      subject: 'Welcome to Real Estate Admin',
      html: this.getWelcomeTemplate(username),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private getWelcomeTemplate(username: string): string {
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
}
