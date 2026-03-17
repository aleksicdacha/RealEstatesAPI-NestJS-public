export declare class SubscribeNewsletterDto {
    email: string;
}
export declare class SendNewsletterDto {
    subject: string;
    content: string;
    recipients?: string[];
}
export declare class UnsubscribeNewsletterDto {
    token: string;
}
export declare class GetNewsletterSubscribersDto {
    email?: string;
    isActive?: boolean;
    subscribedFrom?: Date;
    subscribedTo?: Date;
}
