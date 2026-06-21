// src/services/seo-counts.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './base.service';
import api from '@/lib/api';
import { SeoCounts, AboutResponse } from '@/types/seo.types';
import { toast } from '@/hooks/use-toast';

class SeoCountsService extends BaseService<SeoCounts> {
  // ✅ تخزين البيانات الحالية مؤقتاً
  private currentAboutData: AboutResponse | null = null;

  constructor() {
    super('seo-counts');
  }

  // 🔹 جلب About مع الـ Counts من INDEX
  async getAboutWithCounts(params?: {
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
    
    console.log('📦 About Index Response:', response.data);
    
    // ✅ معالجة البيانات القادمة من index (array)
    let aboutData = response.data;
    
    // إذا كانت البيانات في data كـ array، نأخذ أول عنصر
    if (aboutData.data && Array.isArray(aboutData.data) && aboutData.data.length > 0) {
      aboutData = {
        ...aboutData,
        data: aboutData.data[0] // نأخذ أول عنصر
      };
    }
    
    // ✅ تخزين البيانات مؤقتاً
    this.currentAboutData = aboutData;
    
    return aboutData;
  }

  // ⭐⭐⭐ تحديث الـ Counts فقط
  async updateCounts(id: number, data: Partial<SeoCounts>): Promise<SeoCounts> {
    // تنظيف البيانات
    const cleanData: Record<string, any> = {};
    
    // نأخذ فقط الحقول المطلوبة
    const allowedFields = ['facebook_count', 'google_count', 'tiktok_count', 'you_tube_count'];
    
    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        const value = data[key as keyof SeoCounts];
        cleanData[key] = value !== undefined ? value : null;
      }
    });

    // إذا لم توجد بيانات للتحديث
    if (Object.keys(cleanData).length === 0) {
      toast.warning('لا توجد تغييرات للحفظ');
      throw new Error('No data to update');
    }

    console.log(`📤 PUT /about/${id} (Counts only)`, cleanData);

    // ✅ استخدام البيانات المخزنة مؤقتاً
    let currentData = this.currentAboutData;

    // إذا لم توجد بيانات مخزنة، نجلبها مرة واحدة
    if (!currentData) {
      try {
        const response = await this.getAboutWithCounts({ teacher_id: 5 });
        currentData = response;
      } catch (error) {
        console.error('Failed to fetch current data:', error);
        // إذا فشل الجلب، نستخدم البيانات الموجودة في التحديث فقط
        const response = await api.put(`/about/${id}`, cleanData);
        toast.success('تم حفظ إحصائيات التواصل الاجتماعي بنجاح ✅');
        return response.data;
      }
    }

    // ندمج البيانات الحالية مع التغييرات
    const updateData = {
      ...currentData.data,
      ...cleanData,
    };

    // ✅ إزالة الحقول غير المطلوبة قبل الإرسال
    const { seo_setting, image, ...restData } = updateData;

    const response = await api.put(`/about/${id}`, restData);
    
    // ✅ تحديث البيانات المخزنة مؤقتاً
    if (this.currentAboutData) {
      this.currentAboutData.data = {
        ...this.currentAboutData.data,
        ...cleanData,
      };
    }
    
    toast.success('تم حفظ إحصائيات التواصل الاجتماعي بنجاح ✅');
    return response.data;
  }

  // ⭐⭐⭐ تحديث Count فردي
  async updateSingleCount(
    id: number, 
    field: keyof SeoCounts, 
    value: string | null
  ): Promise<SeoCounts> {
    const updateData = {
      [field]: value
    };
    return this.updateCounts(id, updateData);
  }

  // 🔹 تحديث متعدد (Batch Update)
  async batchUpdateCounts(
    id: number, 
    updates: { field: keyof SeoCounts; value: string | null }[]
  ): Promise<SeoCounts> {
    const data: Partial<SeoCounts> = {};
    updates.forEach(({ field, value }) => {
      data[field] = value;
    });
    return this.updateCounts(id, data);
  }

  // 🔹 الحصول على Counts من البيانات المخزنة
  getCountsFromCache(): SeoCounts | null {
    if (!this.currentAboutData) return null;
    
    const { data } = this.currentAboutData;
    return {
      facebook_count: data.facebook_count,
      google_count: data.google_count,
      tiktok_count: data.tiktok_count,
      you_tube_count: data.you_tube_count,
    };
  }

  // 🔹 تحديث البيانات المخزنة مؤقتاً
  updateCache(data: Partial<SeoCounts>) {
    if (this.currentAboutData) {
      this.currentAboutData.data = {
        ...this.currentAboutData.data,
        ...data,
      };
    }
  }

  clearCache() {
    this.currentAboutData = null;
  }
}

export const seoCountsService = new SeoCountsService();