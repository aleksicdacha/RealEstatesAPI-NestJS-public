import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper to decode JWT without verification (client-side check only)
function decodeJWT(token: string): { exp?: number; iat?: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[API Client] Failed to decode JWT:', error);
    return null;
  }
}

// Check if token is expired (strict check - no buffer)
// Use this for refresh tokens to avoid premature logout
function isTokenStrictlyExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

// Check if token is expired or will expire soon
// Uses 10% of token lifetime as buffer (min 5s, max 60s)
// Use this for access tokens to enable proactive refresh
function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp || !decoded.iat) {
    return true; // If we can't decode, treat as expired
  }

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const issuedTime = decoded.iat * 1000;
  const currentTime = Date.now();

  // Calculate buffer as 10% of token lifetime (min 5s, max 60s)
  const tokenLifetime = expirationTime - issuedTime;
  const bufferTime = Math.min(Math.max(tokenLifetime * 0.1, 5000), 60000);

  return currentTime >= (expirationTime - bufferTime);
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/v1`,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return null;
      }

      const response = await axios.post('http://localhost:3000/v1/auth/refresh-token', {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      return accessToken;
    } catch (error) {
      console.error('[API Client] Token refresh failed:', error);
      return null;
    }
  }

  private setupInterceptors() {
    // Request interceptor - check token validity before making request
    this.client.interceptors.request.use(
      async (config) => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        // If no tokens at all, let the request go through (might be public endpoint)
        if (!accessToken && !refreshToken) {
          console.log('[API Client] No tokens found');
          return config;
        }

        // Check if refresh token itself is expired (strict check, no buffer)
        // Only logout when refresh token is TRULY expired
        if (refreshToken && isTokenStrictlyExpired(refreshToken)) {
          console.warn('[API Client] Refresh token expired - logging out immediately');

          // Clear storage and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          if (typeof window !== 'undefined') {
            window.location.href = '/sr/login';
          }

          // Reject the request
          return Promise.reject(new Error('Session expired. Please login again.'));
        }

        // If access token is expired but refresh token is valid, try to refresh proactively
        // Use buffered check for access token to refresh before it actually expires
        if (accessToken && isTokenExpired(accessToken) && refreshToken && !isTokenStrictlyExpired(refreshToken)) {
          console.log('[API Client] Access token expired, attempting proactive refresh');

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              config.headers.Authorization = `Bearer ${newToken}`;
              console.log('[API Client] Proactive refresh successful');
              return config;
            } else {
              // Refresh failed (likely refresh token also expired)
              console.error('[API Client] Proactive refresh failed - logging out');

              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');

              if (typeof window !== 'undefined') {
                window.location.href = '/sr/login';
              }

              return Promise.reject(new Error('Session expired. Please login again.'));
            }
          } catch (error) {
            console.error('[API Client] Proactive refresh error - logging out:', error);

            // Clear storage and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            if (typeof window !== 'undefined') {
              window.location.href = '/sr/login';
            }

            return Promise.reject(new Error('Session expired. Please login again.'));
          }
        }

        // Use existing access token
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          console.log('[API Client] Using existing access token');
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with automatic token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue this request while refresh is in progress
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(token => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();

            if (newToken) {
              console.log('[API Client] Token refreshed, retrying request');
              this.processQueue(null, newToken);
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              
              return this.client(originalRequest);
            } else {
              console.error('[API Client] Token refresh failed, logging out');
              this.processQueue(new Error('Token refresh failed'), null);
              
              // Clear storage and redirect to login
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              
              if (typeof window !== 'undefined') {
                window.location.href = '/sr/login';
              }
              
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error('[API Client] Error during token refresh:', refreshError);
            this.processQueue(refreshError as Error, null);
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }

  async upload<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
