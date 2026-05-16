// src/services/assignment.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './base.service';
import api from '@/lib/api';
import { Assignment, CreateAssignmentRequest, GetAllAssignmentsParams } from '@/types/assignment.types';

class AssignmentService extends BaseService<Assignment> {
  constructor() {
    super('exam');
  }

  // جلب كل الواجبات
  async getAll(params?: GetAllAssignmentsParams): Promise<any> {
    const requestBody: any = {
      filters: {
        type: 'assignment', // 🔥 مهم: تصفية على الواجبات فقط
      },
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage: params?.perPage || 10,
      page: params?.page || 1,
      paginate: true,
      delete: false,
    };

    if (params?.teacher_id) {
      requestBody.filters.teacher_id = params.teacher_id;
    }

    if (params?.stage_id) {
      requestBody.filters.stage_id = params.stage_id;
    }

    if (params?.search) {
      requestBody.search = params.search;
      requestBody.searchFields = ['title', 'description'];
    }

    const response = await api.post(`/${this.endpoint}/index`, requestBody);
    return response.data;
  }

  // إنشاء واجب جديد
  async create(data: CreateAssignmentRequest): Promise<Assignment> {
    const response = await api.post(`/${this.endpoint}`, data);
    return response.data.data;
  }

  // جلب واجب واحد
  async getById(id: number): Promise<Assignment> {
    const response = await api.get(`/${this.endpoint}/${id}`);
    return response.data.data;
  }

  // تحديث واجب
  async update(id: number, data: Partial<CreateAssignmentRequest>): Promise<Assignment> {
    const response = await api.patch(`/${this.endpoint}/${id}`, data);
    return response.data.data;
  }

  // حذف واجب
  async deleteAssignment(id: number): Promise<void> {
    await api.delete(`/${this.endpoint}/${id}`);
  }

  // حذف جماعي
  async bulkDelete(ids: number[]): Promise<void> {
    await api.delete(`/${this.endpoint}/delete`, { data: { items: ids } });
  }

  // تبديل حالة التفعيل
  async toggleActive(id: number): Promise<any> {
    const response = await api.put(`/${this.endpoint}/${id}/active`);
    return response.data;
  }

  // إحصائيات الواجبات
  async getStatistics(): Promise<any> {
    const response = await api.post(`/${this.endpoint}/index`, {
      filters: { type: 'assignment' },
      perPage: 1,
      page: 1,
    });
    
    const total = response.data.meta?.total || 0;
    
    return {
      total,
      active: 0, // حسب الـ API بتاعك
      inactive: 0,
    };
  }
}

export const assignmentService = new AssignmentService();