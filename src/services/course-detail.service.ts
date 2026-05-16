// src/services/course-detail.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './base.service';
import api from '@/lib/api';

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
  createdAt: string;
  image?: any;
}

class CourseDetailService extends BaseService<CourseDetail> {
  constructor() {
    super('course-detail');
  }

  async getAll(params?: any): Promise<any> {
    const requestBody = {
      filters: params?.course_id ? { course_id: params.course_id } : {},
      orderBy: 'lession_date',
      orderByDirection: 'desc',
      perPage: params?.perPage || 10,
      page: params?.page || 1,
      paginate: true,
    };
    
    console.log('🔍 CourseDetail Request:', requestBody);
    
    const response = await api.post(`/${this.endpoint}/index`, requestBody);
    
    console.log('📦 CourseDetail Response:', response.data);
    
    return response.data;
  }

  async create(data: any): Promise<CourseDetail> {
    const response = await api.post(`/${this.endpoint}`, data);
    return response.data.data;
  }

  async update(id: number, data: any): Promise<CourseDetail> {
    const response = await api.patch(`/${this.endpoint}/${id}`, data);
    return response.data.data;
  }

  async deleteDetail(id: number): Promise<void> {
    await api.delete(`/${this.endpoint}/${id}`);
  }
}

export const courseDetailService = new CourseDetailService();