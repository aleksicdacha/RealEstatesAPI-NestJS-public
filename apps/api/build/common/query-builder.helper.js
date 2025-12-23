"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilderHelper = void 0;
const common_1 = require("@nestjs/common");
class QueryBuilderHelper {
    static applyQueryOptions(queryBuilder, options, filters) {
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryBuilder.andWhere(`${queryBuilder.alias}.${key} = :${key}`, { [key]: value });
                }
            });
        }
        if (options.searchField && options.searchValue) {
            const validSearchFields = ['code', 'username'];
            if (!validSearchFields.includes(options.searchField)) {
                throw new common_1.BadRequestException(`Invalid search field: ${options.searchField}`);
            }
            queryBuilder.andWhere(`"${queryBuilder.alias}"."${options.searchField}" ILIKE :searchValue`, { searchValue: `%${options.searchValue}%` });
        }
        if (options.sortBy && options.order) {
            queryBuilder.orderBy(`"${queryBuilder.alias}"."${options.sortBy}"`, options.order.toUpperCase());
        }
        const page = options.page || 1;
        const limit = options.limit || 10;
        queryBuilder.skip((page - 1) * limit).take(limit);
    }
}
exports.QueryBuilderHelper = QueryBuilderHelper;
//# sourceMappingURL=query-builder.helper.js.map