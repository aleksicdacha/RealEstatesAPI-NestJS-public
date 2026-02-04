import { DataSource, Repository } from 'typeorm';
import { AgentConversation } from './agent-conversation.entity';
export declare class AgentConversationRepository extends Repository<AgentConversation> {
    private dataSource;
    constructor(dataSource: DataSource);
    findActiveConversations(): Promise<AgentConversation[]>;
    findConversationWithMessages(id: number): Promise<AgentConversation>;
    findByAgentId(agentId: number): Promise<AgentConversation[]>;
}
