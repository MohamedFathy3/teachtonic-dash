export interface Question {
  id: number;
  exam_id: number;

  question_type: 'true_false' | 'essay' | 'multiple_choice';

  question: string;

  mark: string;

  image: string | null;

  correct_answer?: string;

  options: string[];

  created_at: string;

  updated_at: string;
}

export interface ExamImage {
  id: number;
  name: string;
  mimeType: string;
  size: number;
  authorId: number | null;
  previewUrl: string;
  fullUrl: string;
  createdAt: string;
}

export interface Exam {
  id: number;

  title: string;

  description: string;

  type: 'exam' | 'assignment';

  questions: Question[];

  total_marks: number;

  total_must_pass_marks: number;

  duration_minutes: number;

  random_questions: boolean;

  random_answers: boolean;

  show_result: boolean;

  active: boolean | null;

  imageUrl: string;

  image: ExamImage | null;

  created_at: string;

  updated_at: string;
}

export interface CourseDetail {
  id: number;

  course_id: number;

  title: string;

  title_ar: string;

  description: string;

  description_ar: string;

  content_link: string;

  lession_date: string;

  lession_time: string;

  price: string;

  must_pass_to_unlock: boolean;

  exams: Exam[];

  assignments: Exam[];

  discount: string;

  attended: boolean;

  createdAt: string;
}

export interface CourseImage {
  id: number;

  name: string;

  mimeType: string;

  size: number;

  authorId: number | null;

  previewUrl: string;

  fullUrl: string;

  createdAt: string;
}

export interface CourseSemester {
  id: number;

  name: string;

  name_ar: string;

  active: boolean;

  price: string;

  discount: string;

  teacher_id: number;

  subject_id: number | null;

  createdAt: string;
}

export interface TeacherCourse {
  id: number;

  teacher_id: number;

  stage_id: number;

  subject_id: number;

  semester_id: number;

  semester: CourseSemester;

  price: string;

  discount: string;

  price_before_discount: number;

  details: CourseDetail[];

  title: string;

  title_ar: string;

  description: string;

  description_ar: string;

  about: string;

  about_ar: string;

  hour_time_course: string;

  type: string;

  count_student: number;

  start_date: string;

  end_date: string;

  active: number;

  link_video: string | null;

  imageUrl: string;

  image: CourseImage;

  time_duration: string | null;

  createdAt: string;
}

export interface TeacherResponse {
  id: number;

  name: string;

  email: string;

  courses: TeacherCourse[];
}