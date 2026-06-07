/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/assignment.types.ts

export interface Assignment {
  id: number;
  title: string;
  description: string;
  type: 'assignment';
  course_detail_id: number | null;
  stage_id: number;
  teacher_id: number;
  questions: any[];
  answers: any[];
  total_marks: number;
  duration_minutes: number;
  active: number;
  imageUrl: string;
  image: any;
  created_at: string;
  updated_at: string;
  stage?: { id: number; name: string; name_ar?: string };
  teacher?: { id: number; name: string };
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  type: 'assignment';
  teacher_id: number;
  course_detail_id?: number | null;
  stage_id: number;
  image?: number;
  total_marks: number;
  duration_minutes: number;
  type_exam?: 'center' | 'online';
}

export interface GetAllAssignmentsParams {
  page?: number;
  perPage?: number;
  search?: string;
  teacher_id?: number;
  stage_id?: number;
}