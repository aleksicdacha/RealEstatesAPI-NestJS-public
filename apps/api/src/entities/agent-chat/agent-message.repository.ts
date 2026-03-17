import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AgentMessage, MessageSenderType } from './agent-message.entity';

@Injectable()
export class AgentMessageRepository extends Repository<AgentMessage> {
  constructor(private dataSource: DataSource) {
    super(AgentMessage, dataSource.createEntityManager());
  }

  async findByConversationId(conversationId: number): Promise<AgentMessage[]> {
    return this.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(conversationId: number, senderType: MessageSenderType): Promise<void> {
    await this.update(
      { conversationId, isRead: false, senderType },
      { isRead: true },
    );
  }
}
