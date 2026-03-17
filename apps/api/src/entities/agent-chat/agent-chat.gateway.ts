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

// Connection rate limiter - prevent WebSocket flood attacks
class ConnectionRateLimiter {
  private connections: Map<string, number[]> = new Map();
  private readonly maxConnectionsPerIP = 5;
  private readonly timeWindowMs = 60000; // 1 minute

  canConnect(ip: string): boolean {
    const now = Date.now();
    const timestamps = this.connections.get(ip) || [];

    // Remove old timestamps outside time window
    const recentConnections = timestamps.filter(time => now - time < this.timeWindowMs);

    if (recentConnections.length >= this.maxConnectionsPerIP) {
      console.warn(`⚠️ WebSocket connection rate limit exceeded for IP: ${ip}`);
      return false;
    }

    recentConnections.push(now);
    this.connections.set(ip, recentConnections);
    return true;
  }

  cleanup() {
    const now = Date.now();
    this.connections.forEach((timestamps, ip) => {
      const recent = timestamps.filter(time => now - time < this.timeWindowMs);
      if (recent.length === 0) {
        this.connections.delete(ip);
      } else {
        this.connections.set(ip, recent);
      }
    });
  }
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://46.224.231.217:3001',
      'http://46.224.231.217:3002',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/agent-chat',
  transports: ['websocket', 'polling'],
})
export class AgentChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, { socket: Socket; conversationId?: number }> = new Map();
  private rateLimiter = new ConnectionRateLimiter();

  constructor(private agentChatService: AgentChatService) {
    // Cleanup rate limiter every 5 minutes
    setInterval(() => this.rateLimiter.cleanup(), 300000);
  }

  handleConnection(client: Socket) {
    const ip = (client.handshake.headers['x-forwarded-for'] as string) ||
               (client.handshake.address as string) ||
               'unknown';

    // Rate limit connections per IP
    if (!this.rateLimiter.canConnect(ip)) {
      console.warn(`🚫 WebSocket connection rejected for IP: ${ip} (rate limit)`);
      client.emit('error', { message: 'Too many connections. Please try again later.' });
      client.disconnect();
      return;
    }

    console.log(`✅ Client connected: ${client.id} from IP: ${ip}`);
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

    console.log(`✅ Client ${client.id} joined room ${room} as ${data.userType}`);

    // Load conversation history
    const conversation = await this.agentChatService.getConversation(
      data.conversationId,
    );

    // If this is a guest joining, send them a welcome confirmation
    if (data.userType === 'guest') {
      const welcomeMessage = await this.agentChatService.addMessage({
        conversationId: data.conversationId,
        message: conversation.locale === 'sr'
          ? 'Povezani ste sa našim timom. Agent će vam uskoro odgovoriti.'
          : 'You are connected to our team. An agent will respond to you shortly.',
        senderType: MessageSenderType.SYSTEM,
      });

      // Send the welcome message to the guest
      client.emit('new-message', welcomeMessage);
    }

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
