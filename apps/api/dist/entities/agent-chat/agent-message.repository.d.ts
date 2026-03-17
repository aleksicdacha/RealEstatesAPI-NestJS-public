import { DataSource, Repository } from 'typeorm';
import { AgentMessage, MessageSenderType } from './agent-message.entity';
export declare class AgentMessageRepository extends Repository<AgentMessage> {
    private dataSource;
    constructor(dataSource: DataSource);
    findByConversationId(conversationId: number): Promise<AgentMessage[]>;
    markAsRead(conversationId: number, senderType: MessageSenderType): Promise<void>;
}
