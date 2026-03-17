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
exports.AgentConversation = exports.ConversationStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../user/user.entity");
const agent_message_entity_1 = require("./agent-message.entity");
var ConversationStatus;
(function (ConversationStatus) {
    ConversationStatus["WAITING"] = "waiting";
    ConversationStatus["ACTIVE"] = "active";
    ConversationStatus["RESOLVED"] = "resolved";
    ConversationStatus["CLOSED"] = "closed";
})(ConversationStatus || (exports.ConversationStatus = ConversationStatus = {}));
let AgentConversation = class AgentConversation {
    id;
    guestName;
    guestEmail;
    guestPhone;
    initialMessage;
    userId;
    user;
    agentId;
    agent;
    status;
    unreadCount;
    locale;
    messages;
    createdAt;
    updatedAt;
};
exports.AgentConversation = AgentConversation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AgentConversation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AgentConversation.prototype, "guestName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AgentConversation.prototype, "guestEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AgentConversation.prototype, "guestPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AgentConversation.prototype, "initialMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AgentConversation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], AgentConversation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AgentConversation.prototype, "agentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'agentId' }),
    __metadata("design:type", user_entity_1.User)
], AgentConversation.prototype, "agent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ConversationStatus,
        default: ConversationStatus.WAITING,
    }),
    __metadata("design:type", String)
], AgentConversation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], AgentConversation.prototype, "unreadCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, default: 'sr' }),
    __metadata("design:type", String)
], AgentConversation.prototype, "locale", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => agent_message_entity_1.AgentMessage, (message) => message.conversation, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], AgentConversation.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AgentConversation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AgentConversation.prototype, "updatedAt", void 0);
exports.AgentConversation = AgentConversation = __decorate([
    (0, typeorm_1.Entity)('agent_conversations')
], AgentConversation);
//# sourceMappingURL=agent-conversation.entity.js.map