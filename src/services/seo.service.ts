// src/services/seo.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './base.service';
import api from '@/lib/api';
import { SeoSettings, AboutResponse } from '@/types/seo.types';
import { toast } from '@/hooks/use-toast';

class SeoService extends BaseService<SeoSettings> {
  constructor() {
    super('seo');
  }

  // 🔹 جلب About (عشان ناخد الـ id)
  async getAboutWithSeo(params?: {
    teacher_id?: number;
  }): Promise<AboutResponse> {
    const filters: Record<string, any> = {};

    if (params?.teacher_id) {
      filters.teacher_id = params.teacher_id;
    }

    const requestBody = {
      filters,
      orderBy: 'id',
      orderByDirection: 'asc',
      perPage: 1,
      paginate: false,
      delete: false,
    };

    const response = await api.post(`/about/index`, requestBody);
    return response.data;
  }

  // ⭐⭐⭐ جلب SEO settings بواسطة ID
  async getSeoById(id: number): Promise<SeoSettings> {
    const response = await api.get(`/seo/show/${id}`);
    console.log('📦 SEO Show Response:', response.data);
    return response.data.data;
  }

  // ⭐⭐⭐ تحديث SEO settings (PUT)
  async updateSeo(id: number, data: Partial<SeoSettings>): Promise<SeoSettings> {
    // نزيل الـ id من البيانات
    const { id: _, ...cleanData } = data as any;
    
    // ✅ نتأكد إن البيانات مش فيها null
    const finalData: Record<string, any> = {};
    Object.keys(cleanData).forEach(key => {
      const value = cleanData[key];
      finalData[key] = value !== null && value !== undefined ? value : '';
    });

    console.log(`📤 PUT /seo/update/${id}`, finalData);

    const response = await api.post(`/seo/update/${id}`, finalData);
    toast.success('تم حفظ إعدادات SEO بنجاح ✅');
    return response.data;
  }

  // 🔹 تحديث About
  async updateAbout(id: number, data: Partial<any>): Promise<any> {
    const response = await api.put(`/about/update/${id}`, data);
    toast.success('تم تحديث About بنجاح');
    return response.data;
  }

  // 🔹 تحديث جزئي (PATCH)
  async update(id: number, data: Partial<SeoSettings>): Promise<SeoSettings> {
    const response = await api.patch(`/seo/${id}`, data);
    toast.success('تم تحديث الإعدادات بنجاح');
    return response.data;
  }
}

export const seoService = new SeoService();