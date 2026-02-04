import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRepresentativeEntity1766761605636 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if representatives table exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'representatives'
            );
        `);

        // Only create table if it doesn't exist
        if (!tableExists[0].exists) {
            await queryRunner.query(`
                CREATE TABLE "representatives" (
                    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "name" TEXT,
                    "address" TEXT,
                    "phone" TEXT,
                    "jmbg" VARCHAR(13),
                    "birthplace" TEXT,
                    "idCardNumber" VARCHAR(50),
                    "idCardIssuePlace" TEXT,
                    "createdAt" TIMESTAMP DEFAULT now(),
                    "updatedAt" TIMESTAMP DEFAULT now(),
                    "clientId" uuid
                )
            `);
        }

        // Add representativeId column to clients if it doesn't exist
        await queryRunner.query(`
            ALTER TABLE "clients" 
            ADD COLUMN IF NOT EXISTS "representativeId" uuid
        `);

        // Add foreign key if it doesn't exist
        const fkExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'FK_representative_client'
            );
        `);

        if (!fkExists[0].exists) {
            await queryRunner.query(`
                ALTER TABLE "representatives"
                ADD CONSTRAINT "FK_representative_client"
                FOREIGN KEY ("clientId") 
                REFERENCES "clients"("id") 
                ON DELETE CASCADE
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key if exists
        await queryRunner.query(`
            ALTER TABLE "representatives"
            DROP CONSTRAINT IF EXISTS "FK_representative_client"
        `);

        // Remove representativeId column from clients
        await queryRunner.query(`
            ALTER TABLE "clients" 
            DROP COLUMN IF EXISTS "representativeId"
        `);

        // Drop representatives table
        await queryRunner.query(`
            DROP TABLE IF EXISTS "representatives"
        `);
    }
}
