// src/types/course-detail.types.ts

import { Student } from "./student.types";

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
  discount: string;
  image?: {
    id: number;
    fullUrl: string;
    previewUrl: string;
    name: string;
  };
  imageUrl?: string;
  createdAt: string;
  course?: {
    id: number;
    title: string;
    title_ar: string;
  };
}

export interface CreateCourseDetailRequest {
  course_id: number;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  content_link: string;
  lession_date: string;
  lession_time: string;
  price: number;
  image?: number;
}

export interface GetAllCourseDetailsParams {
  course_id?: number;
  page?: number;
  perPage?: number;
  search?: string;
}
export interface CourseDetailsResponse {
  id: number;
  title: string;
  title_ar: string;
  description: string;
  imageUrl: string;

  students?: Student[];

  details: CourseDetail[];
}