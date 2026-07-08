/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/stage.types.ts

export interface Stage {
  id: number;
  name: string;
  name_ar?: string;
  position: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  distinctiveMarkForTeacherName?: string | null;
  distinctiveMarkForTeacherId?: number | null;
  image?: string | null;
  // أي خصائص تانية
  [key: string]: any;
}

export interface StageFilters {
  search?: string;
  teacher_id?: number | string | null;
  active?: boolean;
  from_date?: string;
  to_date?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface StageFormData {
  name: string;
  name_ar: string;
  position: number;
  active: boolean;
  distinctive_mark_for_teacher_id?: number | null;
  image?: File | string | null;
}