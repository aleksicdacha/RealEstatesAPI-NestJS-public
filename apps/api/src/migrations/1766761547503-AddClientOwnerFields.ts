import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClientOwnerFields1766761547503 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "clients" 
            ADD COLUMN "ownerJmbg" VARCHAR(13),
            ADD COLUMN "ownerBirthplace" TEXT,
            ADD COLUMN "ownerIdCardNumber" VARCHAR(50),
            ADD COLUMN "ownerIdCardIssuePlace" TEXT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "clients" 
            DROP COLUMN "ownerJmbg",
            DROP COLUMN "ownerBirthplace",
            DROP COLUMN "ownerIdCardNumber",
            DROP COLUMN "ownerIdCardIssuePlace"
        `);
    }

}
