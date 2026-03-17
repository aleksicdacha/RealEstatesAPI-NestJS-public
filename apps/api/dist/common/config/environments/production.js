"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionConfig = void 0;
exports.productionConfig = {
    jwtSecret: process.env.JWT_SECRET,
    db: {
        type: process.env.DB_TYPE || 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: process.env.DB_SYNC === 'true',
    },
};
//# sourceMappingURL=production.js.map