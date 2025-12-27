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
}
