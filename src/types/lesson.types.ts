/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/lesson.types.ts

export interface Question {
  id: number;
  exam_id: number;
  question_type: 'multiple_choice' | 'true_false' | 'essay';
  question: string;
  mark: string;
  correct_answer?: string;
  image: { id: number; fullUrl: string; } | null;
  created_at: string;
}

export interface ExamDetail {
  id: number;
  title: string;
  description: string;
  type: string;
  total_marks: number;
  total_must_pass_marks: number;
  duration_minutes: number;
  active: number;
  time_start: string | null;
  time_end: string | null;
  type_exam: string;
  random_questions: boolean;
  random_answers: boolean;
  show_result: boolean;
  imageUrl: string;
  questions: Question[];
  students: any[];
  course_detail_id?: any;
  stage_id?: any;
  teacher_id?: any;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  type: string;
  total_marks: number;
  total_must_pass_marks: number;
  duration_minutes: number;
  active: number;
  time_start: string | null;
  time_end: string | null;
  type_exam: string;
  random_questions: boolean;
  random_answers: boolean;
  show_result: boolean;
  imageUrl: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  type: string;
  total_marks: number;
  total_must_pass_marks: number;
  duration_minutes: number;
  active: number;
  time_start: string;
  time_end: string;
  type_exam: string;
  random_questions: boolean;
  random_answers: boolean;
  show_result: boolean;
  imageUrl: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  name: string;
  phone: string;
  phone_parent: string;
  code_parent: string;
  type_of_attendance: 'online' | 'center';
  gender: string;
  active: boolean;
  balance: string;
  governorate: string | null;
  school_name: string | null;
  imageUrl: string;
  created_at: string;
  attended?: boolean;
}

export interface AttendanceRecord {
  id: number;
  course_detail_id: number;
  student_id: number;
  attended: number;
  attended_at: string;
  created_at: string;
  updated_at: string;
  student: Student;
  course_detail: any;
}

export interface LessonDetail {
  id: number;
  course_id: number;
  course: {
    id: number;
    title: string;
    title_ar: string;
    description: string;
    description_ar: string;
    price: string;
    discount: string;
    type: string;
    count_student: number;
    stage?: { id: number; name: string; name_ar: string; };
    subject?: { id: number; name: string; name_ar: string; };
    teacher?: { id: number; name: string; email: string; phone: string; };
  };
  titles: string[];
  titles_ar: string[];
  link_video: string[];
  description: string;
  description_ar: string;
  content_link: string;
  lession_date: string;
  lession_time: string;
  price: string;
  must_pass_to_unlock: boolean;
  exams: Exam[];
  assignments: Assignment[];
  students: Student[];
  attended: boolean;
  discount: string;
  image: { id: number; fullUrl: string; } | null;
  pdf: { id: number; fullUrl: string; } | null;
  pdfUrl: string | null;
  createdAt: string;
}

export interface StudentFilters {
  search: string;
  typeOfAttendance: string;
  active: string;
  attended: string;
}

export interface AttendanceFilters {
  search: string;
  attended: string;
}

export interface Stats {
  total: number;
  active: number;
  inactive: number;
  online: number;
  center: number;
  attended: number;
  absent: number;
}

export interface LessonStats {
  students: number;
  activeStudents: number;
  onlineStudents: number;
  centerStudents: number;
  exams: number;
  assignments: number;
  videos: number;
}