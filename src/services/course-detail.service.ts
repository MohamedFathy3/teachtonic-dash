// src/services/course-detail.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "@/hooks/use-toast";
import { BaseService } from './base.service';
import api from '@/lib/api';

export interface CourseDetail {
  id: number;
  course_id: number;
  titles: string[];
  titles_ar: string[];
  link_drive: string;
  description: string;
  description_ar: string;
  content_link: string;
  lession_date: string;
  lession_time: string;
  price: string;
  discount: string;
  must_pass_to_unlock?: boolean;
  attended?: boolean;
  createdAt: string;
  imageUrl?: string;
  image?: { id: number; fullUrl: string; } | null;
  pdfUrl?: string;
  pdf?: { id: number; fullUrl: string; } | null;
}

class CourseDetailService extends BaseService<CourseDetail> {
  constructor() {
    super('course-detail');
  }

  async getAll(params?: any): Promise<any> {
    const requestBody = {
      filters: params?.course_id ? { course_id: params.course_id } : {},
      orderBy: 'lession_date',
      orderByDirection: 'desc',
      perPage: params?.perPage || 10,
      page: params?.page || 1,
      paginate: true,
    };

    console.log('🔍 CourseDetail Request:', requestBody);

    const response = await api.post(`/${this.endpoint}/index`, requestBody);

    console.log('📦 CourseDetail Response:', response.data);

    return response.data;
  }

  // ✅ إضافة دالة جلب درس محدد بواسطة ID
  async getById(id: number): Promise<CourseDetail | null> {
    try {
      const response = await this.getAll({
        id: id,
        perPage: 1,
        page: 1
      });
      
      return response.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching lesson by ID:', error);
      throw error;
    }
  }

  async markStudentAttendance(courseDetailId: number, studentId: number): Promise<any> {
    try {
      const response = await api.post('/course-detail-attendance', {
        course_detail_id: courseDetailId,
        student_id: studentId
      });
      toast.success('تم تسجيل حضور الطالب بنجاح');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تسجيل الحضور');
      throw error;
    }
  }

  async create(data: any): Promise<CourseDetail> {
    const response = await api.post(`/${this.endpoint}`, data);
    return response.data.data;
  }

  async update(id: number, data: any): Promise<CourseDetail> {
    const response = await api.patch(`/${this.endpoint}/${id}`, data);
    return response.data;
  }

  async deleteDetail(id: number): Promise<void> {
    await api.delete(`/${this.endpoint}/delete`, {
      data: { items: [id] }
    });
  }

  async toggleMustPassToUnlock(id: number, value: boolean): Promise<CourseDetail> {
    const response = await api.put(`/${this.endpoint}/${id}/must_pass_to_unlock`, {
      must_pass_to_unlock: value
    });
    return response.data.data;
  }
}

export const courseDetailService = new CourseDetailService();