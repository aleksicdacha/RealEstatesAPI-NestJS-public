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
exports.AgentChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const agent_chat_service_1 = require("./agent-chat.service");
const agent_message_entity_1 = require("./agent-message.entity");
class ConnectionRateLimiter {
    connections = new Map();
    maxConnectionsPerIP = 5;
    timeWindowMs = 60000;
    canConnect(ip) {
        const now = Date.now();
        const timestamps = this.connections.get(ip) || [];
        const recentConnections = timestamps.filter(time => now - time < this.timeWindowMs);
        if (recentConnections.length >= this.maxConnectionsPerIP) {
            console.warn(`⚠️ WebSocket connection rate limit exceeded for IP: ${ip}`);
            return false;
        }
        recentConnections.push(now);
        this.connections.set(ip, recentConnections);
        return true;
    }
    cleanup() {
        const now = Date.now();
        this.connections.forEach((timestamps, ip) => {
            const recent = timestamps.filter(time => now - time < this.timeWindowMs);
            if (recent.length === 0) {
                this.connections.delete(ip);
            }
            else {
                this.connections.set(ip, recent);
            }
        });
    }
}
let AgentChatGateway = class AgentChatGateway {
    agentChatService;
    server;
    connectedClients = new Map();
    rateLimiter = new ConnectionRateLimiter();
    constructor(agentChatService) {
        this.agentChatService = agentChatService;
        setInterval(() => this.rateLimiter.cleanup(), 300000);
    }
    handleConnection(client) {
        const ip = client.handshake.headers['x-forwarded-for'] ||
            client.handshake.address ||
            'unknown';
        if (!this.rateLimiter.canConnect(ip)) {
            console.warn(`🚫 WebSocket connection rejected for IP: ${ip} (rate limit)`);
            client.emit('error', { message: 'Too many connections. Please try again later.' });
            client.disconnect();
            return;
        }
        console.log(`✅ Client connected: ${client.id} from IP: ${ip}`);
        this.connectedClients.set(client.id, { socket: client });
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        this.connectedClients.delete(client.id);
    }
    async handleJoinConversation(client, data) {
        const room = `conversation-${data.conversationId}`;
        await client.join(room);
        const clientData = this.connectedClients.get(client.id);
        if (clientData) {
            clientData.conversationId = data.conversationId;
        }
        console.log(`✅ Client ${client.id} joined room ${room} as ${data.userType}`);
        const conversation = await this.agentChatService.getConversation(data.conversationId);
        if (data.userType === 'guest') {
            const welcomeMessage = await this.agentChatService.addMessage({
                conversationId: data.conversationId,
                message: conversation.locale === 'sr'
                    ? 'Povezani ste sa našim timom. Agent će vam uskoro odgovoriti.'
                    : 'You are connected to our team. An agent will respond to you shortly.',
                senderType: agent_message_entity_1.MessageSenderType.SYSTEM,
            });
            client.emit('new-message', welcomeMessage);
        }
        return {
            event: 'conversation-history',
            data: conversation,
        };
    }
    async handleMessage(client, data) {
        const savedMessage = await this.agentChatService.addMessage({
            conversationId: data.conversationId,
            message: data.message,
            senderId: data.senderId,
            senderType: data.senderType,
        });
        const room = `conversation-${data.conversationId}`;
        this.server.to(room).emit('new-message', savedMessage);
        if (data.senderType === agent_message_entity_1.MessageSenderType.AGENT) {
            const conversation = await this.agentChatService.getConversation(data.conversationId);
            this.server.emit('conversation-status-updated', {
                conversationId: data.conversationId,
                status: conversation.status,
                agentId: conversation.agentId,
            });
        }
        if (data.senderType === agent_message_entity_1.MessageSenderType.GUEST) {
            this.server.emit('new-conversation-message', {
                conversationId: data.conversationId,
                message: savedMessage,
            });
        }
        return { success: true, message: savedMessage };
    }
    async handleTyping(client, data) {
        const room = `conversation-${data.conversationId}`;
        client.to(room).emit('user-typing', { isTyping: data.isTyping });
    }
    async handleAgentAssign(data) {
        const conversation = await this.agentChatService.assignAgent(data.conversationId, data.agentId);
        const room = `conversation-${data.conversationId}`;
        this.server.to(room).emit('agent-assigned', conversation);
        return { success: true };
    }
    notifyNewConversation(conversationId) {
        this.server.emit('new-conversation-request', { conversationId });
    }
    notifyStatusChange(conversationId, status) {
        const room = `conversation-${conversationId}`;
        this.server.to(room).emit('conversation-status-changed', { status });
    }
};
exports.AgentChatGateway = AgentChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AgentChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AgentChatGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send-message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AgentChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AgentChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('agent-assign'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentChatGateway.prototype, "handleAgentAssign", null);
exports.AgentChatGateway = AgentChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: [
                'http://46.224.231.217:3001',
                'http://46.224.231.217:3002',
                'http://localhost:3001',
                'http://localhost:3002',
            ],
            methods: ['GET', 'POST'],
            credentials: true,
        },
        namespace: '/agent-chat',
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [agent_chat_service_1.AgentChatService])
], AgentChatGateway);
//# sourceMappingURL=agent-chat.gateway.js.map