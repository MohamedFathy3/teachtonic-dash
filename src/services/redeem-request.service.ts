// src/services/redeem-request.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/api';

export interface RedeemRequest {
  id: number;
  student_id: number;
  teacher_id: number;
  type: 'course' | 'semester' | 'lesson';
  course_id: number | null;
  semester_id: number | null;
  course_detail_id: number | null;
  price: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  student: {
    id: number;
    name: string;
    phone: string;
  };
}

class RedeemRequestService {
  private baseEndpoint = 'requests-redeem/teacher';

  // جلب كل الطلبات للمعلم الحالي
  async getTeacherRequests(): Promise<RedeemRequest[]> {
    try {
      const response = await api.get(this.baseEndpoint);
      return response.data;
    } catch (error) {
      console.error('API Error Details:', error);
      throw error;
    }
  }

  // قبول طلب
  async approveRequest(id: number): Promise<any> {
    const response = await api.post(`/request/teacher/${id}/status`, { status: 'approved' });
    return response.data;
  }

  // رفض طلب
  async rejectRequest(id: number): Promise<any> {
    const response = await api.post(`/request/teacher/${id}/status`, { status: 'rejected' });
    return response.data;
  }
}

export const redeemRequestService = new RedeemRequestService();