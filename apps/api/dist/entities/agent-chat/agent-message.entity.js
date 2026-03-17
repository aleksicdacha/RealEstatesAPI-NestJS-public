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
exports.AgentMessage = exports.MessageSenderType = void 0;
const typeorm_1 = require("typeorm");
const agent_conversation_entity_1 = require("./agent-conversation.entity");
const user_entity_1 = require("../user/user.entity");
var MessageSenderType;
(function (MessageSenderType) {
    MessageSenderType["GUEST"] = "guest";
    MessageSenderType["USER"] = "user";
    MessageSenderType["AGENT"] = "agent";
    MessageSenderType["SYSTEM"] = "system";
})(MessageSenderType || (exports.MessageSenderType = MessageSenderType = {}));
let AgentMessage = class AgentMessage {
    id;
    conversationId;
    conversation;
    senderId;
    sender;
    senderType;
    message;
    isRead;
    createdAt;
};
exports.AgentMessage = AgentMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AgentMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AgentMessage.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => agent_conversation_entity_1.AgentConversation, (conversation) => conversation.messages, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'conversationId' }),
    __metadata("design:type", agent_conversation_entity_1.AgentConversation)
], AgentMessage.prototype, "conversation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AgentMessage.prototype, "senderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'senderId' }),
    __metadata("design:type", user_entity_1.User)
], AgentMessage.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MessageSenderType,
        default: MessageSenderType.GUEST,
    }),
    __metadata("design:type", String)
], AgentMessage.prototype, "senderType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AgentMessage.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], AgentMessage.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AgentMessage.prototype, "createdAt", void 0);
exports.AgentMessage = AgentMessage = __decorate([
    (0, typeorm_1.Entity)('agent_messages')
], AgentMessage);
//# sourceMappingURL=agent-message.entity.js.map