import { Controller, Post, Body } from '@nestjs/common';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
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
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.chatbotService.processMessage(
      dto.message,
      dto.locale || 'sr',
      dto.conversationHistory || [],
    );
  }

  @Post('connect-agent')
  async connectToAgent(@Body() body: { name: string; email: string; phone?: string; message: string; locale?: string }) {
    return this.chatbotService.connectToAgent(body);
  }
}
