import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPropertyStatusEnum1733593961322 implements MigrationInterface {
    name = 'AddPropertyStatusEnum1733593961322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."properties_status_enum" AS ENUM('active', 'inactive', 'deleted')`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "status" "public"."properties_status_enum" NOT NULL DEFAULT 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."properties_status_enum"`);
    }

}
