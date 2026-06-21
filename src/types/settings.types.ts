// src/types/settings.types.ts

export interface MetaTag {
  id: number;
  key: string; // مثل 'site_title', 'site_description', 'facebook_app_id'
  value: string;
  group: 'general' | 'social' | 'seo' | 'analytics';
  type: 'text' | 'textarea' | 'image' | 'url';
  label: string;
  label_ar: string;
  placeholder?: string;
  required?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SettingsGroup {
  id: string;
  label: string;
  label_ar: string;
  icon: string;
  description: string;
  description_ar: string;
  metaTags: MetaTag[];
}

export interface UpdateSettingsRequest {
  meta_tags: Record<string, string>; // key: value
}

export interface SettingsResponse {
  meta_tags: MetaTag[];
  groups: SettingsGroup[];
}