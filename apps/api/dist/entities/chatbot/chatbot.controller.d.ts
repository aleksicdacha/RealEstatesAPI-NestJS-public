import { ChatbotService } from './chatbot.service';
declare class ConversationMessage {
    role: string;
    content: string;
}
export declare class SendMessageDto {
    message: string;
    locale?: string;
    conversationHistory?: ConversationMessage[];
}
export declare class ChatbotController {
    private readonly chatbotService;
    constructor(chatbotService: ChatbotService);
    sendMessage(dto: SendMessageDto): Promise<{
        reply: any;
        timestamp: string;
    }>;
    connectToAgent(body: {
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
export {};
