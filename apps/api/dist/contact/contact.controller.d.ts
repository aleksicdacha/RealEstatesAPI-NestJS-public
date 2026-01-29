import { EmailService } from '../email/email.service';
import { ContactFormDto } from './contact.dto';
export declare class ContactController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendContactForm(contactFormDto: ContactFormDto): Promise<{
        message: string;
    }>;
}
