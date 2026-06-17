import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  Property,
  PropertyFilterParams,
  PaginatedResponse,
  AuthResponse,
  LoginCredentials,
  Client,
  ContactFormData,
  User,
} from '@repo/types';

export class RealEstateApiClient {
  private client: AxiosInstance;

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3000/api',
  ) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>(
      '/auth/login',
      credentials,
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access_token);
    }
    return data;
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  async getCurrentUser(): Promise<User> {
    const { data } = await this.client.get<User>('/auth/profile');
    return data;
  }

  // Property endpoints
  async getProperties(
    params?: PropertyFilterParams,
  ): Promise<PaginatedResponse<Property>> {
    const { data } = await this.client.get<PaginatedResponse<Property>>(
      '/properties',
      { params },
    );
    return data;
  }

  async getProperty(id: number): Promise<Property> {
    const { data } = await this.client.get<Property>(`/properties/${id}`);
    return data;
  }

  async getPropertyByCode(code: string): Promise<Property> {
    const { data } = await this.client.get<Property>(
      `/properties/code/${code}`,
    );
    return data;
  }

  async getFeaturedProperties(limit: number = 6): Promise<Property[]> {
    const response = await this.getProperties({
      limit,
      sortBy: 'createdAt',
      order: 'DESC',
    });
    return response.items;
  }

  async getSimilarProperties(
    propertyId: number,
    limit: number = 4,
  ): Promise<Property[]> {
    const { data } = await this.client.get<Property[]>(
      `/properties/${propertyId}/similar`,
      {
        params: { limit },
      },
    );
    return data;
  }

  async createProperty(property: Partial<Property>): Promise<Property> {
    const { data } = await this.client.post<Property>('/properties', property);
    return data;
  }

  async updateProperty(
    id: number,
    property: Partial<Property>,
  ): Promise<Property> {
    const { data } = await this.client.patch<Property>(
      `/properties/${id}`,
      property,
    );
    return data;
  }

  async deleteProperty(id: number): Promise<void> {
    await this.client.delete(`/properties/${id}`);
  }

  // Client endpoints
  async getClients(params?: any): Promise<PaginatedResponse<Client>> {
    const { data } = await this.client.get<PaginatedResponse<Client>>(
      '/clients',
      { params },
    );
    return data;
  }

  async getClient(id: number): Promise<Client> {
    const { data } = await this.client.get<Client>(`/clients/${id}`);
    return data;
  }

  async createClient(client: Partial<Client>): Promise<Client> {
    const { data } = await this.client.post<Client>('/clients', client);
    return data;
  }

  async updateClient(id: number, client: Partial<Client>): Promise<Client> {
    const { data } = await this.client.patch<Client>(`/clients/${id}`, client);
    return data;
  }

  async deleteClient(id: number): Promise<void> {
    await this.client.delete(`/clients/${id}`);
  }

  // Contact form
  async submitContactForm(formData: ContactFormData): Promise<void> {
    await this.client.post('/contact', formData);
  }

  // File upload
  async uploadPropertyImage(
    propertyId: number,
    file: File,
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await this.client.post<{ url: string }>(
      `/properties/${propertyId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data;
  }

  async deletePropertyImage(
    propertyId: number,
    imageId: number,
  ): Promise<void> {
    await this.client.delete(`/properties/${propertyId}/images/${imageId}`);
  }

  // Statistics (for admin)
  async getStatistics(): Promise<any> {
    const { data } = await this.client.get('/statistics');
    return data;
  }
}

// Export singleton instance
export const apiClient = new RealEstateApiClient();

export default apiClient;
