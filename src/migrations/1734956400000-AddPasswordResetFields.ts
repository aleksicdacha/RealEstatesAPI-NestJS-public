import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetFields1734956400000 implements MigrationInterface {
    name = 'AddPasswordResetFields1734956400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_email" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordToken" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "resetPasswordExpires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordExpires"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPasswordToken"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_email"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email"`);
    }
}
