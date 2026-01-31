import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNewsletterSubscriber1768240550665 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'newsletter_subscribers'
            );
        `);

        // Only create if it doesn't exist
        if (!tableExists[0].exists) {
            await queryRunner.query(`
                CREATE TABLE "newsletter_subscribers" (
                    "id" SERIAL PRIMARY KEY,
                    "email" VARCHAR NOT NULL UNIQUE,
                    "name" VARCHAR,
                    "subscribedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "isActive" BOOLEAN DEFAULT true,
                    "unsubscribeToken" VARCHAR UNIQUE
                )
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "newsletter_subscribers"`);
    }

}
