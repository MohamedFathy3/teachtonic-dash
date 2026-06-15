/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/course.types.ts

export interface Teacher {
  id: number;
  name: string;
  email: string;
  sub_domain: string;
  phone: string;
  active: boolean;
  website: any[];
  createdAt: string;
}

export interface Stage {
  id: number;
  name: string;
  name_ar: string | null;
  position: number;
  active: boolean;
  image: string | null;
  createdAt: string;
}

export interface Subject {
  id: number;
  name: string;
  name_ar: string | null;
  position: number;
  active: boolean;
  stage: Stage | null;
  createdAt: string;
}

export interface Semester {
  id: number;
  name: string;
  name_ar: string;
  active: boolean;
  price: string;
  discount: string;
  teacher_id: number;
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

  export interface Course {
    id: number;
    teacher_id: number;
    teacher: Teacher;
    stage_id: number;
    stage: Stage;
    subject_id: number;
    subject: Subject;
    semester_id: number;
    semester: Semester;
    discount: string;
    details: CourseDetail[];
    students?: CourseStudent[];
    title: string;
    title_ar: string;
    description: string;
    description_ar: string;
    star:number;
    about: string;
    about_ar: string;
    hour_time_course: string;
    type: 'center' | 'online';
    count_student: number;
    price: string;
    start_date: string;
    end_date: string;
    active: number;
    link_video: string | null;
    imageUrl: string;
    image: CourseImage;
    createdAt: string;
    offer_id:number
  }
export interface CourseStudent {
  id: number;
  name: string;
  phone: string;
  phone_parent: string;
  code_parent: string;
  type_of_attendance: string | null;
  gender: string | null;
  active: boolean;
  teacher_id: number;
  stage_id: number;
  center_hour_id: number | null;
  joined_at: string;
  created_at: string;
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
  discount: string;
  attended: boolean;
  createdAt: string;
}
export interface CourseFormData {
  teacher_id: number;
  stage_id: number;
  subject_id: number;
  semester_id: number;
  image: number;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  about: string;
  about_ar: string;
  hour_time_course: string;
  type: 'center' | 'online';
  count_student: number;
  price: number;
  start_date: string;
  end_date: string;
  offer_id :number | null
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

export interface SingleCourseResponse {
  result: string;
  data: Course;
  message: string;
  status: number;
}