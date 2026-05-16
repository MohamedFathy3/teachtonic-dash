// src/types/hero.types.ts

export interface HeroImage {
  id: number;
  name: string;
  mimeType: string;
  size: number;
  authorId: number | null;
  previewUrl: string;
  fullUrl: string;
  createdAt: string;
}

export interface Hero {
  id: number;
  title: string;
  sub_title: string;
  description: string;
  title_ar: string;
  sub_title_ar: string;
  description_ar: string;
  teacher_id: number;
  teacher_name?: string;
  active: boolean;
  image: HeroImage;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface HeroFormData {
  title: string;
  sub_title: string;
  description: string;
  title_ar: string;
  sub_title_ar: string;
  description_ar: string;
  teacher_id: number;
  image?: number; // media ID
  active?: boolean;
}

export interface HeroFilters {
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

// Helper function لتحويل Hero من API إلى FormData
export function heroToFormData(hero: Hero): HeroFormData {
  return {
    title: hero.title,
    sub_title: hero.sub_title,
    description: hero.description,
    title_ar: hero.title_ar,
    sub_title_ar: hero.sub_title_ar,
    description_ar: hero.description_ar,
    teacher_id: hero.teacher_id,
    image: hero.image?.id,
    active: hero.active,
  };
}