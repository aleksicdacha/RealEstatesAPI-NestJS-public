"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPropertyExtendedFields1766761533525 = void 0;
class AddPropertyExtendedFields1766761533525 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "properties" 
            ADD COLUMN "contractNumber" VARCHAR(100),
            ADD COLUMN "cadastralParcel" VARCHAR(100),
            ADD COLUMN "cadastralMunicipality" VARCHAR(100),
            ADD COLUMN "orientation" VARCHAR(20),
            ADD COLUMN "youtubeUrl" VARCHAR(500),
            ADD COLUMN "specialOffer" INTEGER CHECK ("specialOffer" BETWEEN 1 AND 20)
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "properties" 
            DROP COLUMN "contractNumber",
            DROP COLUMN "cadastralParcel",
            DROP COLUMN "cadastralMunicipality",
            DROP COLUMN "orientation",
            DROP COLUMN "youtubeUrl",
            DROP COLUMN "specialOffer"
        `);
    }
}
exports.AddPropertyExtendedFields1766761533525 = AddPropertyExtendedFields1766761533525;
//# sourceMappingURL=1766761533525-AddPropertyExtendedFields.js.map