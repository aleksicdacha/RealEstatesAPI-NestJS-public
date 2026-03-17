import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
export declare class EmailService {
    private configService;
    private readonly i18n;
    private transporter;
    constructor(configService: ConfigService, i18n: I18nService);
    sendPasswordResetEmail(to: string, resetToken: string, lang?: string): Promise<void>;
    private getPasswordResetTemplate;
    sendWelcomeEmail(to: string, username: string): Promise<void>;
    private getWelcomeTemplate;
    sendContactFormEmail(name: string, email: string, phone: string, subject: string, message: string, recaptchaToken: string): Promise<void>;
    private getContactFormTemplate;
    sendNewsletterEmail(to: string, subject: string, content: string, unsubscribeToken: string): Promise<void>;
    private getNewsletterTemplate;
}
