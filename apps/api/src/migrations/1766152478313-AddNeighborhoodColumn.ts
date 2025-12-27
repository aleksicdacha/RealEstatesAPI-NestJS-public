import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNeighborhoodColumn1766152478313 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "neighborhood" VARCHAR(255)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN "neighborhood";
        `);
    }

}
