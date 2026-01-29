"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNewsletterSubscriber1768240550665 = void 0;
const typeorm_1 = require("typeorm");
class CreateNewsletterSubscriber1768240550665 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "newsletter_subscribers",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()",
                },
                {
                    name: "email",
                    type: "varchar",
                    isUnique: true,
                },
                {
                    name: "isActive",
                    type: "boolean",
                    default: true,
                },
                {
                    name: "unsubscribeToken",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "subscribedAt",
                    type: "timestamp",
                    default: "now()",
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()",
                },
                {
                    name: "unsubscribedAt",
                    type: "timestamp",
                    isNullable: true,
                },
            ],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable("newsletter_subscribers");
    }
}
exports.CreateNewsletterSubscriber1768240550665 = CreateNewsletterSubscriber1768240550665;
//# sourceMappingURL=1768240550665-CreateNewsletterSubscriber.js.map