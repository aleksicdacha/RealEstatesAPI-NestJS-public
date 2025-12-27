import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateRepresentativeEntity1766761605636 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
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
            }),
            true
        );

        // Add representativeId column to clients table
        await queryRunner.query(`
            ALTER TABLE "clients" 
            ADD COLUMN "representativeId" UUID
        `);

        // Add foreign key constraint
        await queryRunner.createForeignKey(
            "clients",
            new TableForeignKey({
                columnNames: ["representativeId"],
                referencedColumnNames: ["id"],
                referencedTableName: "representatives",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key first
        const table = await queryRunner.getTable("clients");
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("representativeId") !== -1
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey("clients", foreignKey);
        }

        // Remove column from clients
        await queryRunner.query(`
            ALTER TABLE "clients" 
            DROP COLUMN "representativeId"
        `);

        // Drop representatives table
        await queryRunner.dropTable("representatives");
    }

}
