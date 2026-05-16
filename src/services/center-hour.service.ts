// src/services/center-hour.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './base.service';
import api from '@/lib/api';
import { CenterHour, CreateCenterHourRequest, GetAllCenterHoursParams } from '@/types/center-hour.types';

class CenterHourService extends BaseService<CenterHour> {
  constructor() {
    super('center-hour');
  }

  // جلب كل المواعيد
  async getAll(params?: GetAllCenterHoursParams): Promise<any> {
    const requestBody: any = {
      filters: {},
      orderBy: 'date',
      orderByDirection: 'desc',
      perPage: params?.perPage || 10,
      page: params?.page || 1,
      paginate: true,
      delete: false,
    };

    if (params?.teacher_id) {
      requestBody.filters.teacher_id = params.teacher_id;
    }

    if (params?.search) {
      requestBody.search = params.search;
      requestBody.searchFields = ['title', 'note'];
    }

    if (params?.from_date) {
      requestBody.filters.date_from = params.from_date;
    }

    if (params?.to_date) {
      requestBody.filters.date_to = params.to_date;
    }

    const response = await api.post(`/${this.endpoint}/index`, requestBody);
    return response.data;
  }

  // إنشاء موعد جديد
  async create(data: CreateCenterHourRequest): Promise<CenterHour> {
    const response = await api.post(`/${this.endpoint}`, data);
    return response.data.data;
  }

  // تحديث موعد
  async update(id: number, data: Partial<CreateCenterHourRequest>): Promise<CenterHour> {
    const response = await api.patch(`/${this.endpoint}/${id}`, data);
    return response.data.data;
  }

  // حذف موعد
  async deleteHour(id: number): Promise<void> {
    await api.delete(`/${this.endpoint}/${id}`);
  }

  // حذف جماعي
  async bulkDelete(ids: number[]): Promise<void> {
    await api.delete(`/${this.endpoint}/delete`, { data: { items: ids } });
  }

  // إحصائيات المواعيد
  async getStatistics(): Promise<any> {
    const response = await api.get(`/${this.endpoint}/statistics`);
    return response.data.data;
  }
}

export const centerHourService = new CenterHourService();