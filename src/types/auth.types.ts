// src/types/auth.types.ts

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  message: string;
  role: 'admin' | 'instructor' | 'student';
  token: string;
  admin?: User;      // قد تأتي باسم admin
  data?: User;       // أو قد تأتي باسم data
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}