"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterSubscriberService = void 0;
const common_1 = require("@nestjs/common");
const newsletter_subscriber_repository_1 = require("./newsletter-subscriber.repository");
const email_service_1 = require("../../email/email.service");
const newsletter_subscriber_entity_1 = require("./newsletter-subscriber.entity");
const uuid_1 = require("uuid");
let NewsletterSubscriberService = class NewsletterSubscriberService {
    newsletterSubscriberRepository;
    emailService;
    constructor(newsletterSubscriberRepository, emailService) {
        this.newsletterSubscriberRepository = newsletterSubscriberRepository;
        this.emailService = emailService;
    }
    async subscribe(subscribeDto) {
        const { email } = subscribeDto;
        const existingSubscriber = await this.newsletterSubscriberRepository.findByEmail(email);
        if (existingSubscriber && existingSubscriber.isActive) {
            throw new common_1.ConflictException('Email je već pretplaćen na newsletter.');
        }
        if (existingSubscriber && !existingSubscriber.isActive) {
            existingSubscriber.isActive = true;
            existingSubscriber.unsubscribedAt = null;
            existingSubscriber.unsubscribeToken = (0, uuid_1.v4)();
            await this.newsletterSubscriberRepository.save(existingSubscriber);
            return { message: 'Uspešno ste se ponovo pretplatili na newsletter.' };
        }
        const subscriber = new newsletter_subscriber_entity_1.NewsletterSubscriber();
        subscriber.email = email;
        subscriber.isActive = true;
        subscriber.unsubscribeToken = (0, uuid_1.v4)();
        await this.newsletterSubscriberRepository.save(subscriber);
        return { message: 'Uspešno ste se pretplatili na newsletter.' };
    }
    async unsubscribe(unsubscribeDto) {
        const { token } = unsubscribeDto;
        const subscriber = await this.newsletterSubscriberRepository.findByUnsubscribeToken(token);
        if (!subscriber) {
            throw new common_1.NotFoundException('Nevažeći token za odjavu.');
        }
        if (!subscriber.isActive) {
            return { message: 'Već ste odjavljeni sa newsletter-a.' };
        }
        subscriber.isActive = false;
        subscriber.unsubscribedAt = new Date();
        await this.newsletterSubscriberRepository.save(subscriber);
        return { message: 'Uspešno ste se odjavili sa newsletter-a.' };
    }
    async getAllSubscribers(filters) {
        return this.newsletterSubscriberRepository.findWithFilters(filters);
    }
    async getActiveSubscribers() {
        return this.newsletterSubscriberRepository.findActiveSubscribers();
    }
    async sendNewsletter(sendDto) {
        const { subject, content, recipients } = sendDto;
        const normalizedRecipients = recipients?.length
            ? Array.from(new Map(recipients
                .map((email) => email.trim())
                .filter(Boolean)
                .map((email) => [email.toLowerCase(), email])).values())
            : [];
        const targetSubscribers = normalizedRecipients.length
            ? await this.newsletterSubscriberRepository.findActiveSubscribersByEmails(normalizedRecipients)
            : await this.getActiveSubscribers();
        if (targetSubscribers.length === 0) {
            return { message: 'Nema aktivnih pretplatnika.', sentCount: 0 };
        }
        const BATCH_SIZE = 50;
        const DELAY_MS = 2000;
        console.log(`📧 Starting newsletter send to ${targetSubscribers.length} subscribers (batched)`);
        let sentCount = 0;
        for (let i = 0; i < targetSubscribers.length; i += BATCH_SIZE) {
            const batch = targetSubscribers.slice(i, i + BATCH_SIZE);
            const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(targetSubscribers.length / BATCH_SIZE);
            console.log(`📧 Processing batch ${batchNumber}/${totalBatches} (${batch.length} emails)...`);
            for (const subscriber of batch) {
                try {
                    await this.emailService.sendNewsletterEmail(subscriber.email, subject, content, subscriber.unsubscribeToken);
                    sentCount++;
                }
                catch (error) {
                    console.error(`❌ Failed to send newsletter to ${subscriber.email}:`, error);
                }
            }
            if (i + BATCH_SIZE < targetSubscribers.length) {
                console.log(`⏳ Waiting ${DELAY_MS}ms before next batch...`);
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));
            }
        }
        console.log(`✅ Newsletter sending completed: ${sentCount}/${targetSubscribers.length} sent successfully`);
        return {
            message: `Newsletter poslat ${sentCount} od ${targetSubscribers.length} pretplatnika.`,
            sentCount
        };
    }
};
exports.NewsletterSubscriberService = NewsletterSubscriberService;
exports.NewsletterSubscriberService = NewsletterSubscriberService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [newsletter_subscriber_repository_1.NewsletterSubscriberRepository,
        email_service_1.EmailService])
], NewsletterSubscriberService);
//# sourceMappingURL=newsletter-subscriber.service.js.map