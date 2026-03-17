import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AgentChatService } from './agent-chat.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';
import { MessageSenderType } from './agent-message.entity';

@Controller('agent-chat')
export class AgentChatController {
  constructor(private readonly agentChatService: AgentChatService) {}

  @Get('conversations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getConversations() {
    return this.agentChatService.getActiveConversations();
  }

  @Get('conversations/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getConversation(@Param('id') id: number) {
    return this.agentChatService.getConversation(id);
  }

  @Post('conversations/:id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async assignAgent(
    @Param('id') id: number,
    @Body() body: { agentId: number },
  ) {
    return this.agentChatService.assignAgent(id, body.agentId);
  }

  @Post('conversations/:id/messages')
  async addMessage(
    @Param('id') conversationId: number,
    @Body()
    body: {
      message: string;
      senderId?: number;
      senderType: MessageSenderType;
    },
  ) {
    return this.agentChatService.addMessage({
      conversationId,
      message: body.message,
      senderId: body.senderId,
      senderType: body.senderType,
    });
  }

  @Patch('conversations/:id/read')
  async markAsRead(
    @Param('id') conversationId: number,
    @Body() body: { senderType: MessageSenderType },
  ) {
    await this.agentChatService.markConversationAsRead(
      conversationId,
      body.senderType,
    );
    return { success: true };
  }

  @Patch('conversations/:id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async closeConversation(@Param('id') conversationId: number) {
    await this.agentChatService.closeConversation(conversationId);
    return { success: true };
  }

  @Patch('conversations/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async resolveConversation(@Param('id') conversationId: number) {
    await this.agentChatService.resolveConversation(conversationId);
    return { success: true };
  }
}
