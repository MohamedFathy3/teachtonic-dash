// src/types/website.types.ts

export interface BaseWebsiteSection {
  id: number;
  active: boolean;
  teacher_id: number;
  createdAt: string;
  updatedAt?: string;
}

export interface HeroSection extends BaseWebsiteSection {
  title: string;
  title_ar?: string;
  sub_title: string;
  sub_title_ar?: string;
  description: string;
  description_ar?: string;
  image?: number;
  imageUrl?: string;
}

export interface AboutSection extends BaseWebsiteSection {
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  image?: number;
  imageUrl?: string;
}

export interface FeatureSection extends BaseWebsiteSection {
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  image?: number;
  imageUrl?: string;
}

export interface FooterSection extends BaseWebsiteSection {
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  facebook_link?: string;
  youtube_link?: string;
  instagram_link?: string;
  tiktok_link?: string;
  whatsapp_link?: string;
}

export interface Stage {
  id: number;
  name: string;
  name_ar: string | null;
  position: number;
  active: boolean;
  image: {
    id: number;
    fullUrl: string;
  } | null;
  createdAt: string;
}

export interface Subject {
  id: number;
  name: string;
  name_ar: string | null;
  position: number;
  active: boolean;
  createdAt: string;
}

export interface TeacherWebsite {
  home: HeroSection | null;
  about: AboutSection | null;
  features: FeatureSection[];
  stages: Stage[];
  subjects: Subject[];
  footer: FooterSection | null;
}

export interface Teacher {
  id: number;
  name: string;
  name_ar?: string;
  email: string;
  sub_domain: string;
  phone: string;
  active: boolean;
  website: TeacherWebsite;
  createdAt: string;
}