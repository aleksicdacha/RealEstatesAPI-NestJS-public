"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const nestjs_i18n_1 = require("nestjs-i18n");
const path = require("path");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./entities/user/user.module");
const property_module_1 = require("./entities/property/property.module");
const property_image_module_1 = require("./entities/property-image/property-image.module");
const upload_module_1 = require("./entities/upload/upload.module");
const client_module_1 = require("./entities/client/client.module");
const chatbot_module_1 = require("./entities/chatbot/chatbot.module");
const agent_chat_module_1 = require("./entities/agent-chat/agent-chat.module");
const email_module_1 = require("./email/email.module");
const contact_module_1 = require("./contact/contact.module");
const newsletter_subscriber_module_1 = require("./entities/newsletter-subscriber/newsletter-subscriber.module");
const database_config_1 = require("./common/config/database.config");
const app_config_1 = require("./common/config/app.config");
const jwt_config_1 = require("./common/config/jwt.config");
const validation_schema_1 = require("./common/config/validation.schema");
const options_middleware_1 = require("./common/middleware/options-middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(options_middleware_1.OptionsMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                load: [database_config_1.databaseConfig, app_config_1.appConfig, jwt_config_1.jwtConfig],
                envFilePath: ['.env.local', '.env'],
                validationSchema: validation_schema_1.configValidationSchema,
                validationOptions: {
                    abortEarly: false,
                },
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    type: 'postgres',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.name'),
                    synchronize: configService.get('database.synchronize'),
                    autoLoadEntities: true,
                    logging: configService.get('NODE_ENV') === 'development',
                    retryAttempts: 3,
                    retryDelay: 5000,
                }),
            }),
            nestjs_i18n_1.I18nModule.forRoot({
                fallbackLanguage: 'en',
                loaderOptions: {
                    path: path.join(process.cwd(), 'src', 'i18n'),
                    watch: true,
                },
                resolvers: [
                    { use: nestjs_i18n_1.QueryResolver, options: ['lang'] },
                    nestjs_i18n_1.AcceptLanguageResolver,
                    new nestjs_i18n_1.HeaderResolver(['x-lang']),
                ],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => [
                    {
                        name: 'short',
                        ttl: 1000,
                        limit: 10,
                    },
                    {
                        name: 'medium',
                        ttl: 10000,
                        limit: 50,
                    },
                    {
                        name: 'long',
                        ttl: 60000,
                        limit: 100,
                    },
                ],
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            property_module_1.PropertyModule,
            property_image_module_1.PropertyImageModule,
            upload_module_1.UploadModule,
            client_module_1.ClientModule,
            chatbot_module_1.ChatbotModule,
            agent_chat_module_1.AgentChatModule,
            email_module_1.EmailModule,
            contact_module_1.ContactModule,
            newsletter_subscriber_module_1.NewsletterSubscriberModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map