/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { tokenService } from '@/services/token.service';
import { toast } from '@/hooks/use-toast';
import type { User } from '@/types/auth.types';

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ role: string }>;
  logout: () => void;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from storage on startup
  useEffect(() => {
    const loadUser = () => {
      
      const storedToken = tokenService.getToken();
      const storedUser = authService.getCurrentUser();
      
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        console.log('✅ User loaded from storage:', storedUser);
        console.log('✅ User role:', storedUser.role);
      } else {
        console.log('⚠️ No stored user found');
      }
      
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await authService.login(email, password);
      
      // Extract user data from response
      const userData = data.admin || data.data;
      const newToken = data.token;
      const userRole = data.role || userData?.role || 'admin';
      
      // Create user object with correct role
      const newUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userRole,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };
      
      
      setUser(newUser);
      setToken(newToken);
      
      return { role: userRole };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('🚪 Logging out...');
    authService.logout();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const isAuthenticated = authService.isAuthenticated();
  

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
  };
};