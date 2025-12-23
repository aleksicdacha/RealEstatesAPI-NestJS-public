import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsernameSearchIndex1733355336065 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `CREATE INDEX IF NOT EXISTS username_search_index ON "users" ("username")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `DROP INDEX IF EXISTS username_search_index`
        );
    }

}
