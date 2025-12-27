"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddElevatorAndDescriptionColumns1733661889993 = void 0;
class AddElevatorAndDescriptionColumns1733661889993 {
    name = 'AddElevatorAndDescriptionColumns1733661889993';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "elevator" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN IF EXISTS "elevator"`);
    }
}
exports.AddElevatorAndDescriptionColumns1733661889993 = AddElevatorAndDescriptionColumns1733661889993;
//# sourceMappingURL=1733661889993-AddElevatorAndDescriptionColumns.js.map