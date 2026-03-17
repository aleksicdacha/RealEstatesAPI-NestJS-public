import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRoomStructureColumn1766529980484 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('properties', new TableColumn({
            name: 'roomStructure',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Room structure (e.g., garsonjera, jednosoban, dvosoban, trosoban, etc.)'
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('properties', 'roomStructure');
    }

}
