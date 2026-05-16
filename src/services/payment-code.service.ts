/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/payment-code.service.ts

import { BaseService } from './base.service';
import api from '@/lib/api';

// Types
export interface PaymentCode {
  id: number;
  code: string;
  type: 'wallet' | 'course' | 'semester' | 'lesson';
  is_used: boolean;
  amount?: string;
  course_id?: number | null;
  semester_id?: number | null;
  course_detail_id?: number | null;
  teacher_id?: number;
  student_id?: number | null;
  used_at?: string | null;
  expires_at?: string | null;
  active?: number;
  created_at: string;
  updated_at?: string;
}

export interface GenerateCodesRequest {
  type: 'wallet' | 'course' | 'semester' | 'lesson';
  count: number;
  amount?: number;        // for wallet
  course_id?: number;     // for course
  semester_id?: number;   // for semester
  course_detail_id?: number; // for lesson
}

export interface GetAllCodesParams {
  type?: string;
  is_used?: boolean;
  perPage?: number;
  page?: number;
  search?: string;
}

class PaymentCodeService extends BaseService<PaymentCode> {
  constructor() {
    super('payment-code');
  }

  // جلب كل الكودز - مع الشكل الجديد للـ API
async getAllCodes(params?: GetAllCodesParams): Promise<any> {
  const requestBody: any = {
    filters: {},
    perPage: params?.perPage || 10,
    page: params?.page || 1,
  };
  if (params?.type) requestBody.filters.type = params.type;
  if (params?.is_used !== undefined) requestBody.filters.is_used = params.is_used;
  if (params?.search) {
    requestBody.search = params.search;
    requestBody.searchFields = ['code'];
  }

  const response = await api.post(`/${this.endpoint}/index`, requestBody);
  
  // إعادة الهيكل الأصلي كما هو من API
  return response.data; // { status, data: { wallet, courses, semesters, lessons }, message }
}

  // توليد كودز جديدة
  async generateCodes(data: GenerateCodesRequest): Promise<any> {
    const response = await api.post(`/generate-codes`, data);
    return response.data;
  }

  // مسح كودز (بالتحديد الـ ids)
  async deleteCodes(ids: number[]): Promise<any> {
    const response = await api.delete(`/${this.endpoint}/delete`, { 
      data: { items: ids } 
    });
    return response.data;
  }

  // إحصائيات الكودات
  async getStatistics(): Promise<any> {
    const response = await this.getAllCodes({ perPage: 1000 });
    const allCodes = response.data;
    
    const total_codes = allCodes.length;
    const used_codes = allCodes.filter((c: PaymentCode) => c.is_used === 1 || c.is_used === true).length;
    const unused_codes = total_codes - used_codes;
    
    // حساب حسب النوع
    const by_type = {
      wallet: { total: 0, used: 0, unused: 0 },
      course: { total: 0, used: 0, unused: 0 },
      semester: { total: 0, used: 0, unused: 0 },
      lesson: { total: 0, used: 0, unused: 0 },
    };
    
    allCodes.forEach((code: PaymentCode) => {
      const type = code.type;
      const isUsed = code.is_used === 1 || code.is_used === true;
      
      if (by_type[type as keyof typeof by_type]) {
        by_type[type as keyof typeof by_type].total++;
        if (isUsed) {
          by_type[type as keyof typeof by_type].used++;
        } else {
          by_type[type as keyof typeof by_type].unused++;
        }
      }
    });
    
    return {
      total_codes,
      used_codes,
      unused_codes,
      by_type,
    };
  }
}

export const paymentCodeService = new PaymentCodeService();