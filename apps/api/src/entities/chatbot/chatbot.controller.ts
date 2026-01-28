import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ChatbotService } from './chatbot.service';

class ConversationMessage {
  @IsString()
  role: string;

  @IsString()
  content: string;
}

export class SendMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessage)
  conversationHistory?: ConversationMessage[];
}

@Controller('chatbot')
@UseGuards(ThrottlerGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 messages per minute per IP
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.chatbotService.processMessage(
      dto.message,
      dto.locale || 'sr',
      dto.conversationHistory || [],
    );
  }

  @Post('connect-agent')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 agent requests per 5 minutes
  async connectToAgent(@Body() body: { name: string; email: string; phone?: string; message: string; locale?: string }) {
    return this.chatbotService.connectToAgent(body);
  }
}
