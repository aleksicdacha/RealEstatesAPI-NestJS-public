import { AgentChatService } from './agent-chat.service';
import { MessageSenderType } from './agent-message.entity';
export declare class AgentChatController {
    private readonly agentChatService;
    constructor(agentChatService: AgentChatService);
    getConversations(): Promise<import("./agent-conversation.entity").AgentConversation[]>;
    getConversation(id: number): Promise<import("./agent-conversation.entity").AgentConversation>;
    assignAgent(id: number, body: {
        agentId: number;
    }): Promise<import("./agent-conversation.entity").AgentConversation>;
    addMessage(conversationId: number, body: {
        message: string;
        senderId?: number;
        senderType: MessageSenderType;
    }): Promise<import("./agent-message.entity").AgentMessage>;
    markAsRead(conversationId: number, body: {
        senderType: MessageSenderType;
    }): Promise<{
        success: boolean;
    }>;
    closeConversation(conversationId: number): Promise<{
        success: boolean;
    }>;
    resolveConversation(conversationId: number): Promise<{
        success: boolean;
    }>;
}
