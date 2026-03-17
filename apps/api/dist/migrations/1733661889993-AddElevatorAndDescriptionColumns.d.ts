import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddElevatorAndDescriptionColumns1733661889993 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
