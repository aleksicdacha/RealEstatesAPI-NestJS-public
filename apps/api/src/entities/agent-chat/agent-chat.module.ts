import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentConversation } from './agent-conversation.entity';
import { AgentMessage } from './agent-message.entity';
import { AgentConversationRepository } from './agent-chat.repository';
import { AgentMessageRepository } from './agent-message.repository';
import { AgentChatService } from './agent-chat.service';
import { AgentChatController } from './agent-chat.controller';
import { AgentChatGateway } from './agent-chat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([AgentConversation, AgentMessage])],
  controllers: [AgentChatController],
  providers: [
    AgentConversationRepository,
    AgentMessageRepository,
    AgentChatService,
    AgentChatGateway,
  ],
  exports: [AgentChatService, AgentChatGateway],
})
export class AgentChatModule {}
