"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUsernameSearchIndex1733355336065 = void 0;
class AddUsernameSearchIndex1733355336065 {
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS username_search_index ON "users" ("username")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS username_search_index`);
    }
}
exports.AddUsernameSearchIndex1733355336065 = AddUsernameSearchIndex1733355336065;
//# sourceMappingURL=1733355336065-AddUsernameSearchIndex.js.map