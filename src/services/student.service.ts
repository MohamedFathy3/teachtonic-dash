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
  type_of_study: 'general' | 'azhar' | null;  // ✅ أضف هذا 
  teacher_id: number;
  stage_id: number;
  stage?: {
    id: number;
    name: string;
    name_ar: string | null;
  };
  created_at: string;
}

// أنواع الأسئلة
export interface ExamQuestion {
  id: number;
  question: string;
  mark: string;
  question_type: 'true_false' | 'multiple_choice' | 'essay';
  correct_answer: string | null;
  student_answer: string | null;
  is_correct: boolean | null;
  mark_obtained: string | null;
}

// نوع الامتحان/الواجب
export interface StudentExam {
  exam: {
    id: number;
    title: string;
    total_marks: number;
    type: 'exam' | 'assignment';
  };
  student_mark: number | null;
  questions: ExamQuestion[];
}

// بيانات تعلم الطالب الكاملة
export interface StudentLearningData {
  student: Student;
  semesters: any[];
  courses: any[];
  lessons: any[];
  exams: StudentExam[];      // إضافة الامتحانات
  assignments: StudentExam[]; // إضافة الواجبات
}

export interface StudentFilters {
  id?: number;
  stage_id?: number;
  type_of_attendance?: string;
  active?: boolean;
  gender?: string;
  phone?: string;
  code_parent?: string;
  center_hour_id?: number;
  type_of_study?: string;
}

class StudentService extends BaseService<Student> {
  constructor() {
    super('student');
  }

  async getTeacherStudents(
    teacherId: number,
    filters?: StudentFilters,
    perPage: number = 10,
    page: number = 1,
    search?: string
  ): Promise<{ data: Student[]; meta: any }> {
    try {

      // 🎯 فلتر واحد فقط (أولوية)
      let singleFilter: Record<string, any> = {
        teacher_id: teacherId,
        ...filters
      };


      if (search && search.trim()) {
        const value = search.trim();

        const isNumber = /^\d+$/.test(value);

        if (isNumber) {
          singleFilter = {
            teacher_id: teacherId,
            id: Number(value),
            phone: value,
          };
        } else {
          singleFilter = {
            teacher_id: teacherId,
            name: value,   // 👈 أهم واحد
          };
        }
      }
      else if (filters?.stage_id) {
        singleFilter = {
          teacher_id: teacherId,
          stage_id: filters.stage_id,
        };
      }
      else if (filters?.type_of_attendance) {
        singleFilter = {
          teacher_id: teacherId,
          type_of_attendance: filters.type_of_attendance,
        };
      }
      else if (filters?.active !== undefined) {
        singleFilter = {
          teacher_id: teacherId,
          active: filters.active,
        };
      } else if (filters?.id) {
        singleFilter = {
          teacher_id: teacherId,
          id: filters.id,
        };
      }
      else if (filters?.phone) {
        singleFilter = {
          teacher_id: teacherId,
          phone: filters.phone,
        };
      }
      else if (filters?.code_parent) {
        singleFilter = {
          teacher_id: teacherId,
          code_parent: filters.code_parent,
        };
      }
      else if (filters?.center_hour_id) {
        singleFilter = {
          teacher_id: teacherId,
          center_hour_id: filters.center_hour_id,
        };
      } else if (filters?.type_of_study) {
        singleFilter = {
          teacher_id: teacherId,
          type_of_study: filters.type_of_study,
        };
      }

      const requestBody = {
        filters: singleFilter, // ✅ فلتر واحد فقط
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage,
        page,
        paginate: true,
        delete: false,
      };

      const response = await api.post(
        `/${this.endpoint}/index`,
        requestBody
      );

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










  // جلب تفاصيل طالب واحد مع محتواه التعليمي (الكورسات والترم والدروس والامتحانات والواجبات)
  async getStudentLearning(studentId: number): Promise<StudentLearningData> {
    try {
      const response = await api.get(`/my-student/learn/${studentId}`);

      // التأكد من وجود البيانات بالشكل الصحيح
      const responseData = response.data?.data;

      if (!responseData) {
        throw new Error('No data received from server');
      }

      // معالجة البيانات للتأكد من وجود exams و assignments
      const learningData: StudentLearningData = {
        student: responseData.student,
        semesters: responseData.semesters || [],
        courses: responseData.courses || [],
        lessons: responseData.lessons || [],
        exams: responseData.student?.exams || [],
        assignments: responseData.student?.assignments || [],
      };

      return learningData;
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

  // تصحيح سؤال مقالي
  async gradeEssayQuestion(answerId: number, mark: number): Promise<any> {
    try {
      const response = await api.post('/exam/grade-essay', {
        answer_id: answerId,
        mark: mark
      });

      toast({
        title: "Success",
        description: "Essay question graded successfully",
      });

      return response.data;
    } catch (error: any) {
      console.error('API Error in gradeEssayQuestion:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to grade essay question",
        variant: "destructive",
      });
      throw error;
    }
  }

  // جلب إحصائيات الطالب
  async getStudentStats(studentId: number): Promise<{
    totalCourses: number;
    totalLessons: number;
    totalExams: number;
    totalAssignments: number;
    averageExamScore: number;
    averageAssignmentScore: number;
    completedLessons: number;
    attendanceRate: number;
  }> {
    try {
      const learningData = await this.getStudentLearning(studentId);

      const totalCourses = learningData.courses?.length || 0;
      const totalLessons = learningData.lessons?.length || 0;
      const totalExams = learningData.exams?.length || 0;
      const totalAssignments = learningData.assignments?.length || 0;

      // حساب متوسط درجات الامتحانات
      let examTotalScore = 0;
      let examTotalMax = 0;
      learningData.exams?.forEach((exam: StudentExam) => {
        if (exam.student_mark !== null) {
          examTotalScore += exam.student_mark;
          examTotalMax += exam.exam.total_marks;
        }
      });
      const averageExamScore = examTotalMax > 0 ? (examTotalScore / examTotalMax) * 100 : 0;

      // حساب متوسط درجات الواجبات
      let assignmentTotalScore = 0;
      let assignmentTotalMax = 0;
      learningData.assignments?.forEach((assignment: StudentExam) => {
        if (assignment.student_mark !== null) {
          assignmentTotalScore += assignment.student_mark;
          assignmentTotalMax += assignment.exam.total_marks;
        }
      });
      const averageAssignmentScore = assignmentTotalMax > 0 ? (assignmentTotalScore / assignmentTotalMax) * 100 : 0;

      // حساب عدد الدروس المكتملة
      const completedLessons = learningData.lessons?.filter((lesson: any) => lesson.attended === true).length || 0;

      // نسبة الحضور (افتراضية، يمكن تعديلها حسب احتياجك)
      const attendanceRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      return {
        totalCourses,
        totalLessons,
        totalExams,
        totalAssignments,
        averageExamScore: Math.round(averageExamScore),
        averageAssignmentScore: Math.round(averageAssignmentScore),
        completedLessons,
        attendanceRate: Math.round(attendanceRate),
      };
    } catch (error) {
      console.error('Error getting student stats:', error);
      return {
        totalCourses: 0,
        totalLessons: 0,
        totalExams: 0,
        totalAssignments: 0,
        averageExamScore: 0,
        averageAssignmentScore: 0,
        completedLessons: 0,
        attendanceRate: 0,
      };
    }
  }

  // جلب تفاصيل امتحان معين للطالب
  async getStudentExamDetails(studentId: number, examId: number): Promise<StudentExam | null> {
    try {
      const learningData = await this.getStudentLearning(studentId);

      // البحث في الامتحانات
      let exam = learningData.exams?.find((e: StudentExam) => e.exam.id === examId);

      // إذا لم يوجد في الامتحانات، ابحث في الواجبات
      if (!exam) {
        exam = learningData.assignments?.find((a: StudentExam) => a.exam.id === examId);
      }

      return exam || null;
    } catch (error) {
      console.error('Error getting student exam details:', error);
      return null;
    }
  }

  // جلب قائمة الأسئلة المقالية التي تحتاج تصحيح
  async getPendingEssayQuestions(studentId: number): Promise<ExamQuestion[]> {
    try {
      const learningData = await this.getStudentLearning(studentId);
      const pendingQuestions: ExamQuestion[] = [];

      // جمع الأسئلة المقالية التي لم يتم تصحيحها من الامتحانات
      learningData.exams?.forEach((exam: StudentExam) => {
        exam.questions?.forEach((question: ExamQuestion) => {
          if (question.question_type === 'essay' &&
            question.student_answer &&
            question.mark_obtained === null) {
            pendingQuestions.push({
              ...question,
              exam_title: exam.exam.title,
              exam_type: exam.exam.type,
            } as any);
          }
        });
      });

      // جمع الأسئلة المقالية التي لم يتم تصحيحها من الواجبات
      learningData.assignments?.forEach((assignment: StudentExam) => {
        assignment.questions?.forEach((question: ExamQuestion) => {
          if (question.question_type === 'essay' &&
            question.student_answer &&
            question.mark_obtained === null) {
            pendingQuestions.push({
              ...question,
              exam_title: assignment.exam.title,
              exam_type: assignment.exam.type,
            } as any);
          }
        });
      });

      return pendingQuestions;
    } catch (error) {
      console.error('Error getting pending essay questions:', error);
      return [];
    }
  }
}

export const studentService = new StudentService();