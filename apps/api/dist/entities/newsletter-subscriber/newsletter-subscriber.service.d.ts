import { NewsletterSubscriberRepository } from './newsletter-subscriber.repository';
import { SubscribeNewsletterDto, SendNewsletterDto, UnsubscribeNewsletterDto, GetNewsletterSubscribersDto } from './dto/newsletter.dto';
import { EmailService } from '../../email/email.service';
import { NewsletterSubscriber } from './newsletter-subscriber.entity';
export declare class NewsletterSubscriberService {
    private readonly newsletterSubscriberRepository;
    private readonly emailService;
    constructor(newsletterSubscriberRepository: NewsletterSubscriberRepository, emailService: EmailService);
    subscribe(subscribeDto: SubscribeNewsletterDto): Promise<{
        message: string;
    }>;
    unsubscribe(unsubscribeDto: UnsubscribeNewsletterDto): Promise<{
        message: string;
    }>;
    getAllSubscribers(filters: GetNewsletterSubscribersDto): Promise<NewsletterSubscriber[]>;
    getActiveSubscribers(): Promise<NewsletterSubscriber[]>;
    sendNewsletter(sendDto: SendNewsletterDto): Promise<{
        message: string;
        sentCount: number;
    }>;
}
