import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddUniqueConstraintToClientEmail1766256991318 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
