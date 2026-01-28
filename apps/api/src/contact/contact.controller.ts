import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { EmailService } from '../email/email.service';
import { ContactFormDto } from './contact.dto';

@Controller('contact')
@UseGuards(ThrottlerGuard)
export class ContactController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 submissions per 5 minutes per IP
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