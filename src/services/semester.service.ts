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
  private getTeacherId(): number | undefined {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.id;
  }
  // ✅ جلب الأتربة مع فلتر (مع إضافة teacher_id افتراضي)
  async getAllSemesters(
    filters: Record<string, any> = {},
    perPage: number = 10,
    page: number = 1,
    search?: string,
    teacherId?: number
  ) {
    try {
      const baseFilters: Record<string, any> = { ...filters };

      // 🔥 أهم تعديل هنا
      const finalTeacherId = teacherId ?? this.getTeacherId();

      if (finalTeacherId) {
        baseFilters.teacher_id = finalTeacherId;
      }

      if (search?.trim()) {
        baseFilters.name = search.trim();
      }

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
        meta: response.data?.meta || {},
      };
    } catch (error) {
      console.error('API Error:', error);
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