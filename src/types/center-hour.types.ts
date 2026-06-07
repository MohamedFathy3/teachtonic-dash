// src/types/center-hour.types.ts

export interface CenterHour {
  id: number;
  title: string;
  date: string;
  hours: string;
  note: string;
  teacher_id: number;
  teacher_name?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCenterHourRequest {
  title: string;
  date: string;
  hours_start: string;
  hours_end: string;
  phone?: string;
  address?: string;
  note?: string;
  teacher_id: number;
}

export type UpdateCenterHourRequest = Partial<CreateCenterHourRequest>

export interface GetAllCenterHoursParams {
  page?: number;
  perPage?: number;
  search?: string;
  teacher_id?: number;
  from_date?: string;
  to_date?: string;
}