import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterSubscriberController } from './newsletter-subscriber.controller';
import { NewsletterSubscriberService } from './newsletter-subscriber.service';
import { NewsletterSubscriberRepository } from './newsletter-subscriber.repository';
import { NewsletterSubscriber } from './newsletter-subscriber.entity';
import { EmailModule } from '../../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsletterSubscriber]),
    EmailModule,
  ],
  controllers: [NewsletterSubscriberController],
  providers: [NewsletterSubscriberService, NewsletterSubscriberRepository],
  exports: [NewsletterSubscriberService, NewsletterSubscriberRepository],
})
export class NewsletterSubscriberModule {}