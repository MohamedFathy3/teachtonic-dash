/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/course.service.ts

import { BaseService } from './base.service';
import type { Course, CourseFormData, PaginatedResponse } from '@/types/course.types';

import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
class CourseService extends BaseService<Course> {
  constructor() {
    super('course');
  }



  // ✅ الدالة الأساسية لجلب الكورسات مع فلتر متقدم
  async getAllCourses(
    filters?: Record<string, any>,
    perPage: number = 12,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<Course>> {
    try {
      const baseFilters: Record<string, any> = { ...(filters || {}) };

      // 🔥 إضافة البحث في title و title_ar
      if (search && search.trim()) {

        // الطريقة الثانية: إضافة فلتر title (لو الـ API بيدعم filters.title)
        baseFilters.title = search.trim();
        baseFilters.title_ar = search.trim();
        baseFilters.search = search.trim(); // لو الـ API بيدعم فلتر بحث عام (search) بيبحث في كل الحقول القابلة للبحث
        baseFilters.title_ar = search.trim();
      }
      if (filters.price !== undefined && filters.price !== null) {
        baseFilters.price = filters.price;
      }
      if (filters.type) {
        baseFilters.type = filters.type;
      }
      if (filters.start_date) {
        baseFilters.start_date = filters.start_date;
      }

      if (filters.end_date) {
        baseFilters.end_date = filters.end_date;
      }

      const requestBody: Record<string, any> = {
        filters: baseFilters,
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage,
        page,
        paginate: true,
        delete: showDeleted,
      };

      const response = await api.post(`/${this.endpoint}/index`, requestBody);

      return {
        data: response.data?.data || [],
        links: response.data?.links || { first: '', last: '', prev: null, next: null },
        meta: response.data?.meta || {
          current_page: page,
          from: 1,
          last_page: 1,
          links: [],
          path: '',
          per_page: perPage,
          to: 1,
          total: 0,
        },
        result: response.data?.result || 'Success',
        message: response.data?.message || 'Success',
        status: response.data?.status || 200,
      };
    } catch (error: any) {
      console.error('API Error in getAllCourses:', error);
      throw error;
    }
  }

  // ✅ جلب الكورسات المحذوفة
  async getDeletedCourses(
    perPage: number = 12,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Course>> {
    return this.getAllCourses({}, perPage, page, search, true);
  }

  // ✅ جلب كورسات معلم معين
  async getInstructorCourses(instructorId: number): Promise<PaginatedResponse<Course>> {
    return this.getAllCourses({ teacher_id: instructorId });
  }

  // ✅ جلب كورس واحد بالـ ID
  async getCourse(id: number): Promise<Course> {
    const response = await api.get(`/${this.endpoint}/${id}`);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    throw new Error('Invalid response structure');
  }

  // ✅ إنشاء كورس جديد
  async createCourse(data: CourseFormData): Promise<Course> {
    try {
      const payload = {
        teacher_id: data.teacher_id,
        stage_id: data.stage_id,
        subject_id: data.subject_id,
        semester_id: data.semester_id,
        title: data.title,
        title_ar: data.title_ar,
        description: data.description,
        description_ar: data.description_ar,
        about: data.about,
        about_ar: data.about_ar,
        hour_time_course: data.hour_time_course,
        type: data.type,
        count_student: data.count_student,
        price: data.price,
        start_date: data.start_date,
        end_date: data.end_date,
        ...(data.image && { image: data.image }),
      };

      const response = await api.post(`/${this.endpoint}`, payload);

      toast({
        title: "Success",
        description: "Course created successfully",
      });

      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create course",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ تحديث كورس
  async updateCourse(id: number, data: Partial<CourseFormData>): Promise<Course> {
    try {
      const payload: any = {};

      if (data.teacher_id !== undefined) payload.teacher_id = data.teacher_id;
      if (data.stage_id !== undefined) payload.stage_id = data.stage_id;
      if (data.subject_id !== undefined) payload.subject_id = data.subject_id;
      if (data.semester_id !== undefined) payload.semester_id = data.semester_id;
      if (data.title !== undefined) payload.title = data.title;
      if (data.title_ar !== undefined) payload.title_ar = data.title_ar;
      if (data.description !== undefined) payload.description = data.description;
      if (data.description_ar !== undefined) payload.description_ar = data.description_ar;
      if (data.about !== undefined) payload.about = data.about;
      if (data.about_ar !== undefined) payload.about_ar = data.about_ar;
      if (data.hour_time_course !== undefined) payload.hour_time_course = data.hour_time_course;
      if (data.type !== undefined) payload.type = data.type;
      if (data.count_student !== undefined) payload.count_student = data.count_student;
      if (data.price !== undefined) payload.price = data.price;
      if (data.start_date !== undefined) payload.start_date = data.start_date;
      if (data.end_date !== undefined) payload.end_date = data.end_date;
      if (data.image !== undefined) payload.image = data.image;

      const response = await api.patch(`/${this.endpoint}/${id}`, payload);

      toast({
        title: "Success",
        description: "Course updated successfully",
      });

      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update course",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ نقل كورس إلى سلة المحذوفات
  async deleteCourse(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({
        title: "Success",
        description: "Course moved to trash successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete course",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ حذف كورس نهائياً
  async forceDeleteCourse(id: number): Promise<void> {
    try {
      await this.forceDelete(id);
      toast({
        title: "Success",
        description: "Course permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete course",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ استعادة كورس من سلة المحذوفات
  async restoreCourse(id: number): Promise<Course> {
    try {
      const course = await this.restore(id);
      toast({
        title: "Success",
        description: "Course restored successfully",
      });
      return course;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore course",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ تبديل حالة التفعيل
  async toggleCourseActive(id: number): Promise<{ message: string }> {
    try {
      const result = await this.toggleActive(id);
      toast({
        title: "Success",
        description: result.message || "Course status changed successfully",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle course status",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ حذف جماعي
  async bulkDeleteCourses(ids: number[]): Promise<void> {
    try {
      await this.bulkDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} courses moved to trash successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete courses",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ حذف نهائي جماعي
  async bulkForceDeleteCourses(ids: number[]): Promise<void> {
    try {
      await this.bulkForceDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} courses permanently deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete courses",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ استعادة جماعية
  async bulkRestoreCourses(ids: number[]): Promise<void> {
    try {
      await this.bulkRestore(ids);
      toast({
        title: "Success",
        description: `${ids.length} courses restored successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore courses",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ جلب الكورسات النشطة فقط
  async getActiveCourses(): Promise<PaginatedResponse<Course>> {
    return this.getAllCourses({ active: 1 });
  }
}

export const courseService = new CourseService();