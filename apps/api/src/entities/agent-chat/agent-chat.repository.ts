import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AgentConversation, ConversationStatus } from './agent-conversation.entity';

@Injectable()
export class AgentConversationRepository extends Repository<AgentConversation> {
  constructor(private dataSource: DataSource) {
    super(AgentConversation, dataSource.createEntityManager());
  }

  async findActiveConversations(): Promise<AgentConversation[]> {
    const conversations = await this.find({
      where: [
        { status: ConversationStatus.WAITING },
        { status: ConversationStatus.ACTIVE },
      ],
      relations: ['agent', 'user', 'messages'],
      order: { createdAt: 'DESC' },
    });
    
    // Manually sort messages by createdAt for each conversation
    conversations.forEach(conversation => {
      if (conversation.messages) {
        conversation.messages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });
    
    return conversations;
  }

  async findConversationWithMessages(id: number): Promise<AgentConversation> {
    const conversation = await this.findOne({
      where: { id },
      relations: ['agent', 'user', 'messages', 'messages.sender'],
    });
    
    // Manually sort messages by createdAt
    if (conversation && conversation.messages) {
      conversation.messages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    
    return conversation;
  }

  async findByAgentId(agentId: number): Promise<AgentConversation[]> {
    return this.find({
      where: { agentId, status: ConversationStatus.ACTIVE },
      relations: ['messages'],
      order: { updatedAt: 'DESC' },
    });
  }
}
