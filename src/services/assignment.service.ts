// src/services/assignment.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './base.service';
import type { Exam, CreateExamDTO, UpdateExamDTO, PaginatedResponse } from '@/types/exam.types';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

class AssignmentService extends BaseService<Exam> {
  constructor() {
    super('exam');
  }

  async getAllAssignments(
    filters?: Record<string, any>,
    perPage: number = 12,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<Exam>> {
    try {
      const baseFilters: Record<string, any> = { 
        ...(filters || {}),
        type: 'assignment'
      };      
      if (search && search.trim()) {
        baseFilters.title = search.trim();
      }
      
      const requestBody: Record<string, any> = {
        filters: baseFilters,
        orderBy: 'created_at',
        orderByDirection: 'desc',
        perPage,
        page,
        paginate: true,
        delete: showDeleted,
      };

      if (search && search.trim() && !baseFilters.title) {
        requestBody.search = search.trim();
        requestBody.searchFields = ['title', 'title_ar', 'description', 'description_ar'];
      }

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
      console.error('API Error in getAllAssignments:', error);
      throw error;
    }
  }

  // ✅ جلب واجب معين
  async getAssignment(id: number): Promise<Exam> {
    const response = await api.get(`/${this.endpoint}/${id}`);
    return response.data.data;
  }

  // ✅ إنشاء واجب جديد
  async createAssignment(data: any): Promise<Exam> {
    try {
      const payload = {
        ...data,
        type: 'assignment',
      };
      console.log('📤 Creating assignment payload:', payload);
      
      const response = await api.post(`/${this.endpoint}`, payload);
      
      toast({ 
        title: "Success", 
        description: "Assignment created successfully" 
      });
      
      return response.data.data;
    } catch (error: any) {
      console.error('Create assignment error:', error);
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to create assignment', 
        variant: 'destructive' 
      });
      throw error;
    }
  }

  // ✅ تحديث واجب
  async updateAssignment(id: number, data: any): Promise<Exam> {
    try {
      const response = await api.patch(`/${this.endpoint}/${id}`, data);
      toast({ 
        title: "Success", 
        description: "Assignment updated successfully" 
      });
      return response.data.data;
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to update assignment", 
        variant: "destructive" 
      });
      throw error;
    }
  }

  // ✅ حذف واجب
  async deleteAssignment(id: number): Promise<void> {
    await this.delete(id);
    toast({ title: "Success", description: "Assignment deleted" });
  }

  // ✅ تبديل حالة النشاط
  async toggleAssignmentActive(id: number): Promise<{ message: string }> {
    try {
      const response = await api.put(`/${this.endpoint}/${id}/active`);
      toast({ 
        title: "Success", 
        description: response.data?.message || "Assignment status changed" 
      });
      return response.data;
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to toggle status", 
        variant: "destructive" 
      });
      throw error;
    }
  }

  // ✅ إضافة أسئلة
  async addQuestions(assignmentId: number, questions: any[]): Promise<boolean> {
    const response = await api.post(`/${this.endpoint}/add-questions`, { 
      exam_id: assignmentId, 
      questions 
    });
    return true;
  }

  // ✅ تبديل الترتيب العشوائي للأسئلة
  async toggleRandomQuestions(id: number, value: boolean): Promise<Exam> {
    const response = await api.patch(`/${this.endpoint}/${id}`, { 
      random_questions: value 
    });
    return response.data.data;
  }

  // ✅ تبديل الترتيب العشوائي للإجابات
  async toggleRandomAnswers(id: number, value: boolean): Promise<Exam> {
    const response = await api.patch(`/${this.endpoint}/${id}`, { 
      random_answers: value 
    });
    return response.data.data;
  }

  // ✅ تبديل إظهار النتيجة
  async toggleShowResult(id: number, value: boolean): Promise<Exam> {
    const response = await api.patch(`/${this.endpoint}/${id}`, { 
      show_result: value 
    });
    return response.data.data;
  }
}

export const assignmentService = new AssignmentService();