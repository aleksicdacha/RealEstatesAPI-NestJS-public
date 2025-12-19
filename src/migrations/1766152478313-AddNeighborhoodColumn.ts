import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNeighborhoodColumn1766152478313 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "property" 
            ADD COLUMN "neighborhood" VARCHAR(255)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "property" 
            DROP COLUMN "neighborhood"
        `);
    }

}
