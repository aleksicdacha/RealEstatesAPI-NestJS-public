"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./entities/user/user.entity");
const property_entity_1 = require("./entities/property/property.entity");
const property_image_entity_1 = require("./entities/property-image/property-image.entity");
const client_entity_1 = require("./entities/client/client.entity");
const representative_entity_1 = require("./entities/representative/representative.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'CHANGE_ME',
    database: process.env.DB_NAME || 'estates',
    synchronize: false,
    logging: true,
    entities: [user_entity_1.User, property_entity_1.Property, property_image_entity_1.PropertyImage, client_entity_1.Client, representative_entity_1.Representative],
    migrations: [__dirname + '/migrations/*.js'],
});
//# sourceMappingURL=data-source.js.map