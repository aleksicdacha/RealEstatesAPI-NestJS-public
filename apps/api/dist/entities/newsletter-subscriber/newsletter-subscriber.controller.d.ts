import { NewsletterSubscriberService } from './newsletter-subscriber.service';
import { SubscribeNewsletterDto, SendNewsletterDto, UnsubscribeNewsletterDto, GetNewsletterSubscribersDto } from './dto/newsletter.dto';
export declare class NewsletterSubscriberController {
    private readonly newsletterSubscriberService;
    constructor(newsletterSubscriberService: NewsletterSubscriberService);
    subscribe(subscribeDto: SubscribeNewsletterDto): Promise<{
        message: string;
    }>;
    unsubscribe(unsubscribeDto: UnsubscribeNewsletterDto): Promise<{
        message: string;
    }>;
    getAllSubscribers(query: GetNewsletterSubscribersDto): Promise<import("./newsletter-subscriber.entity").NewsletterSubscriber[]>;
    sendNewsletter(sendDto: SendNewsletterDto): Promise<{
        message: string;
        sentCount: number;
    }>;
}
