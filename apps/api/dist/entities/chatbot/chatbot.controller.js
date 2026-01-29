"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotController = exports.SendMessageDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const throttler_1 = require("@nestjs/throttler");
const chatbot_service_1 = require("./chatbot.service");
class ConversationMessage {
    role;
    content;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConversationMessage.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConversationMessage.prototype, "content", void 0);
class SendMessageDto {
    message;
    locale;
    conversationHistory;
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "locale", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ConversationMessage),
    __metadata("design:type", Array)
], SendMessageDto.prototype, "conversationHistory", void 0);
let ChatbotController = class ChatbotController {
    chatbotService;
    constructor(chatbotService) {
        this.chatbotService = chatbotService;
    }
    async sendMessage(dto) {
        return this.chatbotService.processMessage(dto.message, dto.locale || 'sr', dto.conversationHistory || []);
    }
    async connectToAgent(body) {
        return this.chatbotService.connectToAgent(body);
    }
};
exports.ChatbotController = ChatbotController;
__decorate([
    (0, common_1.Post)('message'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendMessageDto]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('connect-agent'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 300000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "connectToAgent", null);
exports.ChatbotController = ChatbotController = __decorate([
    (0, common_1.Controller)('chatbot'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [chatbot_service_1.ChatbotService])
], ChatbotController);
//# sourceMappingURL=chatbot.controller.js.map