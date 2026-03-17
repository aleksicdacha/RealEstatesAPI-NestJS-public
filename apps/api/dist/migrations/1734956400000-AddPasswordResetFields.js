"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPasswordResetFields1734956400000 = void 0;
class AddPasswordResetFields1734956400000 {
    name = 'AddPasswordResetFields1734956400000';
    async up(queryRunner) {
        const emailExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'email'
            );
        `);
        if (!emailExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying`);
            await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_email" UNIQUE ("email")`);
        }
        const tokenExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'resetPasswordToken'
            );
        `);
        if (!tokenExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordToken" character varying`);
        }
        const expiresExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'resetPasswordExpires'
            );
        `);
        if (!expiresExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordExpires" TIMESTAMP`);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordExpires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordToken"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_email"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    }
}
exports.AddPasswordResetFields1734956400000 = AddPasswordResetFields1734956400000;
//# sourceMappingURL=1734956400000-AddPasswordResetFields.js.map