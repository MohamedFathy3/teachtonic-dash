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

  // ============================================================
  // ✅ GET ALL EXAMS
  // ============================================================
  async getAllExams(
    filters?: Record<string, any>,
    perPage: number = 12,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<Exam>> {
    try {
      const baseFilters: Record<string, any> = { ...(filters || {}) };

      const requestBody: Record<string, any> = {
        filters: { ...baseFilters, type: 'exam' },
        orderBy: 'created_at',
        orderByDirection: 'desc',
        perPage,
        page,
        paginate: true,
        delete: showDeleted,
      };

      // ✅ إضافة البحث
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

  // ============================================================
  // ✅ GET EXAM BY ID
  // ============================================================
  async getExam(id: number): Promise<Exam> {
    try {
      const response = await api.get(`/${this.endpoint}/${id}`);
      console.log('📚 Get exam response:', response.data);
      
      // ✅ لو الـ data كانت Array
      if (Array.isArray(response.data?.data) && response.data.data.length > 0) {
        return response.data.data[0];
      }
      
      // ✅ لو الـ data كانت Object
      if (response.data?.data && typeof response.data.data === 'object') {
        return response.data.data;
      }
      
      // ✅ لو الـ response نفسه هو الـ exam
      if (response.data && typeof response.data === 'object' && response.data.id) {
        return response.data;
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

  // ============================================================
  // ✅ GET EXAM BY ID (alias)
  // ============================================================
  async getExamById(id: number): Promise<any> {
    return this.getExam(id);
  }

  // ============================================================
  // ✅ CREATE EXAM
  // ============================================================
  private creatingExams = new Set<string>();

// ============================================================
// ✅ CREATE EXAM
// ============================================================
async createExam(data: CreateExamDTO): Promise<Exam> {
  try {
    // ✅ تصحيح الـ payload
    const payload = {
      title: data.title,
      title_ar: data.title_ar || '',
      description: data.description || '',
      description_ar: data.description_ar || '',
      type: data.type || 'exam',
      teacher_id: data.teacher_id,
      course_detail_id: data.course_detail_id,
      stage_id: data.stage_id,
      total_marks: data.total_marks || 0,
      total_must_pass_marks: data.total_must_pass_marks || 0,
      duration_minutes: data.duration_minutes || 0,
      type_exam: (data as any).type_exam || 'online',
      time_start: (data as any).time_start || null,
      time_end: (data as any).time_end || null,
      ...(data.image && { image: data.image }),
    };

    console.log('📤 Creating exam payload:', payload);

    // ✅ استخدام endpoint الصحيح (بدون /create)
    const response = await api.post(`/${this.endpoint}`, payload);
    
    console.log('📥 Create exam response:', response.data);

    // ✅ استخراج الـ Exam من الـ Response
    let createdExam: Exam | null = null;

    // 🔍 الحالة 1: response.data.data هو Array (زي ما انت شايف)
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      createdExam = response.data.data[0];
    }
    // 🔍 الحالة 2: response.data.data هو Object
    else if (response.data?.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
      createdExam = response.data.data;
    }
    // 🔍 الحالة 3: response.data هو Array
    else if (Array.isArray(response.data) && response.data.length > 0) {
      createdExam = response.data[0];
    }
    // 🔍 الحالة 4: response.data هو Object
    else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data) && response.data.id) {
      createdExam = response.data;
    }
    // 🔍 الحالة 5: response.data.result === 'Success'
    else if (response.data?.result === 'Success') {
      if (Array.isArray(response.data.data) && response.data.data.length > 0) {
        createdExam = response.data.data[0];
      } else if (response.data.data && typeof response.data.data === 'object') {
        createdExam = response.data.data;
      }
    }

    console.log('✅ Created exam:', createdExam);

    // ✅ لو لقينا الـ exam، نرجعه
    if (createdExam && createdExam.id) {
      toast({
        title: "Success",
        description: "Exam created successfully",
      });
      return createdExam;
    }

    // ✅ لو ما لقيناه، نجيب آخر امتحان للمعلم
    console.warn('⚠️ Created exam not found in response, fetching latest...');
    const allExams = await this.getAllExams(
      { teacher_id: data.teacher_id },
      1,
      1
    );

    if (allExams.data && allExams.data.length > 0) {
      const latestExam = allExams.data[0];
      toast({
        title: "Success",
        description: "Exam created successfully",
      });
      return latestExam;
    }

    throw new Error('Failed to retrieve created exam');

  } catch (error: any) {
    console.error('❌ Create exam error:', error);
    
    if (error.response?.status === 422) {
      const errors = error.response.data?.errors;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join('\n');
        toast({
          title: 'Validation Error',
          description: errorMessages || 'Please check your input',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to create exam',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to create exam',
        variant: 'destructive',
      });
    }
    
    throw error;
  }
}

  // ============================================================
  // ✅ UPDATE EXAM
  // ============================================================
  async updateExam(id: number, data: UpdateExamDTO): Promise<Exam> {
    try {
      const payload: any = {
        title: data.title,
        title_ar: data.title_ar || '',
        description: data.description || '',
        description_ar: data.description_ar || '',
        teacher_id: data.teacher_id,
        course_detail_id: data.course_detail_id,
        stage_id: data.stage_id,
        total_marks: data.total_marks || 0,
        total_must_pass_marks: data.total_must_pass_marks || 0,
        duration_minutes: data.duration_minutes || 0,
        type_exam: (data as any).type_exam || undefined,
        time_start: (data as any).time_start || null,
        time_end: (data as any).time_end || null,
      };

      if (data.image) {
        payload.image = data.image;
      }

      console.log('📤 Updating exam payload:', payload);

      const response = await api.put(`/${this.endpoint}/${id}`, payload);
      
      console.log('📥 Update exam response:', response.data);

      // ✅ استخراج الـ exam من الـ Response
      let updatedExam: Exam | null = null;
      
      if (response.data?.data && typeof response.data.data === 'object') {
        updatedExam = response.data.data;
      } else if (response.data && typeof response.data === 'object' && response.data.id) {
        updatedExam = response.data;
      }

      if (updatedExam) {
        toast({
          title: "Success",
          description: "Exam updated successfully",
        });
        return updatedExam;
      }

      throw new Error('Failed to retrieve updated exam');

    } catch (error: any) {
      console.error('Update exam error:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat().join('\n');
          toast({
            title: 'Validation Error',
            description: errorMessages || 'Please check your input',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to update exam",
          variant: "destructive"
        });
      }
      throw error;
    }
  }

  // ============================================================
  // ✅ DELETE EXAM (soft delete)
  // ============================================================
  async deleteExam(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({ 
        title: "Success", 
        description: "Exam moved to trash successfully" 
      });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to delete exam", 
        variant: "destructive" 
      });
      throw error;
    }
  }

  // ============================================================
  // ✅ FORCE DELETE EXAM (permanent)
  // ============================================================
  async forceDeleteExam(id: number): Promise<void> {
    try {
      await this.forceDelete(id);
      toast({ 
        title: "Success", 
        description: "Exam permanently deleted" 
      });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to force delete exam", 
        variant: "destructive" 
      });
      throw error;
    }
  }

  // ============================================================
  // ✅ RESTORE EXAM
  // ============================================================
  async restoreExam(id: number): Promise<Exam> {
    try {
      const exam = await this.restore(id);
      toast({ 
        title: "Success", 
        description: "Exam restored successfully" 
      });
      return exam;
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to restore exam", 
        variant: "destructive" 
      });
      throw error;
    }
  }

  // ============================================================
  // ✅ GET DELETED EXAMS
  // ============================================================
  async getDeletedExams(
    perPage: number = 12,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Exam>> {
    return this.getAllExams({}, perPage, page, search, true);
  }

  // ============================================================
  // ✅ GET TEACHER EXAMS
  // ============================================================
  async getTeacherExams(
    teacherId: number,
    perPage: number = 12,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Exam>> {
    return this.getAllExams({ teacher_id: teacherId }, perPage, page, search);
  }

  // ============================================================
  // ✅ GET EXAMS BY LESSON
  // ============================================================
  async getExamsByLesson(
    lessonId: number,
    perPage: number = 12,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Exam>> {
    return this.getAllExams({ course_detail_id: lessonId }, perPage, page, search);
  }

  // ============================================================
  // ✅ GET EXAMS BY STAGE
  // ============================================================
  async getExamsByStage(
    stageId: number,
    perPage: number = 12,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Exam>> {
    return this.getAllExams({ stage_id: stageId }, perPage, page, search);
  }

  // ============================================================
  // ✅ GET ACTIVE EXAMS
  // ============================================================
  async getActiveExams(
    perPage: number = 12,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Exam>> {
    return this.getAllExams({ active: 1 }, perPage, page, search);
  }

  // ============================================================
  // ✅ TOGGLE EXAM ACTIVE STATUS
  // ============================================================
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

  // ============================================================
  // ✅ TOGGLE RANDOM QUESTIONS
  // ============================================================
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

  // ============================================================
  // ✅ TOGGLE RANDOM ANSWERS
  // ============================================================
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

  // ============================================================
  // ✅ TOGGLE SHOW RESULT
  // ============================================================
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

  // ============================================================
  // ✅ ADD QUESTIONS TO EXAM
  // ============================================================
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

  // ============================================================
  // ✅ GET EXAM QUESTIONS
  // ============================================================
  async getExamQuestions(examId: number): Promise<QuestionsResponse> {
    const response = await api.get(`/${this.endpoint}/${examId}/questions`);
    return response.data;
  }

  // ============================================================
  // ✅ GRADE ESSAY QUESTION
  // ============================================================
  async gradeEssayQuestion(answerId: number, mark: number): Promise<{ status: boolean; message: string }> {
    try {
      const payload: GradeEssayDTO = { answer_id: answerId, mark };
      const response = await api.post(`/${this.endpoint}/grade-essay`, payload);
      toast({ 
        title: "Success", 
        description: response.data?.message || "Essay graded successfully" 
      });
      return response.data;
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to grade essay", 
        variant: "destructive" 
      });
      throw error;
    }
  }

  // ============================================================
  // ✅ SUBMIT EXAM
  // ============================================================
  async submitExam(submission: SubmitExamDTO): Promise<ExamResult> {
    try {
      const response = await api.post(`/${this.endpoint}/submit`, submission);
      toast({ 
        title: "Success", 
        description: "Exam submitted successfully" 
      });
      return response.data.data;
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to submit exam", 
        variant: "destructive" 
      });
      throw error;
    }
  }

  // ============================================================
  // ✅ GET EXAM RESULT
  // ============================================================
  async getExamResult(examId: number, studentId?: number): Promise<ExamResult> {
    const params = studentId ? { student_id: studentId } : {};
    const response = await api.get(`/${this.endpoint}/${examId}/result`, { params });
    return response.data.data;
  }

  // ============================================================
  // ✅ BULK OPERATIONS
  // ============================================================
  async bulkDeleteExams(ids: number[]): Promise<void> {
    await this.bulkDelete(ids);
    toast({ 
      title: "Success", 
      description: `${ids.length} exams moved to trash` 
    });
  }

  async bulkForceDeleteExams(ids: number[]): Promise<void> {
    await this.bulkForceDelete(ids);
    toast({ 
      title: "Success", 
      description: `${ids.length} exams permanently deleted` 
    });
  }

  async bulkRestoreExams(ids: number[]): Promise<void> {
    await this.bulkRestore(ids);
    toast({ 
      title: "Success", 
      description: `${ids.length} exams restored` 
    });
  }
}

export const examService = new ExamService();