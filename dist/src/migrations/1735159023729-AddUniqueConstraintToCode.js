"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUniqueConstraintToCode1735159023729 = void 0;
class AddUniqueConstraintToCode1735159023729 {
    name = 'AddUniqueConstraintToCode1735159023729';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "UQ_220d2c2f64cf6d6eeb6816b84a8" UNIQUE ("code")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "UQ_220d2c2f64cf6d6eeb6816b84a8"`);
    }
}
exports.AddUniqueConstraintToCode1735159023729 = AddUniqueConstraintToCode1735159023729;
//# sourceMappingURL=1735159023729-AddUniqueConstraintToCode.js.map