"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRepresentativeEntity1766761605636 = void 0;
const typeorm_1 = require("typeorm");
class CreateRepresentativeEntity1766761605636 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "representatives",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()",
                },
                {
                    name: "name",
                    type: "text",
                    isNullable: true,
                },
                {
                    name: "address",
                    type: "text",
                    isNullable: true,
                },
                {
                    name: "phone",
                    type: "text",
                    isNullable: true,
                },
                {
                    name: "jmbg",
                    type: "varchar",
                    length: "13",
                    isNullable: true,
                },
                {
                    name: "birthplace",
                    type: "text",
                    isNullable: true,
                },
                {
                    name: "idCardNumber",
                    type: "varchar",
                    length: "50",
                    isNullable: true,
                },
                {
                    name: "idCardIssuePlace",
                    type: "text",
                    isNullable: true,
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()",
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()",
                },
            ],
        }), true);
        await queryRunner.query(`
            ALTER TABLE "clients" 
            ADD COLUMN "representativeId" UUID
        `);
        await queryRunner.createForeignKey("clients", new typeorm_1.TableForeignKey({
            columnNames: ["representativeId"],
            referencedColumnNames: ["id"],
            referencedTableName: "representatives",
            onDelete: "SET NULL",
        }));
    }
    async down(queryRunner) {
        const table = await queryRunner.getTable("clients");
        const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf("representativeId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("clients", foreignKey);
        }
        await queryRunner.query(`
            ALTER TABLE "clients" 
            DROP COLUMN "representativeId"
        `);
        await queryRunner.dropTable("representatives");
    }
}
exports.CreateRepresentativeEntity1766761605636 = CreateRepresentativeEntity1766761605636;
//# sourceMappingURL=1766761605636-CreateRepresentativeEntity.js.map