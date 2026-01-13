import { apiClient } from '@/lib/api-client';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  updatedAt: string;
  unsubscribedAt?: string;
}

export interface SendNewsletterDto {
  subject: string;
  content: string;
  recipients?: string[];
}

export interface SubscribersFilter {
  email?: string;
  isActive?: boolean;
  subscribedFrom?: string;
  subscribedTo?: string;
}

export class NewsletterService {
  static async getSubscribers(filters?: SubscribersFilter): Promise<NewsletterSubscriber[]> {
    console.log('[Newsletter Service] Input filters:', filters);
    
    // Serialize filters to handle boolean false properly
    const params: Record<string, string> = {};
    
    if (filters?.email) {
      params.email = filters.email;
    }
    
    if (typeof filters?.isActive === 'boolean') {
      params.isActive = filters.isActive.toString();
      console.log('[Newsletter Service] Serialized isActive:', params.isActive);
    }
    
    if (filters?.subscribedFrom) {
      params.subscribedFrom = filters.subscribedFrom;
    }
    
    if (filters?.subscribedTo) {
      params.subscribedTo = filters.subscribedTo;
    }
    
    console.log('[Newsletter Service] Sending params to API:', params);
    
    const response = await apiClient.get<{ data: NewsletterSubscriber[] } | NewsletterSubscriber[]>(
      '/newsletter/subscribers',
      params,
    );
    if (Array.isArray(response)) {
      return response;
    }
    return response.data;
  }

  static async sendNewsletter(data: SendNewsletterDto): Promise<{ message: string; sentCount: number }> {
    const response = await apiClient.post<{ message: string; sentCount: number } | { data: { message: string; sentCount: number } }>('/newsletter/send', data);
    // Some endpoints wrap payload in { data, message, statusCode }
    if ('data' in response && (response as any).data?.message) {
      return (response as any).data;
    }
    return response as { message: string; sentCount: number };
  }
}