// src/types/subject.types.ts

export interface Subject {
  id: number;
  name: string;
  name_ar: string | null;
  stage_id?: number; // اختياري لأن الـ API ممكن ميرجعوش
  stage_name?: string;
  position: number;
  active: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface SubjectFilters {
  stage_id?: number;
  search?: string;
  active?: boolean;
  position?: number;
}

export interface SubjectFormData {
  name: string;
  name_ar: string;
  stage_id: number;
  position: number;
  active: boolean;
  image?: File | null;
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

// Helper function لتحويل Subject من API إلى FormData
export function subjectToFormData(subject: Subject): SubjectFormData {
  return {
    name: subject.name,
    name_ar: subject.name_ar || '',
    stage_id: subject.stage_id || 0,
    position: subject.position,
    active: subject.active,
    image: null,
  };
}