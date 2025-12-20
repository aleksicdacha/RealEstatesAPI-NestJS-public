import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintToClientEmail1766256991318 implements MigrationInterface {
    name = 'AddUniqueConstraintToClientEmail1766256991318'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_6436cc6b79593760b9ef921ef12" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_6436cc6b79593760b9ef921ef12"`);
    }

}
