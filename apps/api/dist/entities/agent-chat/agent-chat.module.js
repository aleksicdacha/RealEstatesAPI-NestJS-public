"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_conversation_entity_1 = require("./agent-conversation.entity");
const agent_message_entity_1 = require("./agent-message.entity");
const agent_chat_repository_1 = require("./agent-chat.repository");
const agent_message_repository_1 = require("./agent-message.repository");
const agent_chat_service_1 = require("./agent-chat.service");
const agent_chat_controller_1 = require("./agent-chat.controller");
const agent_chat_gateway_1 = require("./agent-chat.gateway");
let AgentChatModule = class AgentChatModule {
};
exports.AgentChatModule = AgentChatModule;
exports.AgentChatModule = AgentChatModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([agent_conversation_entity_1.AgentConversation, agent_message_entity_1.AgentMessage])],
        controllers: [agent_chat_controller_1.AgentChatController],
        providers: [
            agent_chat_repository_1.AgentConversationRepository,
            agent_message_repository_1.AgentMessageRepository,
            agent_chat_service_1.AgentChatService,
            agent_chat_gateway_1.AgentChatGateway,
        ],
        exports: [agent_chat_service_1.AgentChatService, agent_chat_gateway_1.AgentChatGateway],
    })
], AgentChatModule);
//# sourceMappingURL=agent-chat.module.js.map