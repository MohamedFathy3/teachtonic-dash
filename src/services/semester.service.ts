// src/services/semester.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './base.service';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export interface Semester {
  id: number;
  name: string;
  name_ar: string;
  active: boolean;
  price: string;
  discount: string;
  teacher_id: number;
  courses: any[];
  createdAt: string;
  subject_id: number | null;
  image: number | null;
  imageUrl?: string | null;
}

export interface SemesterFormData {
  name: string;
  name_ar: string;
  price: number;
  discount: number;
  teacher_id: number;
  image: number | null;
  subject_id: number | null;
}

export interface SemesterFilters {
  subject_id?: number | null;
  teacher_id?: number | null;
  active?: string;
  price?: number;
  discount?: number;
  from_date?: string;
  to_date?: string;
  has_image?: boolean | '';
}

class SemesterService extends BaseService<Semester> {
  constructor() {
    super('semesters');
  }

  private getTeacherId(): number | undefined {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.id;
  }

  // ✅ جلب الأتربة مع فلتر ودعم البحث حسب اللغة
  async getAllSemesters(
    filters: Record<string, any> = {},
    perPage: number = 10,
    page: number = 1,
    search?: string,
    teacherId?: number,
    lang?: string // 🔥 أضف lang لتحديد اللغة
  ) {
    try {
      const baseFilters: Record<string, any> = { ...filters };
      const finalTeacherId = teacherId ?? this.getTeacherId();

      if (finalTeacherId) {
        baseFilters.teacher_id = finalTeacherId;
      }

      // 🔥 البحث الذكي حسب اللغة
      if (search?.trim()) {
        if (lang === 'ar') {
          // في الوضع العربي - بحث في name_ar
          baseFilters.name_ar = search.trim();
        } else {
          // في الوضع الإنجليزي - بحث في name
          baseFilters.name = search.trim();
        }
      }

      // تنظيف القيم الفاضية
      Object.keys(baseFilters).forEach((key) => {
        const value = baseFilters[key];
        if (value === '' || value === null || value === undefined) {
          delete baseFilters[key];
        }
      });

      // معالجة الفلاتر الإضافية
      if (baseFilters.active === '') delete baseFilters.active;
      if (baseFilters.price === null || baseFilters.price === undefined || baseFilters.price === '') delete baseFilters.price;
      if (baseFilters.discount === null || baseFilters.discount === undefined || baseFilters.discount === '') delete baseFilters.discount;
      if (baseFilters.subject_id === null || baseFilters.subject_id === undefined || baseFilters.subject_id === '') delete baseFilters.subject_id;

      const response = await api.post(`/${this.endpoint}/index`, {
        filters: baseFilters,
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage,
        page,
        paginate: true,
        delete: false,
      });

      return {
        data: response.data?.data || [],
        meta: response.data?.meta || {
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: perPage,
        },
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // باقي الدوال كما هي...
  async getSemester(id: number): Promise<Semester> {
    const response = await api.get(`/${this.endpoint}/${id}`);
    return response.data?.data;
  }

  async createSemester(data: SemesterFormData): Promise<Semester> {
    try {
      const response = await api.post(`/${this.endpoint}`, data);
      toast({ title: "Success", description: "Semester created successfully" });
      return response.data?.data;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to create semester", variant: "destructive" });
      throw error;
    }
  }

  async updateSemester(id: number, data: Partial<SemesterFormData>): Promise<Semester> {
    try {
      const response = await api.patch(`/${this.endpoint}/${id}`, data);
      toast({ title: "Success", description: "Semester updated successfully" });
      return response.data?.data;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to update semester", variant: "destructive" });
      throw error;
    }
  }

  async deleteSemester(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({ title: "Success", description: "Semester deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to delete semester", variant: "destructive" });
      throw error;
    }
  }

  async bulkDeleteSemesters(ids: number[]): Promise<void> {
    try {
      await api.delete(`/${this.endpoint}/delete`, { data: { items: ids } });
      toast({ title: "Success", description: `${ids.length} semesters deleted successfully` });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to delete semesters", variant: "destructive" });
      throw error;
    }
  }

  async toggleActive(id: number): Promise<{ message: string }> {
    try {
      const result = await this.toggleActive(id);
      toast({ title: "Success", description: result.message || "Status changed" });
      return result;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to toggle status", variant: "destructive" });
      throw error;
    }
  }
}

export const semesterService = new SemesterService();