// src/types/teacher.types.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// 🔥 الـ Stage اللي جاي من الـ API (كائن كامل)
export interface TeacherStageFromAPI {
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
  createdAt: string;
}

// 🔥 الـ Subject اللي جاي من الـ API (كائن كامل)
export interface TeacherSubjectFromAPI {
  id: number;
  name: string;
  name_ar: string | null;
  position: number;
  active: boolean;
  stage: any | null;
  createdAt: string;
}

// 🔥 الـ Website Object
export interface TeacherWebsite {
  home: string | null;
  features: any[];
  about: string | null;
  stages: TeacherStageFromAPI[];
  subjects: TeacherSubjectFromAPI[];
  footer: string | null;
}

// 🔥 الـ Teacher اللي جاي من الـ API (للاستقبال)
export interface Teacher {
  id: number;
  name: string;
  email: string;
  sub_domain: string;
  phone: string;
  password?: string;
  active: boolean;
  website: TeacherWebsite;  // ⚠️ ملاحظة: stages و subjects جوا website
  image?: number;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

// 🔥 الـ Stage اللي هنبعته للـ API (للكرييت والتحديث)
export interface TeacherStagePayload {
  stage_id: number;
  image: number;  // media ID
}

// 🔥 الـ Subject اللي هنبعته للـ API
export interface TeacherSubjectPayload {
  subject_id: number;
}

// 🔥 الـ Form Data (للإرسال)
export interface TeacherFormData {
  name: string;
  email: string;
  sub_domain: string;
  phone: string;
  password: string;
  stage: TeacherStagePayload[];   // للـ API
  subject: TeacherSubjectPayload[]; // للـ API
  image?: number;
}

// للـ Filters
export interface TeacherFilters {
  active?: boolean;
  search?: string;
  stage_id?: number;
  subject_id?: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

// 🔥 Helper function لتحويل Teacher من API إلى FormData
export function teacherToFormData(teacher: Teacher): TeacherFormData {
  return {
    name: teacher.name,
    email: teacher.email,
    sub_domain: teacher.sub_domain,
    phone: teacher.phone,
    password: '', // الباسورد بيتعبى لوحده لو فيه تغيير
    stage: teacher.website.stages.map(stage => ({ 
      stage_id: stage.id, 
      image: stage.image?.id || 0 
    })),
    subject: teacher.website.subjects.map(sub => ({ subject_id: sub.id })),
    image: teacher.image,
  };
}