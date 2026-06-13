// src/services/exam.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './base.service';
import type {
  Exam,
  CreateExamDTO,
  UpdateExamDTO,
  PaginatedResponse,
  Question,
  QuestionsResponse,
  AddQuestionsDTO,
  GradeEssayDTO,
  SubmitExamDTO,
  ExamResult
} from '@/types/exam.types';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

class ExamService extends BaseService<Exam> {
  constructor() {
    super('exam');
  }

  async getAllExams(
    filters?: Record<string, any>,
    perPage: number = 12,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<Exam>> {
    try {
      const baseFilters: Record<string, any> = { ...(filters || {}) };

      // ✅ إضافة البحث في عدة حقول
      if (search && search.trim()) {
        // الطريقة الأولى: search field منفصل
        // baseFilters.search = search.trim();
        
        // الطريقة الثانية: بحث في title و description
        baseFilters.title = search.trim();
        // baseFilters.description = search.trim(); // اختياري

      }

      const requestBody: Record<string, any> = {
        filters: { ...baseFilters, type: 'exam' },
        orderBy: 'created_at',
        orderByDirection: 'desc',
        perPage,
        page,
        paginate: true,
        delete: showDeleted,
      };

      // ✅ لو في search منفصل، نضيفه كـ property منفصل
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
      console.error('API Error in getAllExams:', error);
      throw error;
    }
  }
// src/services/exam.service.ts

// ✅ تبديل إظهار النتيجة
async toggleShowResult(id: number): Promise<Exam> {
  try {
    const response = await api.put(`/${this.endpoint}/${id}/show_result`);
    toast({
      title: "Success",
      description: "Show result toggled successfully"
    });
    return response.data.data;
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to update setting",
      variant: "destructive"
    });
    throw error;
  }
}
  // ✅ جلب الامتحانات المحذوفة
  async getDeletedExams(
    perPage: number = 12,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Exam>> {
    return this.getAllExams({}, perPage, page, search, true);
  }

  // ✅ جلب امتحانات معلم معين
  async getTeacherExams(
    teacherId: number,
    perPage: number = 12,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Exam>> {
    return this.getAllExams({ teacher_id: teacherId }, perPage, page, search);
  }

  // ✅ جلب امتحانات درس معين
  async getExamsByLesson(
    lessonId: number,
    perPage: number = 12,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Exam>> {
    return this.getAllExams({ course_detail_id: lessonId }, perPage, page, search);
  }

  // ✅ جلب امتحانات المرحلة معينة
  async getExamsByStage(
    stageId: number,
    perPage: number = 12,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Exam>> {
    return this.getAllExams({ stage_id: stageId }, perPage, page, search);
  }

  // ✅ جلب الامتحانات النشطة فقط
  async getActiveExams(
    perPage: number = 12,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Exam>> {
    return this.getAllExams({ active: 1 }, perPage, page, search);
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
  private creatingExams = new Set<string>();

  async createExam(data: CreateExamDTO): Promise<Exam> {
    const key = `${data.title}_${data.teacher_id}`;

    try {
      if (this.creatingExams.has(key)) {
        throw new Error('Exam creation already in progress');
      }

      this.creatingExams.add(key);

      const payload = {
        title: data.title,
        title_ar: data.title_ar,
        description: data.description,
        description_ar: data.description_ar,
        type: data.type,
        teacher_id: data.teacher_id,
        course_detail_id: data.course_detail_id,
        stage_id: data.stage_id,
        total_marks: data.total_marks,
        total_marks_pass_marks: data.total_marks_pass_marks,
        duration_minutes: data.duration_minutes,
        ...(data.image && { image: data.image }),
      };

      const response = await api.post(`/${this.endpoint}`, payload);

      toast({
        title: "Success",
        description: "Exam created successfully",
      });

      if (response.data?.status === 200 && response.data?.result === "Success") {
        if (!response.data?.data) {
          const allExams = await this.getAllExams(
            { teacher_id: data.teacher_id },
            1,
            1
          );

          if (allExams.data && allExams.data.length > 0) {
            return allExams.data[0];
          }

          throw new Error('Failed to retrieve created exam');
        }

        return response.data.data;
      }

      throw new Error(response.data?.message || 'Failed to create exam');

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to create exam',
        variant: 'destructive',
      });
      throw error;
    } finally {
      this.creatingExams.delete(key);
    }
  }

  // ✅ تحديث امتحان
  async updateExam(id: number, data: UpdateExamDTO): Promise<Exam> {
    try {
      const payload: any = {
        title: data.title,
        title_ar: data.title_ar,
        description: data.description,
        description_ar: data.description_ar,
        teacher_id: data.teacher_id,
        course_detail_id: data.course_detail_id,
        stage_id: data.stage_id,
        total_marks: data.total_marks,
        total_marks_pass_marks: data.total_marks_pass_marks,
        duration_minutes: data.duration_minutes,
        type_exam: (data as any).type_exam || undefined,
      };

      if (data.image) {
        payload.image = data.image;
      }

      const response = await api.patch(`/${this.endpoint}/${id}`, payload);

      toast({
        title: "Success",
        description: "Exam updated successfully",
      });

      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update exam",
        variant: "destructive"
      });
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
      toast({
        title: "Success",
        description: result.message || "Exam status changed successfully",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle exam status",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ تبديل ترتيب الأسئلة عشوائي
  async toggleRandomQuestions(id: number): Promise<Exam> {
    try {
      const response = await api.put(`/${this.endpoint}/${id}/random_questions`);
      toast({
        title: "Success",
        description: "Random questions toggled successfully"
      });
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update setting",
        variant: "destructive"
      });
      throw error;
    }
  }

  // ✅ تبديل ترتيب الإجابات عشوائي
  async toggleRandomAnswers(id: number): Promise<Exam> {
    try {
      const response = await api.put(`/${this.endpoint}/${id}/random_answers`);
      toast({
        title: "Success",
        description: "Random answers toggled successfully"
      });
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update setting",
        variant: "destructive"
      });
      throw error;
    }
  }

  // ✅ تبديل إظهار النتيجة
  async toggleShowResult(id: number): Promise<Exam> {
    try {
      const response = await api.put(`/${this.endpoint}/${id}/show_result`);
      toast({
        title: "Success",
        description: "Show result toggled successfully"
      });
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update setting",
        variant: "destructive"
      });
      throw error;
    }
  }

  // ✅ إضافة أسئلة متعددة للامتحان
  async addQuestions(examId: number, questions: any[]): Promise<boolean> {
    try {
      const payload: AddQuestionsDTO = {
        exam_id: examId,
        questions: questions.map(q => ({
          question_type: q.question_type,
          question: q.question,
          mark: q.mark,
          ...(q.image && { image: q.image }),
          ...(q.correct_answer && { correct_answer: q.correct_answer }),
          ...(q.options && { options: q.options }),
        }))
      };

      const response = await api.post(`/${this.endpoint}/add-questions`, payload);

      toast({
        title: "Success",
        description: "Questions added successfully"
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add questions",
        variant: "destructive"
      });
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
      const payload: GradeEssayDTO = { answer_id: answerId, mark };
      const response = await api.post(`/${this.endpoint}/grade-essay`, payload);
      toast({ title: "Success", description: response.data?.message || "Essay graded successfully" });
      return response.data;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to grade essay", variant: "destructive" });
      throw error;
    }
  }

  // ✅ إرسال إجابات الامتحان
  async submitExam(submission: SubmitExamDTO): Promise<ExamResult> {
    try {
      const response = await api.post(`/${this.endpoint}/submit`, submission);
      toast({ title: "Success", description: "Exam submitted successfully" });
      return response.data.data;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to submit exam", variant: "destructive" });
      throw error;
    }
  }
async getExamById(id: number): Promise<any> {
  try {
    const response = await api.get(`/${this.endpoint}/${id}`);
    console.log('📚 Exam API Response:', response);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error('Invalid response structure');
  } catch (error: any) {
    console.error('Error fetching exam:', error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to fetch exam details",
      variant: "destructive"
    });
    throw error;
  }
}
  // ✅ الحصول على نتيجة امتحان الطالب
  async getExamResult(examId: number, studentId?: number): Promise<ExamResult> {
    const params = studentId ? { student_id: studentId } : {};
    const response = await api.get(`/${this.endpoint}/${examId}/result`, { params });
    return response.data.data;
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