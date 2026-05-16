// src/types/stage.types.ts

export interface Stage {
  id: number;
  name: string;
  name_ar: string | null;
  position: number;
  active: boolean;
  image: string | null;
  createdAt: string;
}

export interface StageFilters {
  search?: string;
  active?: boolean;
  position?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  result: string;
  message: string;
  status: number;
}

export interface StageFormData {
  name: string;
  name_ar: string;
  position: number;
  active: boolean;
  image?: File | null;
}

export interface ApiResponse<T> {
  result: string;
  data: T;
  message: string;
  status: number;
}