import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { EmailService } from '../email/email.service';
import { ContactFormDto, ScheduleViewingDto } from './contact.dto';

@Controller('contact')
@UseGuards(ThrottlerGuard)
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 submissions per 5 minutes per IP
  async sendContactForm(
    @Body() contactFormDto: ContactFormDto,
  ): Promise<{ message: string }> {
    const { name, email, phone, subject, message, recaptchaToken } =
      contactFormDto;

    try {
      await this.emailService.sendContactFormEmail(
        name,
        email,
        phone || '',
        subject,
        message,
        recaptchaToken,
      );
    } catch (err) {
      this.logger.error('Contact form email failed', err);
      return { message: 'Poruka je uspešno poslata!' };
    }

    return { message: 'Poruka je uspešno poslata!' };
  }

  @Post('schedule-viewing')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  async scheduleViewing(
    @Body() dto: ScheduleViewingDto,
  ): Promise<{ message: string }> {
    const { name, email, phone, propertyCode, message, recaptchaToken } = dto;

    try {
      await this.emailService.sendScheduleViewingEmail(
        name,
        email,
        phone || '',
        propertyCode,
        message || '',
        recaptchaToken,
      );
    } catch (err) {
      this.logger.error('Schedule viewing email failed', err);
      return { message: 'Zahtev za razgledanje je uspešno poslat!' };
    }

    return { message: 'Zahtev za razgledanje je uspešno poslat!' };
  }
}
