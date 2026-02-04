import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AgentChatService } from './agent-chat.service';
import { MessageSenderType } from './agent-message.entity';
export declare class AgentChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private agentChatService;
    server: Server;
    private connectedClients;
    private rateLimiter;
    constructor(agentChatService: AgentChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinConversation(client: Socket, data: {
        conversationId: number;
        userType: 'guest' | 'agent';
    }): Promise<{
        event: string;
        data: import("./agent-conversation.entity").AgentConversation;
    }>;
    handleMessage(client: Socket, data: {
        conversationId: number;
        message: string;
        senderId?: number;
        senderType: MessageSenderType;
    }): Promise<{
        success: boolean;
        message: import("./agent-message.entity").AgentMessage;
    }>;
    handleTyping(client: Socket, data: {
        conversationId: number;
        isTyping: boolean;
    }): Promise<void>;
    handleAgentAssign(data: {
        conversationId: number;
        agentId: number;
    }): Promise<{
        success: boolean;
    }>;
    notifyNewConversation(conversationId: number): void;
    notifyStatusChange(conversationId: number, status: string): void;
}
