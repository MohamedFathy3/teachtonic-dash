// src/services/center-hour.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './base.service';
import api from '@/lib/api';
import { CenterHour, CreateCenterHourRequest, GetAllCenterHoursParams } from '@/types/center-hour.types';

class CenterHourService extends BaseService<CenterHour> {
  constructor() {
    super('center-hour');
  }

  // ✅ نفس طريقة SemesterService لجلب teacher_id
  private getTeacherId(): number | undefined {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.id;
  }

  // ✅ جلب كل المواعيد مع فلتر teacher_id تلقائي
  async getAll(params?: GetAllCenterHoursParams): Promise<any> {
    try {
      // ✅ جلب teacher_id بنفس الطريقة
      const teacherId = params?.teacher_id ?? this.getTeacherId();

      const requestBody: any = {
        filters: {},
        orderBy: 'date',
        orderByDirection: 'desc',
        perPage: params?.perPage || 10,
        page: params?.page || 1,
        paginate: true,
        delete: false,
      };

      // ✅ إضافة teacher_id للفلترات
      if (teacherId) {
        requestBody.filters.teacher_id = teacherId;
      }

      // ✅ فلتر search
      if (params?.search) {
        requestBody.search = params.search;
        requestBody.searchFields = ['title', 'note'];
      }

      // ✅ فلتر التاريخ
      if (params?.from_date) {
        requestBody.filters.date_from = params.from_date;
      }

      if (params?.to_date) {
        requestBody.filters.date_to = params.to_date;
      }

      // ✅ حذف الفلاتر الفارغة (زي SemesterService)
      Object.keys(requestBody.filters).forEach((key) => {
        const value = requestBody.filters[key];
        if (value === '' || value === null || value === undefined) {
          delete requestBody.filters[key];
        }
      });

      console.log('📤 Sending request:', requestBody);

      const response = await api.post(`/${this.endpoint}/index`, requestBody);
      return response.data;
    } catch (error) {
      console.error('Error fetching center hours:', error);
      throw error;
    }
  }

  // ✅ إنشاء موعد جديد (مع teacher_id تلقائي)
  async create(data: CreateCenterHourRequest): Promise<CenterHour> {
    try {
      // ✅ إضافة teacher_id تلقائياً
      const teacherId = this.getTeacherId();
      const finalData = {
        ...data,
        teacher_id: data.teacher_id || teacherId,
      };

      const response = await api.post(`/${this.endpoint}`, finalData);
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create center hour",
        variant: "destructive"
      });
      throw error;
    }
  }

  // ✅ تحديث موعد
  async update(id: number, data: Partial<CreateCenterHourRequest>): Promise<CenterHour> {
    try {
      const response = await api.patch(`/${this.endpoint}/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update center hour",
        variant: "destructive"
      });
      throw error;
    }
  }

  // ✅ حذف موعد
  async deleteHour(id: number): Promise<void> {
    try {
      await api.delete(`/${this.endpoint}/${id}`);
      toast({
        title: "Success",
        description: "Center hour deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete center hour",
        variant: "destructive"
      });
      throw error;
    }
  }

  // ✅ حذف جماعي
  async bulkDelete(ids: number[]): Promise<void> {
    try {
      await api.delete(`/${this.endpoint}/delete`, { data: { items: ids } });
      toast({
        title: "Success",
        description: `${ids.length} center hours deleted successfully`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete center hours",
        variant: "destructive"
      });
      throw error;
    }
  }

  // ✅ إحصائيات المواعيد
  async getStatistics(): Promise<any> {
    try {
      const teacherId = this.getTeacherId();
      const response = await api.get(`/${this.endpoint}/statistics`, {
        params: { teacher_id: teacherId }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
}

export const centerHourService = new CenterHourService();