import { Injectable } from '@nestjs/common';
import { AgentConversationRepository } from './agent-chat.repository';
import { AgentMessageRepository } from './agent-message.repository';
import {
  AgentConversation,
  ConversationStatus,
} from './agent-conversation.entity';
import { AgentMessage, MessageSenderType } from './agent-message.entity';

@Injectable()
export class AgentChatService {
  constructor(
    private conversationRepo: AgentConversationRepository,
    private messageRepo: AgentMessageRepository,
  ) {}

  async createConversation(data: {
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    initialMessage: string;
    locale?: string;
    userId?: number;
  }): Promise<AgentConversation> {
    const conversation = this.conversationRepo.create({
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      initialMessage: data.initialMessage,
      locale: data.locale || 'sr',
      userId: data.userId,
      status: ConversationStatus.WAITING,
      unreadCount: 1,
    });

    const savedConversation = await this.conversationRepo.save(conversation);

    // Create initial message
    await this.addMessage({
      conversationId: savedConversation.id,
      message: data.initialMessage,
      senderType: MessageSenderType.GUEST,
    });

    return savedConversation;
  }

  async addMessage(data: {
    conversationId: number;
    message: string;
    senderId?: number;
    senderType: MessageSenderType;
  }): Promise<AgentMessage> {
    console.log('[AgentChatService] addMessage called with:', {
      conversationId: data.conversationId,
      senderType: data.senderType,
      senderId: data.senderId,
      hasMessage: !!data.message,
    });

    const message = this.messageRepo.create({
      conversationId: data.conversationId,
      message: data.message,
      senderId: data.senderId,
      senderType: data.senderType,
      isRead: false,
    });

    const savedMessage = await this.messageRepo.save(message);

    // If agent sends a message, update conversation status to ACTIVE and set agentId
    if (data.senderType === MessageSenderType.AGENT && data.senderId) {
      console.log('[AgentChatService] Agent message detected, checking conversation status...');
      
      const conversation = await this.conversationRepo.findOne({
        where: { id: data.conversationId },
      });
      
      console.log('[AgentChatService] Current conversation:', {
        id: conversation?.id,
        status: conversation?.status,
        agentId: conversation?.agentId,
      });
      
      if (conversation && conversation.status === ConversationStatus.WAITING) {
        console.log('[AgentChatService] Updating status to ACTIVE for conversation:', data.conversationId);
        
        await this.conversationRepo.update(data.conversationId, {
          status: ConversationStatus.ACTIVE,
          agentId: data.senderId,
        });
        
        console.log('[AgentChatService] Status updated successfully');
      } else {
        console.log('[AgentChatService] Not updating status. Status is already:', conversation?.status);
      }
    }

    // Increment unread count
    await this.conversationRepo.increment(
      { id: data.conversationId },
      'unreadCount',
      1,
    );

    return savedMessage;
  }

  async assignAgent(
    conversationId: number,
    agentId: number,
  ): Promise<AgentConversation> {
    await this.conversationRepo.update(conversationId, {
      agentId,
      status: ConversationStatus.ACTIVE,
    });

    // Add system message
    await this.addMessage({
      conversationId,
      message: 'Agent je preuzeo razgovor / Agent has taken the conversation',
      senderType: MessageSenderType.SYSTEM,
    });

    return this.conversationRepo.findConversationWithMessages(conversationId);
  }

  async getActiveConversations(): Promise<AgentConversation[]> {
    return this.conversationRepo.findActiveConversations();
  }

  async getConversation(id: number): Promise<AgentConversation> {
    return this.conversationRepo.findConversationWithMessages(id);
  }

  async getAgentConversations(agentId: number): Promise<AgentConversation[]> {
    return this.conversationRepo.findByAgentId(agentId);
  }

  async markConversationAsRead(
    conversationId: number,
    senderType: MessageSenderType,
  ): Promise<void> {
    await this.messageRepo.markAsRead(conversationId, senderType);
    await this.conversationRepo.update(conversationId, { unreadCount: 0 });
  }

  async closeConversation(conversationId: number): Promise<void> {
    await this.conversationRepo.update(conversationId, {
      status: ConversationStatus.CLOSED,
    });

    await this.addMessage({
      conversationId,
      message: 'Razgovor je zatvoren / Conversation closed',
      senderType: MessageSenderType.SYSTEM,
    });
  }

  async resolveConversation(conversationId: number): Promise<void> {
    await this.conversationRepo.update(conversationId, {
      status: ConversationStatus.RESOLVED,
    });
  }
}
