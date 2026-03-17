import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { NewsletterSubscriber } from './newsletter-subscriber.entity';

interface SubscriberFilters {
  email?: string;
  isActive?: boolean;
  subscribedFrom?: Date;
  subscribedTo?: Date;
}

@Injectable()
export class NewsletterSubscriberRepository extends Repository<NewsletterSubscriber> {
  constructor(private readonly dataSource: DataSource) {
    super(NewsletterSubscriber, dataSource.createEntityManager());
  }

  async findActiveSubscribers(): Promise<NewsletterSubscriber[]> {
    return this.find({
      where: { isActive: true },
      order: { subscribedAt: 'DESC' }
    });
  }

  async findActiveSubscribersByEmails(emails: string[]): Promise<NewsletterSubscriber[]> {
    if (!emails.length) {
      return [];
    }

    return this.createQueryBuilder('subscriber')
      .where('subscriber.isActive = :isActive', { isActive: true })
      .andWhere('subscriber.email IN (:...emails)', { emails })
      .orderBy('subscriber.subscribedAt', 'DESC')
      .getMany();
  }

  async findWithFilters(filters: SubscriberFilters): Promise<NewsletterSubscriber[]> {
    const qb = this.createQueryBuilder('subscriber')
      .orderBy('subscriber.subscribedAt', 'DESC');

    if (filters.email) {
      qb.andWhere('subscriber.email ILIKE :email', { email: `%${filters.email}%` });
    }

    if (typeof filters.isActive === 'boolean') {
      qb.andWhere('subscriber.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.subscribedFrom) {
      qb.andWhere('subscriber.subscribedAt >= :from', { from: filters.subscribedFrom });
    }

    if (filters.subscribedTo) {
      qb.andWhere('subscriber.subscribedAt <= :to', { to: filters.subscribedTo });
    }

    return qb.getMany();
  }

  async findByEmail(email: string): Promise<NewsletterSubscriber | null> {
    return this.findOne({ where: { email } });
  }

  async findByUnsubscribeToken(token: string): Promise<NewsletterSubscriber | null> {
    return this.findOne({ where: { unsubscribeToken: token } });
  }
}