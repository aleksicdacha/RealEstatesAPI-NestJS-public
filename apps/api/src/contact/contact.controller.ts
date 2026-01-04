import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { ContactFormDto } from './contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendContactForm(@Body() contactFormDto: ContactFormDto): Promise<{ message: string }> {
    const { name, email, phone, subject, message, recaptchaToken } = contactFormDto;

    // Send email to aleksic.dacha@gmail.com
    await this.emailService.sendContactFormEmail(
      name,
      email,
      phone || '',
      subject,
      message,
      recaptchaToken
    );

    return { message: 'Poruka je uspešno poslata!' };
  }
}