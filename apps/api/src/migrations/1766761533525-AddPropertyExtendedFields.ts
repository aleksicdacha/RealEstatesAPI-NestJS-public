import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPropertyExtendedFields1766761533525 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "contractNumber" VARCHAR(100),
            ADD COLUMN IF NOT EXISTS "cadastralParcel" VARCHAR(100),
            ADD COLUMN IF NOT EXISTS "cadastralMunicipality" VARCHAR(100),
            ADD COLUMN IF NOT EXISTS "orientation" VARCHAR(20),
            ADD COLUMN IF NOT EXISTS "youtubeUrl" VARCHAR(500),
            ADD COLUMN IF NOT EXISTS "specialOffer" INTEGER CHECK ("specialOffer" BETWEEN 1 AND 20)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN "contractNumber",
            DROP COLUMN "cadastralParcel",
            DROP COLUMN "cadastralMunicipality",
            DROP COLUMN "orientation",
            DROP COLUMN "youtubeUrl",
            DROP COLUMN "specialOffer"
        `);
    }

}
