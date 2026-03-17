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
exports.AgentChatController = void 0;
const common_1 = require("@nestjs/common");
const agent_chat_service_1 = require("./agent-chat.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const role_enum_1 = require("../user/enums/role.enum");
let AgentChatController = class AgentChatController {
    agentChatService;
    constructor(agentChatService) {
        this.agentChatService = agentChatService;
    }
    async getConversations() {
        return this.agentChatService.getActiveConversations();
    }
    async getConversation(id) {
        return this.agentChatService.getConversation(id);
    }
    async assignAgent(id, body) {
        return this.agentChatService.assignAgent(id, body.agentId);
    }
    async addMessage(conversationId, body) {
        return this.agentChatService.addMessage({
            conversationId,
            message: body.message,
            senderId: body.senderId,
            senderType: body.senderType,
        });
    }
    async markAsRead(conversationId, body) {
        await this.agentChatService.markConversationAsRead(conversationId, body.senderType);
        return { success: true };
    }
    async closeConversation(conversationId) {
        await this.agentChatService.closeConversation(conversationId);
        return { success: true };
    }
    async resolveConversation(conversationId) {
        await this.agentChatService.resolveConversation(conversationId);
        return { success: true };
    }
};
exports.AgentChatController = AgentChatController;
__decorate([
    (0, common_1.Get)('conversations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentChatController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AgentChatController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Post)('conversations/:id/assign'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AgentChatController.prototype, "assignAgent", null);
__decorate([
    (0, common_1.Post)('conversations/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AgentChatController.prototype, "addMessage", null);
__decorate([
    (0, common_1.Patch)('conversations/:id/read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AgentChatController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('conversations/:id/close'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AgentChatController.prototype, "closeConversation", null);
__decorate([
    (0, common_1.Patch)('conversations/:id/resolve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AgentChatController.prototype, "resolveConversation", null);
exports.AgentChatController = AgentChatController = __decorate([
    (0, common_1.Controller)('agent-chat'),
    __metadata("design:paramtypes", [agent_chat_service_1.AgentChatService])
], AgentChatController);
//# sourceMappingURL=agent-chat.controller.js.map