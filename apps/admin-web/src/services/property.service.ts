import { apiClient, PaginatedResponse } from '@/lib/api-client';

export interface Property {
  id: string;
  code: string;
  description?: string;
  propertyType: string;
  status: string;
  price: string | number;
  salePrice: string | number;
  area?: number;
  address: string;
  neighborhood?: string;
  lat?: number;
  lon?: number;
  comment?: string;
  elevator?: boolean;
  additionalEquipment?: string[];
  constructionYear?: number;
  bathrooms?: number;
  floor?: number;
  roomStructure?: string;
  heating?: string;
  contractNumber?: string;
  cadastralParcel?: string;
  cadastralMunicipality?: string;
  orientation?: string;
  youtubeUrl?: string;
  specialOffer?: number;
  createdAt: string;
  updatedAt: string;
  images?: PropertyImage[];
  client?: Client;
}

export interface PropertyImage {
  id: string;
  url: string;
  isFavorite: boolean;
  order: number;
}

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
  ownerJmbg?: string;
  ownerBirthplace?: string;
  ownerIdCardNumber?: string;
  ownerIdCardIssuePlace?: string;
  representative?: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    jmbg: string;
    birthplace?: string;
    idCardNumber?: string;
    idCardIssuePlace?: string;
  };
}

export interface CreatePropertyDto {
  code: string;
  description?: string;
  propertyType: string;
  status: string;
  price: number;
  salePrice: number;
  area?: number;
  address: string;
  neighborhood?: string;
  lat?: number;
  lon?: number;
  comment?: string;
  elevator?: boolean;
  additionalEquipment?: string[];
  constructionYear?: number;
  bathrooms?: number;
  floor?: number;
  roomStructure?: string;
  heating?: string;
  images?: string[];
}

export interface UpdatePropertyDto {
  code?: string;
  description?: string;
  propertyType?: string;
  status?: string;
  price?: number;
  salePrice?: number;
  area?: number;
  address?: string;
  neighborhood?: string;
  lat?: number;
  lon?: number;
  comment?: string;
  elevator?: boolean;
  additionalEquipment?: string[];
  constructionYear?: number;
  bathrooms?: number;
  floor?: number;
  roomStructure?: string;
  heating?: string;
  images?: Array<{
    id?: string;
    url?: string;
    isFavorite?: boolean;
    order?: number;
  }>;
}

export interface PropertyFilter extends Record<string, unknown> {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  searchField?: string;
  searchValue?: string;
  propertyType?: string;
  roomStructure?: string;
  status?: string;
  clientId?: string;
  minPrice?: number;
  maxPrice?: number;
  includeClient?: boolean;
  includeImages?: boolean;
}

export const propertyService = {
  async getProperties(filter?: PropertyFilter): Promise<PaginatedResponse<Property>> {
    const response = await apiClient.get<PaginatedResponse<Property>>('/properties', filter);
    return response;
  },

  async getProperty(guid: string): Promise<Property> {
    const response = await apiClient.get<Property>(`/properties/${guid}`);
    return response;
  },

  async createProperty(data: CreatePropertyDto): Promise<Property> {
    const response = await apiClient.post<Property>('/properties', data);
    return response;
  },

  async updateProperty(guid: string, data: UpdatePropertyDto): Promise<Property> {
    const response = await apiClient.put<Property>(`/properties/${guid}`, data);
    return response;
  },

  async deleteProperty(guid: string): Promise<void> {
    await apiClient.delete(`/properties/${guid}`);
  },

  async uploadPropertyImages(guid: string, files: File[]): Promise<Property> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await apiClient.upload<Property>(`/properties/${guid}/images`, formData);
    return response;
  }
};
