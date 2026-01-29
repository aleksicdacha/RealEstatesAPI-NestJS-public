import { PropertyService } from '@src/entities/property/property.service';
import { AgentChatService } from '@src/entities/agent-chat/agent-chat.service';
import { AgentChatGateway } from '@src/entities/agent-chat/agent-chat.gateway';
export declare class ChatbotService {
    private readonly propertyService;
    private readonly agentChatService;
    private readonly agentChatGateway;
    private genAI;
    private model;
    constructor(propertyService: PropertyService, agentChatService: AgentChatService, agentChatGateway: AgentChatGateway);
    processMessage(userMessage: string, locale: string, conversationHistory: Array<{
        role: string;
        content: string;
    }>): Promise<{
        reply: any;
        timestamp: string;
    }>;
    private getFallbackResponse;
    searchPropertiesFromQuery(message: string, locale?: string): Promise<string>;
    connectToAgent(data: {
        name: string;
        email: string;
        phone?: string;
        message: string;
        locale?: string;
    }): Promise<{
        success: boolean;
        conversationId: number;
        message: any;
    }>;
}
