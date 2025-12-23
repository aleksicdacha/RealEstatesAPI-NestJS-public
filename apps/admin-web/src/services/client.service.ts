import { apiClient, PaginatedResponse } from '@/lib/api-client';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  transactionType: string;
  paymentType?: string;
  comment?: string;
  moneyAmount?: number;
  property?: {
    id: string;
    code: string;
    propertyType: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  transactionType: string;
  paymentType?: string;
  comment?: string;
  moneyAmount?: number;
}

export interface UpdateClientDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  transactionType?: string;
  paymentType?: string;
  comment?: string;
  moneyAmount?: number;
}

export interface ClientFilter extends Record<string, unknown> {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  searchField?: string;
  searchValue?: string;
  status?: string;
  transactionType?: string;
  hasProperty?: boolean;
}

export const clientService = {
  async getClients(filter?: ClientFilter): Promise<PaginatedResponse<Client>> {
    const response = await apiClient.get<PaginatedResponse<Client>>('/clients', filter);
    return response;
  },

  async getAvailableClients(): Promise<Client[]> {
    // Get clients without property using backend filter
    const response = await apiClient.get<Client[]>('/clients', {
      limit: 1000,
      hasProperty: false
    });
    return Array.isArray(response) ? response : [];
  },

  async getClient(id: string): Promise<Client> {
    const response = await apiClient.get<Client>(`/clients/${id}`);
    return response;
  },

  async createClient(data: CreateClientDto): Promise<Client> {
    const response = await apiClient.post<Client>('/clients', data);
    return response;
  },

  async updateClient(id: string, data: UpdateClientDto): Promise<Client> {
    const response = await apiClient.patch<Client>(`/clients/${id}`, data);
    return response;
  },

  async deleteClient(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  }
};
