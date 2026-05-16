// src/types/assistant-teacher.types.ts

export interface AssistantTeacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  teacher_id: number;
  teacher_name?: string; // من الـ API ممكن ترجع اسم المدرس
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AssistantTeacherFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  teacher_id: number;
}

export interface AssistantTeacherFilters {
  active?: boolean;
  search?: string;
  teacher_id?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}