import type { Property, PropertySearchParams, PaginatedResponse, AuthResponse, LoginCredentials, Client, ContactFormData, User } from '@repo/types';
export declare class RealEstateApiClient {
    private client;
    constructor(baseURL?: string);
    login(credentials: LoginCredentials): Promise<AuthResponse>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User>;
    getProperties(params?: PropertySearchParams): Promise<PaginatedResponse<Property>>;
    getProperty(id: number): Promise<Property>;
    getPropertyByCode(code: string): Promise<Property>;
    getFeaturedProperties(limit?: number): Promise<Property[]>;
    getSimilarProperties(propertyId: number, limit?: number): Promise<Property[]>;
    createProperty(property: Partial<Property>): Promise<Property>;
    updateProperty(id: number, property: Partial<Property>): Promise<Property>;
    deleteProperty(id: number): Promise<void>;
    getClients(params?: any): Promise<PaginatedResponse<Client>>;
    getClient(id: number): Promise<Client>;
    createClient(client: Partial<Client>): Promise<Client>;
    updateClient(id: number, client: Partial<Client>): Promise<Client>;
    deleteClient(id: number): Promise<void>;
    submitContactForm(formData: ContactFormData): Promise<void>;
    uploadPropertyImage(propertyId: number, file: File): Promise<{
        url: string;
    }>;
    deletePropertyImage(propertyId: number, imageId: number): Promise<void>;
    getStatistics(): Promise<any>;
}
export declare const apiClient: RealEstateApiClient;
export default apiClient;
