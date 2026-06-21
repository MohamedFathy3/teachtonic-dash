/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/seo.types.ts

// ✅ Type للـ About مع الـ SEO و الـ Counts
export interface AboutData {
  id: number;
  name: string;
  description: string;
  name_ar: string;
  description_ar: string;
  facebook_meta: string;
  google_meta: string;
  tiktok_meta: string;
  you_tube_meta: string;
  facebook_count: string | null;
  google_count: string | null;
  tiktok_count: string | null;
  you_tube_count: string | null;
  seo_setting: SeoSettings;
  active: boolean;
  teacher_id: number;
  imageUrl: string;
  image: any;
  createdAt: string;
}

// ✅ Type للـ About Response (من INDEX - array)
export interface AboutIndexResponse {
  data: AboutData[];  // ✅ array
  result: string;
  message: string;
  status: number;
  links?: any;
  meta?: any;
}

// ✅ Type للـ About Response (من SHOW - object)
export interface AboutShowResponse {
  result: string;
  data: AboutData;  // ✅ object
  message: string;
  status: number;
}

// ✅ Type موحد للاستخدام في الصفحة
export type AboutResponse = AboutIndexResponse | AboutShowResponse;

// ✅ الـ Counts
export interface SeoCounts {
  facebook_count: string | null;
  google_count: string | null;
  tiktok_count: string | null;
  you_tube_count: string | null;
}

// ✅ الـ SEO Settings
export interface SeoSettings {
  id?: number;
  site_name?: string;
  site_title?: string;
  site_description?: string;
  site_url?: string;
  site_keywords?: string;
  default_language?: string;
  favicon?: string;
  favicon_svg?: string;
  favicon_32?: string;
  favicon_16?: string;
  favicon_apple?: string;
  favicon_android?: string;
  favicon_ms?: string;
  manifest_json?: string;
  browserconfig_xml?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_image_width?: string;
  og_image_height?: string;
  og_type?: string;
  og_url?: string;
  og_site_name?: string;
  geo_region?: string;
  geo_placename?: string;
  geo_position?: string;
  geo_icbm?: string;
  canonical_url?: string;
  language?: string;
  twitter_card?: string;
  facebook_app_id?: string;
  facebook_page?: string;
  twitter_username?: string;
  instagram_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  facebook_pixel_id?: string;
  clarity_id?: string;
}