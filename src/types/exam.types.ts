// src/types/exam.types.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Option {
  id?: number;
  option_text: string;
  is_correct: boolean;
}
export interface MediaImage {
  id: number;
  name: string;
  mimeType: string;
  size: number;
  fullUrl: string;
  previewUrl: string;
  createdAt: string;
}
// ✅ الفورم المستخدم في الـ Create / Edit
export interface ExamFormData {
  title: string;
  title_ar?: string;

  description: string;
  description_ar?: string;

  type: 'exam' | 'quiz' | 'assignment';

  teacher_id: number;

  course_detail_id: number;

  stage_id: number;

  total_marks: number;

  total_marks_pass_marks: number;

  duration_minutes: number;

  image?: number;
}
export interface Question {
  id?: number;
  exam_id?: number;
  question_type: 'true_false' | 'multiple_choice' | 'essay';
  question: string;
  mark: number;
  // ✅ أضف دي
  image?: MediaImage | null;

  correct_answer?: string;
  options?: Option[];
  created_at?: string;
  updated_at?: string;
}

// ✅ DTO لإنشاء سؤال جديد
export interface CreateQuestionDTO {
  question_type: 'true_false' | 'multiple_choice' | 'essay';
  question: string;
  mark: number;

  image?: number;
  correct_answer?: string;
  options?: Omit<Option, 'id'>[];
}

export interface ExamFilters {
  stageId: number | null;
  subjectId: number | null;
  semesterId: number | null;
  active: boolean | null;
  marksMin: number | null;
  marksMax: number | null;
  lessonId: number | null;
}
// ✅ DTO لإضافة أسئلة متعددة
export interface AddQuestionsDTO {
  exam_id: number;
  questions: CreateQuestionDTO[];
}

// ✅ DTO لتصحيح السؤال المقالي
export interface GradeEssayDTO {
  answer_id: number;
  mark: number;
}

// ✅ DTO لإنشاء امتحان
export interface CreateExamDTO {
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  type: 'exam' | 'quiz' | 'assignment';
  teacher_id: number;
  course_detail_id: number;
  stage_id: number;
  total_marks: number;
  total_marks_pass_marks?: number;
  duration_minutes: number;
  image?: number;
  type_exam?: 'center' | 'online';
}

export type UpdateExamDTO = Partial<CreateExamDTO>
export interface UpdateExamSettingsDTO {
  random_questions?: boolean;
  random_answers?: boolean;
  show_result?: boolean;
  active?: boolean;
}
export interface Exam {
  id: number;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  type: 'exam' | 'quiz' | 'assignment';
  teacher_id: number;
  teacher?: { id: number; name: string; email: string };
  course_detail_id: number;
  course_detail?: { id: number; title: string; title_ar?: string };
  stage_id: number;
  stage?: { id: number; name: string; name_ar?: string };
  total_marks: number;
  total_marks_pass_marks?: number;
  duration_minutes: number;
  active: number;
  // ✅ الخيارات الجديدة
  random_questions?: boolean;
  random_answers?: boolean;
  show_result?: boolean;
  imageUrl?: string;
  image?: { id: number; fullUrl: string };
  questions?: Question[];
  created_at?: string;
  updated_at?: string;
}


export interface ExamResult {
  exam_id: number;
  exam_title: string;
  score: number;
  total_marks: number;
  percentage: number;
  passed: boolean;
  pass_marks: number;
  answers: Record<number, {
    question_id: number;
    answer: string;
    mark_earned?: number;
    is_correct?: boolean;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: any[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  result: string;
  message: string;
  status: number;
}

export interface QuestionsResponse {
  status: boolean;
  exam_id: number;
  exam_title: string;
  questions_count: number;
  data: Question[];
}

export interface SubmitExamDTO {
  exam_id: number;
  answers: Record<number, string>; // question_id -> answer
  started_at?: string;
  submitted_at?: string;
}