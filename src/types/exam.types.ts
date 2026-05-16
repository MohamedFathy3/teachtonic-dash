/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/exam.types.ts

export interface Option {
  id?: number;
  option_text: string;
  is_correct: boolean;
}

export interface Question {
  id?: number;
  exam_id?: number;
  question_type: 'true_false' | 'multiple_choice' | 'essay';
  question: string;
  mark: number;
  correct_answer?: string;
  options?: Option[];
  created_at?: string;
  updated_at?: string;
}

export interface Exam {
  id: number;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  type: 'exam' | 'quiz';
  teacher_id: number;
  teacher?: {
    id: number;
    name: string;
    email: string;
  };
  course_detail_id: number;
  course_detail?: {
    id: number;
    title: string;
    title_ar?: string;
  };
  stage_id: number;
  stage?: {
    id: number;
    name: string;
    name_ar?: string;
  };
  total_marks: number;
  duration_minutes: number;
  active: number;
  imageUrl?: string;
  image?: {
    id: number;
    fullUrl: string;
  };
  questions?: Question[];
  created_at?: string;
  updated_at?: string;
}

export interface ExamFormData {
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  type: 'exam' | 'quiz';
  teacher_id: number;
  course_detail_id: number;
  stage_id: number;
  image?: number;
  total_marks: number;
  duration_minutes: number;
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