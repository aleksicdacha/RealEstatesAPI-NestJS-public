import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewPropertyTypes1766250418825 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new property types to the enum
        await queryRunner.query(`
            ALTER TYPE "property_propertytype_enum" ADD VALUE IF NOT EXISTS 'ApartmentInHouse';
        `);
        await queryRunner.query(`
            ALTER TYPE "property_propertytype_enum" ADD VALUE IF NOT EXISTS 'CommercialSpace';
        `);
        await queryRunner.query(`
            ALTER TYPE "property_propertytype_enum" ADD VALUE IF NOT EXISTS 'Land';
        `);
        await queryRunner.query(`
            ALTER TYPE "property_propertytype_enum" ADD VALUE IF NOT EXISTS 'VacationHome';
        `);
        await queryRunner.query(`
            ALTER TYPE "property_propertytype_enum" ADD VALUE IF NOT EXISTS 'Duplex';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL does not support removing enum values directly
        // You would need to recreate the enum type if you want to revert this migration
        // For now, we'll leave the down migration empty as removing enum values is complex
        console.log('Down migration for enum values is not implemented - PostgreSQL does not support removing enum values');
    }

}
