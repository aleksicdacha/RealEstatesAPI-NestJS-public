"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRepresentativeEntity1766761605636 = void 0;
class CreateRepresentativeEntity1766761605636 {
    async up(queryRunner) {
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'representatives'
            );
        `);
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
        await queryRunner.query(`
            ALTER TABLE "clients" 
            ADD COLUMN IF NOT EXISTS "representativeId" uuid
        `);
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
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "representatives"
            DROP CONSTRAINT IF EXISTS "FK_representative_client"
        `);
        await queryRunner.query(`
            ALTER TABLE "clients" 
            DROP COLUMN IF EXISTS "representativeId"
        `);
        await queryRunner.query(`
            DROP TABLE IF EXISTS "representatives"
        `);
    }
}
exports.CreateRepresentativeEntity1766761605636 = CreateRepresentativeEntity1766761605636;
//# sourceMappingURL=1766761605636-CreateRepresentativeEntity.js.map