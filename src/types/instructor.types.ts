// src/types/instructor.types.ts
import { User } from './auth.types';

export interface Instructor extends User {
  bio?: string;
  avatar?: string;
  specialty?: string;
  experience?: number;
  rating?: number;
  totalStudents?: number;
  totalCourses?: number;
  totalEarnings?: number;
}

export interface InstructorLoginResponse {
  token: string;
  instructor: Instructor;
}

export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalEarnings: number;
  averageRating: number;
  pendingAssignments: number;
  monthlyRevenue: number[];
}