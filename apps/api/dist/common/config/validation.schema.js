"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configValidationSchema = void 0;
const config_1 = require("@nestjs/config");
const Joi = require("joi");
exports.configValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(3000),
    CORS_ORIGIN: Joi.string().required(),
    DB_TYPE: Joi.string().valid('postgres').default('postgres'),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_EXPIRES_IN: Joi.string().default('7d'),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
    REDIS_HOST: Joi.string().optional(),
    REDIS_PORT: Joi.number().optional(),
    UPLOAD_DIR: Joi.string().default('./uploads'),
    MAX_FILE_SIZE: Joi.number().default(10485760),
    SMTP_HOST: Joi.string().optional(),
    SMTP_PORT: Joi.number().optional(),
    SMTP_USER: Joi.string().optional(),
    SMTP_PASSWORD: Joi.string().optional(),
    SMTP_FROM: Joi.string().email().optional(),
});
exports.default = (0, config_1.registerAs)('app', () => ({
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
}));
//# sourceMappingURL=validation.schema.js.map