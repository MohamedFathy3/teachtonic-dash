// src/types/footer.types.ts

export interface Footer {
  id: number;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  facebook_link: string | null;
  youtube_link: string | null;
  instagram_link: string | null;
  tiktok_link: string | null;
  whatsapp_link: string | null;
  teacher_id: number;
  teacher_name?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface FooterFormData {
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  facebook_link?: string;
  youtube_link?: string;
  instagram_link?: string;
  tiktok_link?: string;
  whatsapp_link?: string;
  teacher_id: number;
  active?: boolean;
}

export interface FooterFilters {
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

// Helper function لتحويل Footer من API إلى FormData
export function footerToFormData(footer: Footer): FooterFormData {
  return {
    name: footer.name,
    name_ar: footer.name_ar,
    description: footer.description,
    description_ar: footer.description_ar,
    facebook_link: footer.facebook_link || '',
    youtube_link: footer.youtube_link || '',
    instagram_link: footer.instagram_link || '',
    tiktok_link: footer.tiktok_link || '',
    whatsapp_link: footer.whatsapp_link || '',
    teacher_id: footer.teacher_id,
    active: footer.active,
  };
}