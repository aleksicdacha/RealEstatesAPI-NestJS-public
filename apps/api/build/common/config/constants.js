"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_SEARCH_FIELDS = exports.jwtConstants = void 0;
exports.jwtConstants = {
    secret: process.env.JWT_SECRET || 'defaultSecret',
};
exports.VALID_SEARCH_FIELDS = ['username', 'role', 'id'];
//# sourceMappingURL=constants.js.map