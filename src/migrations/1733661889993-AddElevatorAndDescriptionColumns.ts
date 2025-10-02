import { MigrationInterface, QueryRunner } from "typeorm";

export class AddElevatorAndDescriptionColumns1733661889993 implements MigrationInterface {
    name = 'AddElevatorAndDescriptionColumns1733661889993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" ADD "elevator" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "elevator"`);
    }

}
