// src/types/payment-code.types.ts

export type PaymentCodeType = 'wallet' | 'course' | 'semester' | 'lesson';

export interface BasePaymentCode {
  id: number;
  code: string;
  type: PaymentCodeType;
  is_used: boolean;
  used_by?: number;
  used_at?: string;
  expires_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface WalletPaymentCode extends BasePaymentCode {
  type: 'wallet';
  amount: number;
}

export interface CoursePaymentCode extends BasePaymentCode {
  type: 'course';
  course_id: number;
  course_name?: string;
}

export interface SemesterPaymentCode extends BasePaymentCode {
  type: 'semester';
  semester_id: number;
  semester_name?: string;
}

export interface LessonPaymentCode extends BasePaymentCode {
  type: 'lesson';
  course_detail_id: number;
  lesson_name?: string;
}

export type PaymentCode = WalletPaymentCode | CoursePaymentCode | SemesterPaymentCode | LessonPaymentCode;

export interface GenerateCodesRequest {
  type: PaymentCodeType;
  count: number;
  amount?: number;        // for wallet
  course_id?: number;     // for course
  semester_id?: number;   // for semester
  course_detail_id?: number; // for lesson
}

export interface GetAllCodesParams {
  type?: PaymentCodeType;
  is_used?: boolean;
  page?: number;
  perPage?: number;
  search?: string;
}

export interface ValidateCodeRequest {
  code: string;
  type?: PaymentCodeType;
}

export interface ValidateCodeResponse {
  valid: boolean;
  data?: PaymentCode;
  message?: string;
}

export interface UseCodeRequest {
  code: string;
  item_id?: number; // for course/semester/lesson specific items
}