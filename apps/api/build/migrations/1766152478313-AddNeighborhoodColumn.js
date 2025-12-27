"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNeighborhoodColumn1766152478313 = void 0;
class AddNeighborhoodColumn1766152478313 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN IF NOT EXISTS "neighborhood" VARCHAR(255)
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN "neighborhood";
        `);
    }
}
exports.AddNeighborhoodColumn1766152478313 = AddNeighborhoodColumn1766152478313;
//# sourceMappingURL=1766152478313-AddNeighborhoodColumn.js.map