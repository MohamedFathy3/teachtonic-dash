// src/services/offer.service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from './base.service';
import api from '@/lib/api';
import { toast  } from "@/hooks/use-toast";

export interface Offer {
  id: number;
  title: string;
  description: string;
  offer_discount: string;
  start_date: string;
  end_date: string;
  active: boolean;
  type: 'offer' | 'banner';
  imageUrl: string;
  image: { id: number; fullUrl: string } | null;
  teacher_id: number;
  createdAt: string;
}

export interface CreateOfferRequest {
  title: string;
  description: string;
  type: 'offer' | 'banner';
  teacher_id: number;
  offer_discount?: string;
  start_date?: string;
  end_date?: string;
  image?: number | null;
}

export interface GetAllOffersParams {
  teacher_id?: number;
  type?: 'offer' | 'banner';
  active?: boolean;
  search?: string;
  perPage?: number;
  page?: number;
  from_date?: string;
  to_date?: string;
}

class OfferService extends BaseService<Offer> {
  constructor() {
    super('offer');
  }

  // جلب كل العروض
  async getAll(params?: GetAllOffersParams): Promise<any> {
    const filters: Record<string, any> = {};

    const addFilter = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== '') {
        filters[key] = value;
      }
    };

    // الفلاتر الأساسية
    addFilter('teacher_id', params?.teacher_id);
    addFilter('type', params?.type);
    
    if (params?.active !== undefined) {
      filters.active = params.active ? 1 : 0;
    }

    // بحث
    if (params?.search?.trim()) {
      filters.title = params.search.trim();
    }

    // نطاق التواريخ
    addFilter('from_date', params?.from_date);
    addFilter('to_date', params?.to_date);

    const requestBody = {
      filters,
      orderByDirection: 'desc',
      perPage: params?.perPage || 12,
      page: params?.page || 1,
      paginate: true,
      delete: false,
    };

    console.log('🎁 Offer Request:', requestBody);

    const response = await api.post(`/${this.endpoint}/index`, requestBody);

    console.log('🎁 Offer Response:', response.data);

    return response.data;
  }

  // جلب عرض واحد
  async getById(id: number): Promise<Offer> {
    const response = await api.get(`/${this.endpoint}/${id}`);
    return response.data.data;
  }

  // إنشاء عرض جديد
  async create(data: CreateOfferRequest): Promise<Offer> {
    const response = await api.post(`/${this.endpoint}`, data);
    toast.success('تم إضافة العرض بنجاح');
    return response.data.data;
  }

  // تحديث عرض
  async update(id: number, data: Partial<CreateOfferRequest>): Promise<Offer> {
    const response = await api.patch(`/${this.endpoint}/${id}`, data);
    toast.success('تم تحديث العرض بنجاح');
    return response.data.data;
  }

  // حذف عرض (ناعم)
  async deleteOffer(id: number): Promise<void> {
    await api.delete(`/${this.endpoint}/${id}`);
    toast.success('تم حذف العرض بنجاح');
  }

  // حذف جماعي
  async bulkDelete(ids: number[]): Promise<void> {
    await api.delete(`/${this.endpoint}/delete`, { data: { items: ids } });
    toast.success(`تم حذف ${ids.length} عرض بنجاح`);
  }

  // استعادة عرض
  async restore(id: number): Promise<Offer> {
    const response = await api.post(`/${this.endpoint}/restore`, { items: [id] });
    toast.success('تم استعادة العرض بنجاح');
    return response.data.data;
  }

  // حذف نهائي
  async forceDelete(id: number): Promise<void> {
    await api.delete(`/${this.endpoint}/forceDelete`, { data: { items: [id] } });
    toast.success('تم حذف العرض نهائياً');
  }

  // تبديل حالة التفعيل
  async toggleActive(id: number): Promise<any> {
    const response = await api.put(`/${this.endpoint}/${id}/active`);
    toast.success('تم تغيير حالة العرض');
    return response.data;
  }
}

export const offerService = new OfferService();