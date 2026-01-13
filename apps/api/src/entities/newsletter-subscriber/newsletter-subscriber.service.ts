import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { NewsletterSubscriberRepository } from './newsletter-subscriber.repository';
import { SubscribeNewsletterDto, SendNewsletterDto, UnsubscribeNewsletterDto, GetNewsletterSubscribersDto } from './dto/newsletter.dto';
import { EmailService } from '../../email/email.service';
import { NewsletterSubscriber } from './newsletter-subscriber.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NewsletterSubscriberService {
  constructor(
    private readonly newsletterSubscriberRepository: NewsletterSubscriberRepository,
    private readonly emailService: EmailService,
  ) {}

  async subscribe(subscribeDto: SubscribeNewsletterDto): Promise<{ message: string }> {
    const { email } = subscribeDto;

    // Check if already subscribed
    const existingSubscriber = await this.newsletterSubscriberRepository.findByEmail(email);
    if (existingSubscriber && existingSubscriber.isActive) {
      throw new ConflictException('Email je već pretplaćen na newsletter.');
    }

    if (existingSubscriber && !existingSubscriber.isActive) {
      // Reactivate subscription
      existingSubscriber.isActive = true;
      existingSubscriber.unsubscribedAt = null;
      existingSubscriber.unsubscribeToken = uuidv4();
      await this.newsletterSubscriberRepository.save(existingSubscriber);
      return { message: 'Uspešno ste se ponovo pretplatili na newsletter.' };
    }

    // Create new subscriber
    const subscriber = new NewsletterSubscriber();
    subscriber.email = email;
    subscriber.isActive = true;
    subscriber.unsubscribeToken = uuidv4();

    await this.newsletterSubscriberRepository.save(subscriber);

    return { message: 'Uspešno ste se pretplatili na newsletter.' };
  }

  async unsubscribe(unsubscribeDto: UnsubscribeNewsletterDto): Promise<{ message: string }> {
    const { token } = unsubscribeDto;

    const subscriber = await this.newsletterSubscriberRepository.findByUnsubscribeToken(token);
    if (!subscriber) {
      throw new NotFoundException('Nevažeći token za odjavu.');
    }

    if (!subscriber.isActive) {
      return { message: 'Već ste odjavljeni sa newsletter-a.' };
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await this.newsletterSubscriberRepository.save(subscriber);

    return { message: 'Uspešno ste se odjavili sa newsletter-a.' };
  }

  async getAllSubscribers(filters: GetNewsletterSubscribersDto): Promise<NewsletterSubscriber[]> {
    return this.newsletterSubscriberRepository.findWithFilters(filters);
  }

  async getActiveSubscribers(): Promise<NewsletterSubscriber[]> {
    return this.newsletterSubscriberRepository.findActiveSubscribers();
  }

  async sendNewsletter(sendDto: SendNewsletterDto): Promise<{ message: string; sentCount: number }> {
    const { subject, content, recipients } = sendDto;

    const normalizedRecipients = recipients?.length
      ? Array.from(
          new Map(
            recipients
              .map((email) => email.trim())
              .filter(Boolean)
              .map((email) => [email.toLowerCase(), email]),
          ).values(),
        )
      : [];

    const targetSubscribers = normalizedRecipients.length
      ? await this.newsletterSubscriberRepository.findActiveSubscribersByEmails(normalizedRecipients)
      : await this.getActiveSubscribers();

    if (targetSubscribers.length === 0) {
      return { message: 'Nema aktivnih pretplatnika.', sentCount: 0 };
    }

    let sentCount = 0;
    for (const subscriber of targetSubscribers) {
      try {
        await this.emailService.sendNewsletterEmail(
          subscriber.email,
          subject,
          content,
          subscriber.unsubscribeToken
        );
        sentCount++;
      } catch (error) {
        console.error(`Failed to send newsletter to ${subscriber.email}:`, error);
      }
    }

    return {
      message: `Newsletter poslat ${sentCount} od ${targetSubscribers.length} pretplatnika.`,
      sentCount
    };
  }
}