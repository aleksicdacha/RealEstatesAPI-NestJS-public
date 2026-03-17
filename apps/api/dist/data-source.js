"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'CHANGE_ME',
    database: process.env.DB_NAME || 'estates',
    synchronize: false,
    logging: true,
    entities: [__dirname + '/entities/**/*.entity.{ts,js}'],
    migrations: [__dirname + '/migrations/*.{ts,js}'],
});
//# sourceMappingURL=data-source.js.map