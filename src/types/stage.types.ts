/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/stage.types.ts

export interface StageFormData {
  name: string;
  name_ar: string;
  position: number;
  active: boolean;
  image: File | null;
  distinctive_mark_for_teacher_id?: number | null;
}

export interface Stage {
  id: number;
  name: string;
  name_ar: string | null;
  position: number;
  active: boolean;
  image: {
    id: number;
    name: string;
    mimeType: string;
    size: number;
    previewUrl: string;
    fullUrl: string;
  } | null;
  distinctiveMarkForTeacherName?: string | null; // ✅ من API (camelCase)
  distinctive_mark_for_teacher_id?: number | null; // ✅ للإرسال (snake_case)
  subjects: any[];
  createdAt: string;
}

export interface StageFilters {
  active?: boolean;
  search?: string;
}