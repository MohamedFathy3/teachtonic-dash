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
    // ✅ بناء الـ filters بشكل ديناميكي
    const filters: Record<string, any> = {};
    
    // ✅ إضافة course_id إذا وجد
    if (params?.course_id) {
      filters.course_id = params.course_id;
    }
    
    // ✅ إضافة id (معرف الدرس) إذا وجد
    if (params?.id) {
      filters.id = params.id;
    }

    const requestBody = {
      filters: filters,
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

  // ✅ دالة جلب درس محدد بواسطة ID
  async getById(id: number): Promise<CourseDetail | null> {
    try {
      // جلب كل الدروس وتصفيتها يدوياً
      const response = await this.getAll({
        perPage: 100, // جلب عدد كافي
        page: 1
      });
      
      // تصفية النتيجة يدوياً للبحث عن الـ id
      const lesson = response.data?.find((item: CourseDetail) => item.id === id) || null;
      
      return lesson;
    } catch (error) {
      console.error('Error fetching lesson by ID:', error);
      throw error;
    }
  }
 async getLessonById(id: number): Promise<CourseDetail | null> {
    try {
      // محاولة جلب الدرس مباشرة من API
      const response = await api.get(`/${this.endpoint}/${id}`);
      return response.data?.data || null;
    } catch (error: any) {
      // لو الـ API مش بيدعم GET /course-detail/{id}
      if (error.response?.status === 404) {
        console.warn('GET /course-detail/{id} not supported, falling back to filter');
        // الرجوع للطريقة الأولى
        return this.getById(id);
      }
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