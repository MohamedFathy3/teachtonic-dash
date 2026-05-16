// src/types/feature.types.ts

export interface FeatureImage {
  id: number;
  name: string;
  mimeType: string;
  size: number;
  authorId: number | null;
  previewUrl: string;
  fullUrl: string;
  createdAt: string;
}

export interface Feature {
  id: number;
  name: string;
  description: string;
  name_ar: string;
  description_ar: string;
  teacher_id: number;
  teacher_name?: string;
  active: boolean;
  image: FeatureImage;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface FeatureFormData {
  name: string;
  description: string;
  name_ar: string;
  description_ar: string;
  teacher_id: number;
  image?: number; // media ID
  active?: boolean;
}

export interface FeatureFilters {
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

// Helper function لتحويل Feature من API إلى FormData
export function featureToFormData(feature: Feature): FeatureFormData {
  return {
    name: feature.name,
    description: feature.description,
    name_ar: feature.name_ar,
    description_ar: feature.description_ar,
    teacher_id: feature.teacher_id,
    image: feature.image?.id,
    active: feature.active,
  };
}