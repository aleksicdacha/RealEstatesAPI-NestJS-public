import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateAgentChatTables1736189000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create agent_conversations table
        await queryRunner.createTable(
            new Table({
                name: "agent_conversations",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "guestName",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "guestEmail",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "guestPhone",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "initialMessage",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "userId",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "agentId",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["waiting", "active", "resolved", "closed"],
                        default: "'waiting'",
                    },
                    {
                        name: "unreadCount",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "locale",
                        type: "varchar",
                        length: "10",
                        default: "'sr'",
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Create agent_messages table
        await queryRunner.createTable(
            new Table({
                name: "agent_messages",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "conversationId",
                        type: "int",
                    },
                    {
                        name: "senderId",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "senderType",
                        type: "enum",
                        enum: ["guest", "user", "agent", "system"],
                        default: "'guest'",
                    },
                    {
                        name: "message",
                        type: "text",
                    },
                    {
                        name: "isRead",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            "agent_conversations",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL",
            })
        );

        await queryRunner.createForeignKey(
            "agent_conversations",
            new TableForeignKey({
                columnNames: ["agentId"],
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL",
            })
        );

        await queryRunner.createForeignKey(
            "agent_messages",
            new TableForeignKey({
                columnNames: ["conversationId"],
                referencedTableName: "agent_conversations",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "agent_messages",
            new TableForeignKey({
                columnNames: ["senderId"],
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL",
            })
        );

        // Add indexes
        await queryRunner.query(`CREATE INDEX "IDX_agent_conversations_status" ON "agent_conversations" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_agent_conversations_agentId" ON "agent_conversations" ("agentId")`);
        await queryRunner.query(`CREATE INDEX "IDX_agent_messages_conversationId" ON "agent_messages" ("conversationId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_agent_messages_conversationId"`);
        await queryRunner.query(`DROP INDEX "IDX_agent_conversations_agentId"`);
        await queryRunner.query(`DROP INDEX "IDX_agent_conversations_status"`);

        // Drop foreign keys
        const messagesTable = await queryRunner.getTable("agent_messages");
        const conversationsTable = await queryRunner.getTable("agent_conversations");

        if (messagesTable) {
            const messageForeignKeys = messagesTable.foreignKeys.filter(
                fk => fk.columnNames.indexOf("conversationId") !== -1 || fk.columnNames.indexOf("senderId") !== -1
            );
            for (const fk of messageForeignKeys) {
                await queryRunner.dropForeignKey("agent_messages", fk);
            }
        }

        if (conversationsTable) {
            const conversationForeignKeys = conversationsTable.foreignKeys.filter(
                fk => fk.columnNames.indexOf("userId") !== -1 || fk.columnNames.indexOf("agentId") !== -1
            );
            for (const fk of conversationForeignKeys) {
                await queryRunner.dropForeignKey("agent_conversations", fk);
            }
        }

        // Drop tables
        await queryRunner.dropTable("agent_messages");
        await queryRunner.dropTable("agent_conversations");
    }
}
