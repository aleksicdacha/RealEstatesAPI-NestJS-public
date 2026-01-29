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
exports.AgentConversationRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const agent_conversation_entity_1 = require("./agent-conversation.entity");
let AgentConversationRepository = class AgentConversationRepository extends typeorm_1.Repository {
    dataSource;
    constructor(dataSource) {
        super(agent_conversation_entity_1.AgentConversation, dataSource.createEntityManager());
        this.dataSource = dataSource;
    }
    async findActiveConversations() {
        const conversations = await this.find({
            where: [
                { status: agent_conversation_entity_1.ConversationStatus.WAITING },
                { status: agent_conversation_entity_1.ConversationStatus.ACTIVE },
            ],
            relations: ['agent', 'user', 'messages'],
            order: { createdAt: 'DESC' },
        });
        conversations.forEach(conversation => {
            if (conversation.messages) {
                conversation.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            }
        });
        return conversations;
    }
    async findConversationWithMessages(id) {
        const conversation = await this.findOne({
            where: { id },
            relations: ['agent', 'user', 'messages', 'messages.sender'],
        });
        if (conversation && conversation.messages) {
            conversation.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
        return conversation;
    }
    async findByAgentId(agentId) {
        return this.find({
            where: { agentId, status: agent_conversation_entity_1.ConversationStatus.ACTIVE },
            relations: ['messages'],
            order: { updatedAt: 'DESC' },
        });
    }
};
exports.AgentConversationRepository = AgentConversationRepository;
exports.AgentConversationRepository = AgentConversationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AgentConversationRepository);
//# sourceMappingURL=agent-chat.repository.js.map