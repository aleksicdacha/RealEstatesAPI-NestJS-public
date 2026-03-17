import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { PropertyModule } from '@src/entities/property/property.module';
import { AgentChatModule } from '@src/entities/agent-chat/agent-chat.module';

@Module({
  imports: [PropertyModule, AgentChatModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
