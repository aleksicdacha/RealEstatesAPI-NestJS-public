import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintToCode1735159023729 implements MigrationInterface {
    name = 'AddUniqueConstraintToCode1735159023729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "UQ_220d2c2f64cf6d6eeb6816b84a8" UNIQUE ("code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "UQ_220d2c2f64cf6d6eeb6816b84a8"`);
    }

}
