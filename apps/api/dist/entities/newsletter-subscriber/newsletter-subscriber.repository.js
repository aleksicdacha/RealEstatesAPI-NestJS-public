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
exports.NewsletterSubscriberRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const newsletter_subscriber_entity_1 = require("./newsletter-subscriber.entity");
let NewsletterSubscriberRepository = class NewsletterSubscriberRepository extends typeorm_1.Repository {
    dataSource;
    constructor(dataSource) {
        super(newsletter_subscriber_entity_1.NewsletterSubscriber, dataSource.createEntityManager());
        this.dataSource = dataSource;
    }
    async findActiveSubscribers() {
        return this.find({
            where: { isActive: true },
            order: { subscribedAt: 'DESC' }
        });
    }
    async findActiveSubscribersByEmails(emails) {
        if (!emails.length) {
            return [];
        }
        return this.createQueryBuilder('subscriber')
            .where('subscriber.isActive = :isActive', { isActive: true })
            .andWhere('subscriber.email IN (:...emails)', { emails })
            .orderBy('subscriber.subscribedAt', 'DESC')
            .getMany();
    }
    async findWithFilters(filters) {
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
    async findByEmail(email) {
        return this.findOne({ where: { email } });
    }
    async findByUnsubscribeToken(token) {
        return this.findOne({ where: { unsubscribeToken: token } });
    }
};
exports.NewsletterSubscriberRepository = NewsletterSubscriberRepository;
exports.NewsletterSubscriberRepository = NewsletterSubscriberRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], NewsletterSubscriberRepository);
//# sourceMappingURL=newsletter-subscriber.repository.js.map