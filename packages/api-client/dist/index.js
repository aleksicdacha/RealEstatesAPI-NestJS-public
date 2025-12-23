"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.RealEstateApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
class RealEstateApiClient {
    constructor(baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') {
        this.client = axios_1.default.create({
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
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        });
    }
    // Auth endpoints
    async login(credentials) {
        const { data } = await this.client.post('/auth/login', credentials);
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', data.access_token);
        }
        return data;
    }
    async logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
        }
    }
    async getCurrentUser() {
        const { data } = await this.client.get('/auth/profile');
        return data;
    }
    // Property endpoints
    async getProperties(params) {
        const { data } = await this.client.get('/properties', { params });
        return data;
    }
    async getProperty(id) {
        const { data } = await this.client.get(`/properties/${id}`);
        return data;
    }
    async getPropertyByCode(code) {
        const { data } = await this.client.get(`/properties/code/${code}`);
        return data;
    }
    async getFeaturedProperties(limit = 6) {
        const response = await this.getProperties({
            limit,
            sortBy: 'createdAt',
            sortOrder: 'DESC'
        });
        return response.data;
    }
    async getSimilarProperties(propertyId, limit = 4) {
        const { data } = await this.client.get(`/properties/${propertyId}/similar`, {
            params: { limit }
        });
        return data;
    }
    async createProperty(property) {
        const { data } = await this.client.post('/properties', property);
        return data;
    }
    async updateProperty(id, property) {
        const { data } = await this.client.patch(`/properties/${id}`, property);
        return data;
    }
    async deleteProperty(id) {
        await this.client.delete(`/properties/${id}`);
    }
    // Client endpoints
    async getClients(params) {
        const { data } = await this.client.get('/clients', { params });
        return data;
    }
    async getClient(id) {
        const { data } = await this.client.get(`/clients/${id}`);
        return data;
    }
    async createClient(client) {
        const { data } = await this.client.post('/clients', client);
        return data;
    }
    async updateClient(id, client) {
        const { data } = await this.client.patch(`/clients/${id}`, client);
        return data;
    }
    async deleteClient(id) {
        await this.client.delete(`/clients/${id}`);
    }
    // Contact form
    async submitContactForm(formData) {
        await this.client.post('/contact', formData);
    }
    // File upload
    async uploadPropertyImage(propertyId, file) {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await this.client.post(`/properties/${propertyId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    }
    async deletePropertyImage(propertyId, imageId) {
        await this.client.delete(`/properties/${propertyId}/images/${imageId}`);
    }
    // Statistics (for admin)
    async getStatistics() {
        const { data } = await this.client.get('/statistics');
        return data;
    }
}
exports.RealEstateApiClient = RealEstateApiClient;
// Export singleton instance
exports.apiClient = new RealEstateApiClient();
exports.default = exports.apiClient;
