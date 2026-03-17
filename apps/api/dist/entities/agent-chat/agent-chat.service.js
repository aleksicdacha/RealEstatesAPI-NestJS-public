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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentChatService = void 0;
const common_1 = require("@nestjs/common");
const agent_chat_repository_1 = require("./agent-chat.repository");
const agent_message_repository_1 = require("./agent-message.repository");
const agent_conversation_entity_1 = require("./agent-conversation.entity");
const agent_message_entity_1 = require("./agent-message.entity");
let AgentChatService = class AgentChatService {
    conversationRepo;
    messageRepo;
    constructor(conversationRepo, messageRepo) {
        this.conversationRepo = conversationRepo;
        this.messageRepo = messageRepo;
    }
    async createConversation(data) {
        const conversation = this.conversationRepo.create({
            guestName: data.guestName,
            guestEmail: data.guestEmail,
            guestPhone: data.guestPhone,
            initialMessage: data.initialMessage,
            locale: data.locale || 'sr',
            userId: data.userId,
            status: agent_conversation_entity_1.ConversationStatus.WAITING,
            unreadCount: 1,
        });
        const savedConversation = await this.conversationRepo.save(conversation);
        await this.addMessage({
            conversationId: savedConversation.id,
            message: data.initialMessage,
            senderType: agent_message_entity_1.MessageSenderType.GUEST,
        });
        return savedConversation;
    }
    async addMessage(data) {
        console.log('[AgentChatService] addMessage called with:', {
            conversationId: data.conversationId,
            senderType: data.senderType,
            senderId: data.senderId,
            hasMessage: !!data.message,
        });
        const message = this.messageRepo.create({
            conversationId: data.conversationId,
            message: data.message,
            senderId: data.senderId,
            senderType: data.senderType,
            isRead: false,
        });
        const savedMessage = await this.messageRepo.save(message);
        if (data.senderType === agent_message_entity_1.MessageSenderType.AGENT && data.senderId) {
            console.log('[AgentChatService] Agent message detected, checking conversation status...');
            const conversation = await this.conversationRepo.findOne({
                where: { id: data.conversationId },
            });
            console.log('[AgentChatService] Current conversation:', {
                id: conversation?.id,
                status: conversation?.status,
                agentId: conversation?.agentId,
            });
            if (conversation && conversation.status === agent_conversation_entity_1.ConversationStatus.WAITING) {
                console.log('[AgentChatService] Updating status to ACTIVE for conversation:', data.conversationId);
                await this.conversationRepo.update(data.conversationId, {
                    status: agent_conversation_entity_1.ConversationStatus.ACTIVE,
                    agentId: data.senderId,
                });
                console.log('[AgentChatService] Status updated successfully');
            }
            else {
                console.log('[AgentChatService] Not updating status. Status is already:', conversation?.status);
            }
        }
        await this.conversationRepo.increment({ id: data.conversationId }, 'unreadCount', 1);
        return savedMessage;
    }
    async assignAgent(conversationId, agentId) {
        await this.conversationRepo.update(conversationId, {
            agentId,
            status: agent_conversation_entity_1.ConversationStatus.ACTIVE,
        });
        await this.addMessage({
            conversationId,
            message: 'Agent je preuzeo razgovor / Agent has taken the conversation',
            senderType: agent_message_entity_1.MessageSenderType.SYSTEM,
        });
        return this.conversationRepo.findConversationWithMessages(conversationId);
    }
    async getActiveConversations() {
        return this.conversationRepo.findActiveConversations();
    }
    async getConversation(id) {
        return this.conversationRepo.findConversationWithMessages(id);
    }
    async getAgentConversations(agentId) {
        return this.conversationRepo.findByAgentId(agentId);
    }
    async markConversationAsRead(conversationId, senderType) {
        await this.messageRepo.markAsRead(conversationId, senderType);
        await this.conversationRepo.update(conversationId, { unreadCount: 0 });
    }
    async closeConversation(conversationId) {
        await this.conversationRepo.update(conversationId, {
            status: agent_conversation_entity_1.ConversationStatus.CLOSED,
        });
        await this.addMessage({
            conversationId,
            message: 'Razgovor je zatvoren / Conversation closed',
            senderType: agent_message_entity_1.MessageSenderType.SYSTEM,
        });
    }
    async resolveConversation(conversationId) {
        await this.conversationRepo.update(conversationId, {
            status: agent_conversation_entity_1.ConversationStatus.RESOLVED,
        });
    }
};
exports.AgentChatService = AgentChatService;
exports.AgentChatService = AgentChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_chat_repository_1.AgentConversationRepository,
        agent_message_repository_1.AgentMessageRepository])
], AgentChatService);
//# sourceMappingURL=agent-chat.service.js.map