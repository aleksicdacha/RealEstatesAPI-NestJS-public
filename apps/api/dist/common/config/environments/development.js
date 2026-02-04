"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.developmentConfig = void 0;
exports.developmentConfig = {
    jwtSecret: process.env.JWT_SECRET || 'devSecret',
    db: {
        type: process.env.DB_TYPE || 'postgres',
        database: process.env.DB_NAME || 'estates',
        synchronize: process.env.DB_SYNC === 'true',
    },
};
//# sourceMappingURL=development.js.map