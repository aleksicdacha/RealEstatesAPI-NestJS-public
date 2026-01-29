"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const core_2 = require("@nestjs/core");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 3000;
    const nodeEnv = configService.get('NODE_ENV') || 'development';
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: false,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', '..', 'uploads'), {
        prefix: '/uploads',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        errorHttpStatusCode: 422,
    }));
    app.useGlobalInterceptors(new common_2.ClassSerializerInterceptor(app.get(core_2.Reflector)));
    await app.listen(port);
    console.log(`🚀 Real Estate API is running on: http://localhost:${port}`);
    console.log(`🌍 Environment: ${nodeEnv}`);
    console.log(`🔗 API Base URL: http://localhost:${port}/v1`);
    console.log(`📮 Ready for Postman testing!`);
    console.log(`📁 Static files (uploads): http://localhost:${port}/uploads`);
}
bootstrap();
//# sourceMappingURL=main-clean.js.map