import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPropertyStatusEnum1733593961322 implements MigrationInterface {
    name = 'AddPropertyStatusEnum1733593961322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if enum type exists
        const typeExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'properties_status_enum'
            );
        `);
        
        if (!typeExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "public"."properties_status_enum" AS ENUM('active', 'inactive', 'deleted')`);
        }
        
        // Check if column exists
        const columnExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'properties' AND column_name = 'status'
            );
        `);
        
        if (!columnExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "properties" ADD "status" "public"."properties_status_enum" NOT NULL DEFAULT 'active'`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."properties_status_enum"`);
    }

}
