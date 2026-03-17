import { AgentConversationRepository } from './agent-chat.repository';
import { AgentMessageRepository } from './agent-message.repository';
import { AgentConversation } from './agent-conversation.entity';
import { AgentMessage, MessageSenderType } from './agent-message.entity';
export declare class AgentChatService {
    private conversationRepo;
    private messageRepo;
    constructor(conversationRepo: AgentConversationRepository, messageRepo: AgentMessageRepository);
    createConversation(data: {
        guestName: string;
        guestEmail: string;
        guestPhone?: string;
        initialMessage: string;
        locale?: string;
        userId?: number;
    }): Promise<AgentConversation>;
    addMessage(data: {
        conversationId: number;
        message: string;
        senderId?: number;
        senderType: MessageSenderType;
    }): Promise<AgentMessage>;
    assignAgent(conversationId: number, agentId: number): Promise<AgentConversation>;
    getActiveConversations(): Promise<AgentConversation[]>;
    getConversation(id: number): Promise<AgentConversation>;
    getAgentConversations(agentId: number): Promise<AgentConversation[]>;
    markConversationAsRead(conversationId: number, senderType: MessageSenderType): Promise<void>;
    closeConversation(conversationId: number): Promise<void>;
    resolveConversation(conversationId: number): Promise<void>;
}
