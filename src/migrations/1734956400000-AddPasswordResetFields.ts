import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetFields1734956400000 implements MigrationInterface {
    name = 'AddPasswordResetFields1734956400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if email column exists
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
        
        // Check if resetPasswordToken column exists
        const tokenExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'resetPasswordToken'
            );
        `);
        
        if (!tokenExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordToken" character varying`);
        }
        
        // Check if resetPasswordExpires column exists
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordExpires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordToken"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_email"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    }
}
