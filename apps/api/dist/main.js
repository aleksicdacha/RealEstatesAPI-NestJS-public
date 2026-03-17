"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const core_2 = require("@nestjs/core");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const bodyParser = require("body-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 3000;
    const nodeEnv = configService.get('NODE_ENV') || 'development';
    app.use(bodyParser.json({ limit: '2mb' }));
    app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    const allowedOrigins = [
        'http://46.224.231.217:3001',
        'http://46.224.231.217:3002',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3000',
    ];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (nodeEnv === 'development')
                return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                logger.warn(`CORS request from unauthorized origin: ${origin}`);
                callback(null, true);
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
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
    if (nodeEnv === 'development') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Real Estate API')
            .setDescription('Property Management System API Documentation')
            .setVersion('2.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
            .addTag('Authentication', 'User authentication and authorization')
            .addTag('Properties', 'Property management endpoints')
            .addTag('Clients', 'Client management endpoints')
            .addTag('Users', 'User management endpoints')
            .addTag('Upload', 'File upload endpoints')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
        logger.log('📚 Swagger documentation available at: http://localhost:' + port + '/api/docs');
    }
    await app.listen(port);
    logger.log(`🚀 Real Estate API is running on: http://localhost:${port}`);
    logger.log(`🌍 Environment: ${nodeEnv}`);
    logger.log(`🔗 API Base URL: http://localhost:${port}/v1`);
    logger.log(`📁 Static files (uploads): http://localhost:${port}/uploads`);
}
bootstrap();
//# sourceMappingURL=main.js.map