
// src/types/about.types.ts

export interface AboutImage {
  id: number;
  name: string;
  mimeType: string;
  size: number;
  authorId: number | null;
  previewUrl: string;
  fullUrl: string;
  createdAt: string;
}

export interface About {
  id: number;
  name: string;
  description: string;
  name_ar: string;
  description_ar: string;
  facebook_meta: string;
  google_meta: string;
  tiktok_meta: string;
  you_tube_meta: string;
  teacher_id: number;
  teacher_name?: string;
  active: boolean;
  image: AboutImage;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface AboutFormData {
  name: string;
  description: string;
  name_ar: string;
  description_ar: string;
  facebook_meta: string;
  google_meta: string;
  tiktok_meta: string;
  you_tube_meta: string;
  teacher_id: number;
  image?: number;
  active?: boolean;
}

export interface AboutFilters {
  active?: boolean;
  search?: string;
  teacher_id?: number;
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

export function aboutToFormData(about: About): AboutFormData {
  return {
    name: about.name,
    description: about.description,
    name_ar: about.name_ar,
    description_ar: about.description_ar,
    facebook_meta: about.facebook_meta ?? '',
    google_meta: about.google_meta ?? '',
    tiktok_meta: about.tiktok_meta ?? '',
    you_tube_meta: about.you_tube_meta ?? '',
    teacher_id: about.teacher_id,
    image: about.image?.id,
    active: about.active,
  };
} 