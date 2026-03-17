"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNewPropertyTypes1766250418825 = void 0;
class AddNewPropertyTypes1766250418825 {
    async up(queryRunner) {
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
    async down(queryRunner) {
        console.log('Down migration for enum values is not implemented - PostgreSQL does not support removing enum values');
    }
}
exports.AddNewPropertyTypes1766250418825 = AddNewPropertyTypes1766250418825;
//# sourceMappingURL=1766250418825-AddNewPropertyTypes.js.map