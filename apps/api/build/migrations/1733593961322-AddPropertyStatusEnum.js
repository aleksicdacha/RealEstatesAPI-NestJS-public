"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPropertyStatusEnum1733593961322 = void 0;
class AddPropertyStatusEnum1733593961322 {
    name = 'AddPropertyStatusEnum1733593961322';
    async up(queryRunner) {
        const typeExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'properties_status_enum'
            );
        `);
        if (!typeExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "public"."properties_status_enum" AS ENUM('active', 'inactive', 'deleted')`);
        }
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
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."properties_status_enum"`);
    }
}
exports.AddPropertyStatusEnum1733593961322 = AddPropertyStatusEnum1733593961322;
//# sourceMappingURL=1733593961322-AddPropertyStatusEnum.js.map