// src/services/token.service.ts

import Cookies from 'js-cookie';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  created_at?: string;
  updated_at?: string;
}

class TokenService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  setToken(token: string): void {
    Cookies.set(this.TOKEN_KEY, token, { 
      expires: 7,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });
    console.log('✅ Token saved');
  }

  getToken(): string | null {
    return Cookies.get(this.TOKEN_KEY) || null;
  }

  removeToken(): void {
    Cookies.remove(this.TOKEN_KEY, { path: '/' });
  }

  setUser(user: User): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      console.log('✅ User saved with role:', user.role);
    } catch (error) {
      console.error('❌ Error saving user:', error);
    }
  }

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (!userStr) return null;
      const user = JSON.parse(userStr) as User;
      console.log('📖 User loaded with role:', user.role);
      return user;
    } catch (error) {
      console.error('❌ Error parsing user:', error);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  clearAll(): void {
    this.removeToken();
    this.removeUser();
  }
}

export const tokenService = new TokenService();