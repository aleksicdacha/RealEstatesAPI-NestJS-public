"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUniqueConstraintToClientEmail1766256991318 = void 0;
class AddUniqueConstraintToClientEmail1766256991318 {
    name = 'AddUniqueConstraintToClientEmail1766256991318';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_6436cc6b79593760b9ef921ef12" UNIQUE ("email")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_6436cc6b79593760b9ef921ef12"`);
    }
}
exports.AddUniqueConstraintToClientEmail1766256991318 = AddUniqueConstraintToClientEmail1766256991318;
//# sourceMappingURL=1766256991318-AddUniqueConstraintToClientEmail.js.map