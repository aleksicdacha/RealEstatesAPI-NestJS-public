import { User } from '../user/user.entity';
import { AgentMessage } from './agent-message.entity';
export declare enum ConversationStatus {
    WAITING = "waiting",
    ACTIVE = "active",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export declare class AgentConversation {
    id: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    initialMessage: string;
    userId: number;
    user: User;
    agentId: number;
    agent: User;
    status: ConversationStatus;
    unreadCount: number;
    locale: string;
    messages: AgentMessage[];
    createdAt: Date;
    updatedAt: Date;
}
