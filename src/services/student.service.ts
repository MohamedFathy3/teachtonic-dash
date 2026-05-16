// src/services/student.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './base.service';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export interface Student {
  id: number;
  name: string;
  phone: string;
  phone_parent: string;
  code_parent: string;
  type_of_attendance: 'online' | 'center' | null;
  gender: 'male' | 'female' | null;
  active: boolean;
  teacher_id: number;
  stage_id: number;
  stage?: {
    id: number;
    name: string;
    name_ar: string | null;
  };
  created_at: string;
}

export interface StudentLearningData {
  student: Student;
  semesters: any[];
  courses: any[];
  lessons: any[];
}

export interface StudentFilters {
  stage_id?: number;
  type_of_attendance?: string;
  active?: boolean;
  gender?: string;
}

class StudentService extends BaseService<Student> {
  constructor() {
    super('student');
  }

  // جلب طلاب المعلم الحالي
  async getTeacherStudents(
    teacherId: number,
    filters?: StudentFilters,
    perPage: number = 10,
    page: number = 1,
    search?: string
  ): Promise<{ data: Student[]; meta: any }> {
    try {
      const baseFilters: Record<string, any> = {
        teacher_id: teacherId,
        ...(filters || {}),
      };

      if (search && search.trim()) {
        baseFilters.name = search.trim();
      }

      const requestBody = {
        filters: baseFilters,
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage,
        page,
        paginate: true,
        delete: false,
      };

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
      console.error('API Error in getTeacherStudents:', error);
      throw error;
    }
  }

  // جلب تفاصيل طالب واحد مع محتواه التعليمي
  async getStudentLearning(studentId: number): Promise<StudentLearningData> {
    try {
      const response = await api.get(`/my-student/learn/${studentId}`);
      return response.data?.data;
    } catch (error: any) {
      console.error('API Error in getStudentLearning:', error);
      throw error;
    }
  }

  // تحديث حالة الطالب (تفعيل/تعطيل)
  async toggleStudentActive(studentId: number): Promise<void> {
    try {
      await api.patch(`/student/${studentId}/toggle-active`);
      toast({
        title: "Success",
        description: "Student status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update student status",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const studentService = new StudentService();