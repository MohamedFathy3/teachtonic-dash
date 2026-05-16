// src/types/school.types.ts
import { User } from './auth.types';

export interface School extends User {
  logo?: string;
  address?: string;
  phone?: string;
  website?: string;
  subscriptionPlan?: 'basic' | 'premium' | 'enterprise';
  subscriptionEnds?: string;
  totalStudents?: number;
  totalInstructors?: number;
  totalCourses?: number;
}

export interface SchoolLoginResponse {
  token: string;
  school: School;
}

export interface SchoolStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  activeSubscriptions: number;
  monthlyRevenue: number[];
}