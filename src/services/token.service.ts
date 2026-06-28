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
    } catch (error) {
    }
  }

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (!userStr) return null;
      const user = JSON.parse(userStr) as User;
      return user;
    } catch (error) {
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