/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/auth.service.ts

import api from '@/lib/api';
import { tokenService } from './token.service';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  created_at?: string;
  updated_at?: string;
}

class AuthService {
  async login(email: string, password: string): Promise<any> {
    try {
      const response = await api.post('/login', { email, password });
      
      if (response.data.token) {
        tokenService.setToken(response.data.token);
        const userData = response.data.admin || response.data.data;
        const userRole = response.data.role || userData?.role || 'admin';
        
        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userRole,
          created_at: userData.created_at,
          updated_at: userData.updated_at
        };
        
        tokenService.setUser(user);
        
        // Show success toast
        toast({
          title: "Welcome back! 🎉",
          description: `Successfully logged in as ${user.name}`,
          variant: "default",
        });
        
        return response.data;
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      // Show error toast
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast({
        title: "Login Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }
  
  logout(): void {
    const userName = this.getCurrentUser()?.name;
    tokenService.clearAll();
    
    // Show logout toast
    toast({
      title: "Logged Out 👋",
      description: userName ? `Goodbye ${userName}, see you soon!` : "You have been successfully logged out.",
      variant: "default",
    });
  }
  
  getCurrentUser(): User | null {
    const user = tokenService.getUser();
    return user;
  }
  
  isAuthenticated(): boolean {
    const token = tokenService.getToken();
    const user = this.getCurrentUser();
    const isAuth = !!(token && user);
    return isAuth;
  }
}

export const authService = new AuthService();