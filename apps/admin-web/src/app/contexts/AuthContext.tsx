"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleTokenRefresh = (expiresIn: number = 3600) => {
    // Refresh token 5 minutes before it expires (or at 75% of lifetime)
    const refreshTime = Math.max((expiresIn * 0.75) * 1000, (expiresIn - 300) * 1000);
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(async () => {
      console.log('[Auth] Auto-refreshing token...');
      const success = await refreshTokenFn();
      if (!success) {
        console.error('[Auth] Auto-refresh failed, logging out');
        await logout();
      }
    }, refreshTime);
  };

  const refreshTokenFn = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.error('[Auth] No refresh token available');
        return false;
      }

      const refreshUrl = `${API_BASE_URL}/v1/auth/refresh-token`;

      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('[Auth] Token refresh failed:', response.statusText);
        return false;
      }

      const data = await response.json();
      
      // Update tokens
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      console.log('[Auth] Token refreshed successfully');
      scheduleTokenRefresh(data.expiresIn || 3600);
      return true;
    } catch (error) {
      console.error('[Auth] Token refresh error:', error);
      return false;
    }
  };

  // Helper to decode JWT and check expiry
  // For refresh tokens, we check strict expiry (no buffer)
  // For access tokens, we allow 10% buffer for proactive refresh
  const isTokenExpired = (token: string, useBuffer: boolean = false): boolean => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);

      if (!decoded.exp) return true;

      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      // For refresh tokens, check strict expiry
      // For access tokens, add a small buffer for proactive refresh
      if (!useBuffer) {
        return currentTime >= expirationTime;
      }

      // Calculate buffer as 10% of token lifetime (min 5s, max 60s)
      const issuedTime = decoded.iat ? decoded.iat * 1000 : currentTime;
      const tokenLifetime = expirationTime - issuedTime;
      const bufferTime = Math.min(Math.max(tokenLifetime * 0.1, 5000), 60000);

      return currentTime >= (expirationTime - bufferTime);
    } catch (error) {
      console.error('[Auth] Failed to decode token:', error);
      return true; // Treat decode errors as expired
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userData = localStorage.getItem('user');
      
      if (accessToken && refreshToken && userData) {
        try {
          // Check if refresh token is expired (strict check, no buffer)
          // We only logout when the refresh token is TRULY expired
          if (isTokenExpired(refreshToken, false)) {
            console.warn('[Auth] Refresh token expired after long inactivity - logging out');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
            setLoading(false);
            return;
          }

          setUser(JSON.parse(userData));
          // Schedule automatic token refresh
          scheduleTokenRefresh();
        } catch (error) {
          console.error('[Auth] Failed to parse user data:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const loginUrl = `${API_BASE_URL}/v1/auth/login`;

      console.log('[Auth] Attempting login to:', loginUrl);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens and user data
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      
      // Schedule automatic token refresh
      scheduleTokenRefresh(data.expiresIn || 3600);
      
      router.push('/');
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      const token = localStorage.getItem('accessToken');
      
      if (token) {
        await fetch(`${API_BASE_URL}/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshToken: refreshTokenFn,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
