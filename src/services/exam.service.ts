/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/exam.service.ts

import { BaseService } from './base.service';
import type { Exam, ExamFormData, PaginatedResponse, Question, QuestionsResponse } from '@/types/exam.types';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

class ExamService extends BaseService<Exam> {
  constructor() {
    super('exam');
  }

  // ✅ جلب الامتحانات
  async getAllExams(
    filters?: Record<string, any>,
    perPage: number = 12,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<Exam>> {
    try {
      const requestBody: Record<string, any> = {
        filters: filters || {},
        orderBy: 'created_at',
        orderByDirection: 'desc',
        perPage,
        page,
        paginate: true,
        delete: showDeleted,
      };

      if (search && search.trim()) {
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
      console.error('API Error in getAllExams:', error);
      throw error;
    }
  }

  // ✅ جلب الامتحانات المحذوفة
  async getDeletedExams(perPage: number = 12, page: number = 1, search?: string): Promise<PaginatedResponse<Exam>> {
    return this.getAllExams({}, perPage, page, search, true);
  }

  // ✅ جلب امتحانات معلم معين
  async getTeacherExams(teacherId: number): Promise<PaginatedResponse<Exam>> {
    return this.getAllExams({ teacher_id: teacherId });
  }

  // ✅ جلب امتحان بالـ ID مع أسئلته
  async getExam(id: number): Promise<Exam> {
    const response = await api.get(`/${this.endpoint}/${id}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error('Invalid response structure');
  }

  // ✅ إنشاء امتحان جديد
  async createExam(data: ExamFormData): Promise<Exam> {
    try {
      const response = await api.post(`/${this.endpoint}`, data);
      toast({ title: "Success", description: "Exam created successfully" });
      return response.data.data;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to create exam", variant: "destructive" });
      throw error;
    }
  }

  // ✅ تحديث امتحان
  async updateExam(id: number, data: Partial<ExamFormData>): Promise<Exam> {
    try {
      const response = await api.patch(`/${this.endpoint}/${id}`, data);
      toast({ title: "Success", description: "Exam updated successfully" });
      return response.data.data;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to update exam", variant: "destructive" });
      throw error;
    }
  }

  // ✅ نقل امتحان إلى سلة المحذوفات
  async deleteExam(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({ title: "Success", description: "Exam moved to trash successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to delete exam", variant: "destructive" });
      throw error;
    }
  }

  // ✅ حذف نهائي
  async forceDeleteExam(id: number): Promise<void> {
    try {
      await this.forceDelete(id);
      toast({ title: "Success", description: "Exam permanently deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to force delete exam", variant: "destructive" });
      throw error;
    }
  }

  // ✅ استعادة امتحان
  async restoreExam(id: number): Promise<Exam> {
    try {
      const exam = await this.restore(id);
      toast({ title: "Success", description: "Exam restored successfully" });
      return exam;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to restore exam", variant: "destructive" });
      throw error;
    }
  }

  // ✅ تبديل حالة التفعيل
  async toggleExamActive(id: number): Promise<{ message: string }> {
    try {
      const result = await this.toggleActive(id);
      toast({ title: "Success", description: result.message || "Exam status changed successfully" });
      return result;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to toggle exam status", variant: "destructive" });
      throw error;
    }
  }

  // ✅ إضافة أسئلة للامتحان
  async addQuestions(examId: number, questions: Partial<Question>[]): Promise<QuestionsResponse> {
    try {
      const response = await api.post(`/${this.endpoint}/add-questions`, {
        exam_id: examId,
        questions
      });
      toast({ title: "Success", description: response.data?.message || "Questions added successfully" });
      return response.data;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to add questions", variant: "destructive" });
      throw error;
    }
  }

  // ✅ جلب أسئلة الامتحان
  async getExamQuestions(examId: number): Promise<QuestionsResponse> {
    const response = await api.get(`/${this.endpoint}/${examId}/questions`);
    return response.data;
  }

  // ✅ تصحيح السؤال المقالي
  async gradeEssayQuestion(answerId: number, mark: number): Promise<{ status: boolean; message: string }> {
    try {
      const response = await api.post(`/${this.endpoint}/grade-essay`, { answer_id: answerId, mark });
      toast({ title: "Success", description: response.data?.message || "Essay graded successfully" });
      return response.data;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to grade essay", variant: "destructive" });
      throw error;
    }
  }

  // ✅ العمليات الجماعية
  async bulkDeleteExams(ids: number[]): Promise<void> {
    await this.bulkDelete(ids);
    toast({ title: "Success", description: `${ids.length} exams moved to trash` });
  }

  async bulkForceDeleteExams(ids: number[]): Promise<void> {
    await this.bulkForceDelete(ids);
    toast({ title: "Success", description: `${ids.length} exams permanently deleted` });
  }

  async bulkRestoreExams(ids: number[]): Promise<void> {
    await this.bulkRestore(ids);
    toast({ title: "Success", description: `${ids.length} exams restored` });
  }
}

export const examService = new ExamService();