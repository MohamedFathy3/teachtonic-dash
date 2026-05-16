/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/teacher.service.ts

import { BaseService, PaginationParams } from './base.service';
import type { 
  Teacher, 
  TeacherFilters, 
  PaginatedResponse, 
  TeacherFormData,
} from '@/types/teacher.types';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

/**
 * 🔹 Single Responsibility Principle (SRP)
 * هذا الكلاس مسؤول فقط عن عمليات Teacher
 */
class TeacherService extends BaseService<Teacher> {
  constructor() {
    super('teacher'); // ⚠️ تأكد: 'teacher' وليس 'teachers'
  }

  /**
   * 🔹 Open/Closed Principle (OCP)
   * مفتوح للتوسعة عن طريق الـ params، مغلق للتعديل
   */
  async getAllTeachers(
    filters?: TeacherFilters, 
    perPage: number = 10,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<Teacher>> {
    try {
      const params: PaginationParams = {
        filters: filters || {},
        orderBy: 'id',
        orderByDirection: 'asc',
        perPage,
        page,
        paginate: true,
        delete: showDeleted,
      };

      if (search && search.trim()) {
        params.search = search.trim();
        params.searchFields = ['name', 'email', 'phone', 'sub_domain'];
      }

      const response = await this.getAll(params);
      return response;
    } catch (error: any) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch teachers",
        variant: "destructive",
      });
      throw error;
    }
  }

  async getDeletedTeachers(
    perPage: number = 10,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Teacher>> {
    return this.getAllTeachers({}, perPage, page, search, true);
  }


async getTeacher(id: number): Promise<Teacher> {
  try {
    const response = await api.get(`/teacher/${id}`);
    // الـ API بيرجع data.data
    return response.data.data;
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to fetch teacher",
      variant: "destructive",
    });
    throw error;
  }
}

  /**
   * 🔹 Liskov Substitution Principle (LSP)
   * الـ TeacherFormData يحل محل Partial<Teacher> بدون مشاكل
   */
  async createTeacher(data: TeacherFormData): Promise<Teacher> {
    try {
      // 🔥 Teacher API متوقع JSON مش FormData (لأن مفيش ملفات)
      const payload = {
        name: data.name,
        email: data.email,
        sub_domain: data.sub_domain,
        phone: data.phone,
        password: data.password,
        stage: data.stage, // [{ stage_id, image }]
        subject: data.subject, // [{ subject_id }]
        ...(data.image && { image: data.image }) // media ID
      };

      const response = await api.post('/teacher', payload);
      
      toast({
        title: "Success",
        description: "Teacher created successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create teacher",
        variant: "destructive",
      });
      throw error;
    }
  }

  async updateTeacher(id: number, data: Partial<TeacherFormData>): Promise<Teacher> {
    try {
      const payload: any = {};
      
      if (data.name !== undefined) payload.name = data.name;
      if (data.email !== undefined) payload.email = data.email;
      if (data.sub_domain !== undefined) payload.sub_domain = data.sub_domain;
      if (data.phone !== undefined) payload.phone = data.phone;
      if (data.password !== undefined && data.password.trim()) payload.password = data.password;
      if (data.stage !== undefined) payload.stage = data.stage;
      if (data.subject !== undefined) payload.subject = data.subject;
      if (data.image !== undefined) payload.image = data.image;

      const response = await api.patch(`/teacher/${id}`, payload);
      
      toast({
        title: "Success",
        description: "Teacher updated successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update teacher",
        variant: "destructive",
      });
      throw error;
    }
  }

  async deleteTeacher(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({
        title: "Success",
        description: "Teacher moved to trash successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete teacher",
        variant: "destructive",
      });
      throw error;
    }
  }

  async forceDeleteTeacher(id: number): Promise<void> {
    try {
      await this.forceDelete(id);
      toast({
        title: "Success",
        description: "Teacher permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete teacher",
        variant: "destructive",
      });
      throw error;
    }
  }

  async restoreTeacher(id: number): Promise<Teacher> {
    try {
      const teacher = await this.restore(id);
      toast({
        title: "Success",
        description: "Teacher restored successfully",
      });
      return teacher;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore teacher",
        variant: "destructive",
      });
      throw error;
    }
  }

  async toggleTeacherActive(id: number): Promise<{ message: string }> {
    try {
      const result = await this.toggleActive(id);
      toast({
        title: "Success",
        description: result.message || "Status changed successfully",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to toggle teacher status",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Bulk Operations
  async bulkDeleteTeachers(ids: number[]): Promise<void> {
    try {
      await this.bulkDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} teachers moved to trash successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete teachers",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkForceDeleteTeachers(ids: number[]): Promise<void> {
    try {
      await this.bulkForceDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} teachers permanently deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete teachers",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkRestoreTeachers(ids: number[]): Promise<void> {
    try {
      await this.bulkRestore(ids);
      toast({
        title: "Success",
        description: `${ids.length} teachers restored successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore teachers",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const teacherService = new TeacherService();