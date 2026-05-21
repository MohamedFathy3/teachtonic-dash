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
}

export interface SemesterFormData {
  name: string;
  name_ar: string;
  price: number;
  discount: number;
  teacher_id: number;
  subject_id: number | null;
}

class SemesterService extends BaseService<Semester> {
  constructor() {
    super('semesters');
  }

  // ✅ جلب الأتربة مع فلتر (مع إضافة teacher_id افتراضي)
  async getAllSemesters(
    filters?: Record<string, any>,
    perPage: number = 10,
    page: number = 1,
    search?: string,
    teacherId?: number  // 🔥 إضافة teacherId
  ): Promise<{ data: Semester[]; meta: any }> {
    try {
      // 🔥 بناء الفلاتر الأساسية
      const baseFilters: Record<string, any> = { ...(filters || {}) };
      
      // ✅ إضافة teacher_id إذا وجد (مع إمكانية تمريره من الخارج)
      if (teacherId) {
        baseFilters.teacher_id = teacherId;
      }
      
      // ✅ البحث في الاسم
      if (search && search.trim()) {
        baseFilters.name = search.trim();
      }

      const requestBody: any = {
        filters: baseFilters,
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage,
        page,
        paginate: true,
        delete: false,
      };

      console.log('🔍 Semesters Request:', requestBody);

      const response = await api.post(`/${this.endpoint}/index`, requestBody);
      
      return {
        data: response.data?.data || [],
        meta: response.data?.meta || {
          current_page: page,
          last_page: 1,
          per_page: perPage,
          total: 0,
        },
      };
    } catch (error: any) {
      console.error('API Error in getAllSemesters:', error);
      throw error;
    }
  }

  // ✅ جلب ترم واحد
  async getSemester(id: number): Promise<Semester> {
    const response = await api.get(`/${this.endpoint}/${id}`);
    return response.data?.data;
  }

  // ✅ إنشاء ترم جديد
  async createSemester(data: SemesterFormData): Promise<Semester> {
    try {
      const response = await api.post(`/${this.endpoint}`, data);
      toast({
        title: "Success",
        description: "Semester created successfully",
      });
      return response.data?.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create semester",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ تحديث ترم
  async updateSemester(id: number, data: Partial<SemesterFormData>): Promise<Semester> {
    try {
      const response = await api.patch(`/${this.endpoint}/${id}`, data);
      toast({
        title: "Success",
        description: "Semester updated successfully",
      });
      return response.data?.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update semester",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ حذف ترم (منفرد)
  async deleteSemester(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({
        title: "Success",
        description: "Semester deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete semester",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ حذف جماعي
  async bulkDeleteSemesters(ids: number[]): Promise<void> {
    try {
      await api.delete(`/${this.endpoint}/delete`, {
        data: { items: ids }
      });
      toast({
        title: "Success",
        description: `${ids.length} semesters deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete semesters",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const semesterService = new SemesterService();