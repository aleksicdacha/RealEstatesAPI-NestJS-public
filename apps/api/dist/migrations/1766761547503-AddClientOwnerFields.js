"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddClientOwnerFields1766761547503 = void 0;
class AddClientOwnerFields1766761547503 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "clients" 
            ADD COLUMN "ownerJmbg" VARCHAR(13),
            ADD COLUMN "ownerBirthplace" TEXT,
            ADD COLUMN "ownerIdCardNumber" VARCHAR(50),
            ADD COLUMN "ownerIdCardIssuePlace" TEXT
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "clients" 
            DROP COLUMN "ownerJmbg",
            DROP COLUMN "ownerBirthplace",
            DROP COLUMN "ownerIdCardNumber",
            DROP COLUMN "ownerIdCardIssuePlace"
        `);
    }
}
exports.AddClientOwnerFields1766761547503 = AddClientOwnerFields1766761547503;
//# sourceMappingURL=1766761547503-AddClientOwnerFields.js.map