// src/types/admin.types.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: Admin;
}

export interface AdminStats {
  totalUsers: number;
  totalInstructors: number;
  totalCourses: number;
  totalPayments: number;
  totalRevenue: number;
  pendingReviews: number;
}

export interface AdminState {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}