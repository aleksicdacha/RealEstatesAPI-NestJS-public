import { AgentConversation } from './agent-conversation.entity';
import { User } from '../user/user.entity';
export declare enum MessageSenderType {
    GUEST = "guest",
    USER = "user",
    AGENT = "agent",
    SYSTEM = "system"
}
export declare class AgentMessage {
    id: number;
    conversationId: number;
    conversation: AgentConversation;
    senderId: number;
    sender: User;
    senderType: MessageSenderType;
    message: string;
    isRead: boolean;
    createdAt: Date;
}
