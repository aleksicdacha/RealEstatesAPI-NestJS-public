import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { I18nContext, I18nService } from 'nestjs-i18n';
import * as sanitizeHtml from 'sanitize-html';

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

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    lang: string = 'en',
  ): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001')}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.configService.get<string>(
        'MAIL_FROM',
        'noreply@realestates.com',
      ),
      to,
      subject: this.i18n.t('email.passwordReset.subject', { lang }),
      html: this.getPasswordResetTemplate(resetUrl, lang),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private getPasswordResetTemplate(
    resetUrl: string,
    lang: string = 'en',
  ): string {
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
      from: this.configService.get<string>(
        'MAIL_FROM',
        'noreply@realestates.com',
      ),
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

  async sendContactFormEmail(
    name: string,
    email: string,
    phone: string,
    subject: string,
    message: string,
    recaptchaToken: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>(
        'MAIL_FROM',
        'noreply@realestates.com',
      ),
      to: 'aleksic.dacha@gmail.com', // Test email for contact form
      subject: `Kontakt forma: ${subject}`,
      html: this.getContactFormTemplate(name, email, phone, subject, message),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private getContactFormTemplate(
    name: string,
    email: string,
    phone: string,
    subject: string,
    message: string,
  ): string {
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
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #f97316, #ea580c);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
            margin: -30px -30px 30px -30px;
          }
          .field {
            margin-bottom: 20px;
          }
          .field-label {
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
            display: block;
          }
          .field-value {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            border-left: 4px solid #f97316;
          }
          .message-content {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid #f97316;
            white-space: pre-wrap;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Nova poruka sa kontakt forme</h1>
            <p>Primili ste novu poruku od potencijalnog klijenta</p>
          </div>

          <div class="field">
            <span class="field-label">Ime:</span>
            <div class="field-value">${name}</div>
          </div>

          <div class="field">
            <span class="field-label">Email:</span>
            <div class="field-value">${email}</div>
          </div>

          <div class="field">
            <span class="field-label">Telefon:</span>
            <div class="field-value">${phone || 'Nije naveden'}</div>
          </div>

          <div class="field">
            <span class="field-label">Predmet:</span>
            <div class="field-value">${subject}</div>
          </div>

          <div class="field">
            <span class="field-label">Poruka:</span>
            <div class="message-content">${message}</div>
          </div>

          <div class="footer">
            <p>Ova poruka je poslata sa kontakt forme vaše web stranice.</p>
            <p>&copy; ${new Date().getFullYear()} Real Estate. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendNewsletterEmail(
    to: string,
    subject: string,
    content: string,
    unsubscribeToken: string,
  ): Promise<void> {
    const unsubscribeUrl = `${this.configService.get<string>('USER_WEB_URL', 'http://localhost:3002')}/sr/newsletter/unsubscribe?token=${unsubscribeToken}`;

    const mailOptions = {
      from: this.configService.get<string>(
        'MAIL_FROM',
        'noreply@realestates.com',
      ),
      to,
      subject,
      html: this.getNewsletterTemplate(content, unsubscribeUrl),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private getNewsletterTemplate(
    content: string,
    unsubscribeUrl: string,
  ): string {
    // Sanitize HTML content while allowing safe tags and attributes
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'br',
        'hr',
        'div',
        'span',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'strike',
        'ul',
        'ol',
        'li',
        'a',
        'img',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'blockquote',
        'pre',
        'code',
      ],
      allowedAttributes: {
        a: ['href', 'title', 'target'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        '*': ['style', 'class'],
      },
      allowedStyles: {
        '*': {
          color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
          'background-color': [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
          'font-size': [/^\d+(?:px|em|%)$/],
          'font-weight': [/^bold$/, /^normal$/, /^\d+$/],
          'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
          margin: [/^\d+(?:px|em|%)$/],
          padding: [/^\d+(?:px|em|%)$/],
        },
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      transformTags: {
        a: (tagName, attribs) => {
          return {
            tagName: 'a',
            attribs: {
              ...attribs,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          };
        },
      },
    });

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
          .content {
            color: #555;
            margin-bottom: 30px;
          }
          .newsletter-content {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
          }
          .newsletter-content h1,
          .newsletter-content h2,
          .newsletter-content h3 {
            color: #2c3e50;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          .newsletter-content img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 15px 0;
          }
          .newsletter-content a {
            color: #007bff;
            text-decoration: none;
          }
          .newsletter-content a:hover {
            text-decoration: underline;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .unsubscribe {
            color: #666;
            font-size: 11px;
            margin-top: 20px;
          }
          .unsubscribe a {
            color: #007bff;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏠 Real Estate Newsletter</div>
            <p>Novosti iz sveta nekretnina</p>
          </div>

          <div class="newsletter-content">
            ${sanitizedContent}
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Real Estate. All rights reserved.</p>
            <div class="unsubscribe">
              <a href="${unsubscribeUrl}">Odjavite se sa newsletter-a</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendScheduleViewingEmail(
    name: string,
    email: string,
    phone: string,
    propertyCode: string,
    message: string,
    recaptchaToken: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>(
        'MAIL_FROM',
        'noreply@realestates.com',
      ),
      to: 'aleksic.dacha@gmail.com',
      subject: `Zahtev za razgledanje: ${propertyCode}`,
      html: this.getScheduleViewingTemplate(
        name,
        email,
        phone,
        propertyCode,
        message,
      ),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private getScheduleViewingTemplate(
    name: string,
    email: string,
    phone: string,
    propertyCode: string,
    message: string,
  ): string {
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
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #f97316, #ea580c);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
            margin: -30px -30px 30px -30px;
          }
          .header h2 { margin: 0; font-size: 20px; }
          .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
          .field { margin-bottom: 20px; }
          .field-label {
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
            display: block;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .field-value {
            background-color: #f8f9fa;
            padding: 10px 14px;
            border-radius: 4px;
            border-left: 4px solid #f97316;
          }
          .property-code {
            background-color: #fff7ed;
            border-left: 4px solid #ea580c;
            font-size: 18px;
            font-weight: bold;
            color: #c2410c;
            text-align: center;
            letter-spacing: 1px;
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
            <h2>🏠 Zahtev za razgledanje</h2>
            <p>Neko je zainteresovan za nekretninu</p>
          </div>

          <div class="field">
            <span class="field-label">Nekretnina (Kod)</span>
            <div class="field-value property-code">${propertyCode}</div>
          </div>

          <div class="field">
            <span class="field-label">Ime i prezime</span>
            <div class="field-value">${name}</div>
          </div>

          <div class="field">
            <span class="field-label">Email</span>
            <div class="field-value">${email}</div>
          </div>

          ${
            phone
              ? `
          <div class="field">
            <span class="field-label">Telefon</span>
            <div class="field-value">${phone}</div>
          </div>
          `
              : ''
          }

          ${
            message
              ? `
          <div class="field">
            <span class="field-label">Poruka</span>
            <div class="field-value">${message}</div>
          </div>
          `
              : ''
          }

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Real Estate. Sva prava zadržana.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
