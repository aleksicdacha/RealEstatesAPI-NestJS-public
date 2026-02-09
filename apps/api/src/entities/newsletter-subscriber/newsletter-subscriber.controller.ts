import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { NewsletterSubscriberService } from './newsletter-subscriber.service';
import { SubscribeNewsletterDto, SendNewsletterDto, UnsubscribeNewsletterDto, GetNewsletterSubscribersDto } from './dto/newsletter.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';

@Controller('newsletter')
@UseGuards(ThrottlerGuard)
export class NewsletterSubscriberController {
  constructor(private readonly newsletterSubscriberService: NewsletterSubscriberService) {}

  @Post('subscribe')
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 subscriptions per 5 minutes per IP
  async subscribe(@Body() subscribeDto: SubscribeNewsletterDto) {
    return this.newsletterSubscriberService.subscribe(subscribeDto);
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() unsubscribeDto: UnsubscribeNewsletterDto) {
    return this.newsletterSubscriberService.unsubscribe(unsubscribeDto);
  }

  @Get('subscribers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllSubscribers(@Query() query: GetNewsletterSubscribersDto) {
    return this.newsletterSubscriberService.getAllSubscribers(query);
  }

  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async sendNewsletter(@Body() sendDto: SendNewsletterDto) {
    return this.newsletterSubscriberService.sendNewsletter(sendDto);
  }
}