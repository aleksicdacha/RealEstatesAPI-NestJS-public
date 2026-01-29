import { Repository, DataSource } from 'typeorm';
import { NewsletterSubscriber } from './newsletter-subscriber.entity';
interface SubscriberFilters {
    email?: string;
    isActive?: boolean;
    subscribedFrom?: Date;
    subscribedTo?: Date;
}
export declare class NewsletterSubscriberRepository extends Repository<NewsletterSubscriber> {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    findActiveSubscribers(): Promise<NewsletterSubscriber[]>;
    findActiveSubscribersByEmails(emails: string[]): Promise<NewsletterSubscriber[]>;
    findWithFilters(filters: SubscriberFilters): Promise<NewsletterSubscriber[]>;
    findByEmail(email: string): Promise<NewsletterSubscriber | null>;
    findByUnsubscribeToken(token: string): Promise<NewsletterSubscriber | null>;
}
export {};
