import { apiClient, PaginatedResponse } from '@/lib/api-client';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  lastLogoutTime?: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UpdateUserDto {
  username?: string;
  role?: 'admin' | 'user';
}

export interface UserFilter extends Record<string, unknown> {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  searchField?: string;
  searchValue?: string;
  role?: string;
  isActive?: boolean;
}

export const userService = {
  async getUsers(filter?: UserFilter): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/users', filter);
    return response;
  },

  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response;
  },

  async createUser(data: CreateUserDto): Promise<User> {
    console.log('[UserService] Creating user with data:', data);
    const response = await apiClient.post<User>('/users', data);
    console.log('[UserService] User created successfully:', response);
    return response;
  },

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
