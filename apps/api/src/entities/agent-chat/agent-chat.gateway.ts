import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AgentChatService } from './agent-chat.service';
import { MessageSenderType } from './agent-message.entity';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  },
  namespace: '/agent-chat',
})
export class AgentChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, { socket: Socket; conversationId?: number }> = new Map();

  constructor(private agentChatService: AgentChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socket: client });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join-conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; userType: 'guest' | 'agent' },
  ) {
    const room = `conversation-${data.conversationId}`;
    await client.join(room);

    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      clientData.conversationId = data.conversationId;
    }

    console.log(`Client ${client.id} joined room ${room} as ${data.userType}`);

    // Load conversation history
    const conversation = await this.agentChatService.getConversation(
      data.conversationId,
    );

    return {
      event: 'conversation-history',
      data: conversation,
    };
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: number;
      message: string;
      senderId?: number;
      senderType: MessageSenderType;
    },
  ) {
    // Save message to database
    const savedMessage = await this.agentChatService.addMessage({
      conversationId: data.conversationId,
      message: data.message,
      senderId: data.senderId,
      senderType: data.senderType,
    });

    // Broadcast to all clients in the conversation room
    const room = `conversation-${data.conversationId}`;
    this.server.to(room).emit('new-message', savedMessage);

    // If this was an agent message, notify about potential status change
    if (data.senderType === MessageSenderType.AGENT) {
      // Get updated conversation to check if status changed
      const conversation = await this.agentChatService.getConversation(data.conversationId);
      
      // Broadcast status update to all connected clients
      this.server.emit('conversation-status-updated', {
        conversationId: data.conversationId,
        status: conversation.status,
        agentId: conversation.agentId,
      });
    }

    // Notify admin panel if message is from guest
    if (data.senderType === MessageSenderType.GUEST) {
      this.server.emit('new-conversation-message', {
        conversationId: data.conversationId,
        message: savedMessage,
      });
    }

    return { success: true, message: savedMessage };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; isTyping: boolean },
  ) {
    const room = `conversation-${data.conversationId}`;
    client.to(room).emit('user-typing', { isTyping: data.isTyping });
  }

  @SubscribeMessage('agent-assign')
  async handleAgentAssign(
    @MessageBody()
    data: {
      conversationId: number;
      agentId: number;
    },
  ) {
    const conversation = await this.agentChatService.assignAgent(
      data.conversationId,
      data.agentId,
    );

    // Notify all clients in the room
    const room = `conversation-${data.conversationId}`;
    this.server.to(room).emit('agent-assigned', conversation);

    return { success: true };
  }

  // Notify admins about new conversation request
  notifyNewConversation(conversationId: number) {
    this.server.emit('new-conversation-request', { conversationId });
  }

  // Notify conversation participants about status change
  notifyStatusChange(conversationId: number, status: string) {
    const room = `conversation-${conversationId}`;
    this.server.to(room).emit('conversation-status-changed', { status });
  }
}
