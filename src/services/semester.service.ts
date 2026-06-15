/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/semester.service.ts

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
  offer_id: number;
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
  offer_id: number | null;
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
  offer_id?: number | null;
}

export interface Offer {
  id: number;
  title: string;
  title_ar?: string;
  description: string;
  offer_discount: string;
  type: 'offer' | 'banner';
  active: boolean;
  image: any;
}

class SemesterService extends BaseService<Semester> {
  constructor() {
    super('semesters');
  }

  private getTeacherId(): number | undefined {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.id;
  }

  async getAllSemesters(
    filters: Record<string, any> = {},
    perPage: number = 10,
    page: number = 1,
    search?: string,
    teacherId?: number,
    lang?: string
  ) {
    try {
      const baseFilters: Record<string, any> = { ...filters };
      const finalTeacherId = teacherId ?? this.getTeacherId();

      if (finalTeacherId) {
        baseFilters.teacher_id = finalTeacherId;
      }

      if (search?.trim()) {
        if (lang === 'ar') {
          baseFilters.name_ar = search.trim();
        } else {
          baseFilters.name = search.trim();
        }
      }

      Object.keys(baseFilters).forEach((key) => {
        const value = baseFilters[key];
        if (value === '' || value === null || value === undefined) {
          delete baseFilters[key];
        }
      });

      if (baseFilters.active === '') delete baseFilters.active;
      if (baseFilters.price === null || baseFilters.price === undefined || baseFilters.price === '') delete baseFilters.price;
      if (baseFilters.discount === null || baseFilters.discount === undefined || baseFilters.discount === '') delete baseFilters.discount;
      if (baseFilters.subject_id === null || baseFilters.subject_id === undefined || baseFilters.subject_id === '') delete baseFilters.subject_id;
      if (baseFilters.offer_id === null || baseFilters.offer_id === undefined || baseFilters.offer_id === '') delete baseFilters.offer_id;

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

  async toggleActiveStatus(id: number): Promise<{ message: string }> {
    try {
      const response = await api.put(`/${this.endpoint}/${id}/active`);
      toast({ title: "Success", description: response.data?.message || "Status changed successfully" });
      return response.data;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to toggle status", variant: "destructive" });
      throw error;
    }
  }

  async getOffersForSelect(teacherId?: number): Promise<Offer[]> {
    try {
      const finalTeacherId = teacherId ?? this.getTeacherId();
      
      const response = await api.post('/offer/index', {
        filters: {
          teacher_id: finalTeacherId,
          type: 'offer',
          active: true,
        },
        orderByDirection: 'desc',
        perPage: 100,
        paginate: false,
      });
      
      console.log('🎁 Offers for select:', response.data?.data);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
  }
}

export const semesterService = new SemesterService();