/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/assistant-teacher.service.ts

import { BaseService, PaginationParams } from './base.service';
import type { 
  AssistantTeacher, 
  AssistantTeacherFilters, 
  PaginatedResponse, 
  AssistantTeacherFormData 
} from '@/types/assistant-teacher.types';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

/**
 * Single Responsibility Principle (SRP)
 * هذا الكلاس مسؤول فقط عن عمليات مساعد المدرس
 */
class AssistantTeacherService extends BaseService<AssistantTeacher> {
  constructor() {
    super('assistant-teacher'); // ⚠️ endpoint: assistant-teacher
  }

  async getAllAssistantTeachers(
    filters?: AssistantTeacherFilters, 
    perPage: number = 10,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<AssistantTeacher>> {
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
        params.searchFields = ['name', 'email', 'phone'];
      }

      const response = await this.getAll(params);
      return response;
    } catch (error: any) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch assistant teachers",
        variant: "destructive",
      });
      throw error;
    }
  }

  async getDeletedAssistantTeachers(
    perPage: number = 10,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<AssistantTeacher>> {
    return this.getAllAssistantTeachers({}, perPage, page, search, true);
  }

  async getAssistantTeacher(id: number): Promise<AssistantTeacher> {
    try {
      const assistant = await this.getById(id);
      return assistant;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch assistant teacher",
        variant: "destructive",
      });
      throw error;
    }
  }

  async createAssistantTeacher(data: AssistantTeacherFormData): Promise<AssistantTeacher> {
    try {
      // 🔥 API بيستقبل JSON مش FormData
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        teacher_id: data.teacher_id,
      };

      const response = await api.post('/assistant-teacher', payload);
      
      toast({
        title: "Success",
        description: "Assistant teacher created successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create assistant teacher",
        variant: "destructive",
      });
      throw error;
    }
  }

  async updateAssistantTeacher(id: number, data: Partial<AssistantTeacherFormData>): Promise<AssistantTeacher> {
    try {
      const payload: any = {};
      
      if (data.name !== undefined) payload.name = data.name;
      if (data.email !== undefined) payload.email = data.email;
      if (data.phone !== undefined) payload.phone = data.phone;
      if (data.password !== undefined && data.password.trim()) payload.password = data.password;
      if (data.teacher_id !== undefined) payload.teacher_id = data.teacher_id;

      const response = await api.patch(`/assistant-teacher/${id}`, payload);
      
      toast({
        title: "Success",
        description: "Assistant teacher updated successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update assistant teacher",
        variant: "destructive",
      });
      throw error;
    }
  }

  async deleteAssistantTeacher(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({
        title: "Success",
        description: "Assistant teacher moved to trash successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete assistant teacher",
        variant: "destructive",
      });
      throw error;
    }
  }

  async forceDeleteAssistantTeacher(id: number): Promise<void> {
    try {
      await this.forceDelete(id);
      toast({
        title: "Success",
        description: "Assistant teacher permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete assistant teacher",
        variant: "destructive",
      });
      throw error;
    }
  }

  async restoreAssistantTeacher(id: number): Promise<AssistantTeacher> {
    try {
      const assistant = await this.restore(id);
      toast({
        title: "Success",
        description: "Assistant teacher restored successfully",
      });
      return assistant;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore assistant teacher",
        variant: "destructive",
      });
      throw error;
    }
  }

  async toggleAssistantTeacherActive(id: number): Promise<{ message: string }> {
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
        description: error.response?.data?.message || "Failed to toggle assistant teacher status",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Bulk Operations
  async bulkDeleteAssistantTeachers(ids: number[]): Promise<void> {
    try {
      await this.bulkDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} assistant teachers moved to trash successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete assistant teachers",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkForceDeleteAssistantTeachers(ids: number[]): Promise<void> {
    try {
      await this.bulkForceDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} assistant teachers permanently deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete assistant teachers",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkRestoreAssistantTeachers(ids: number[]): Promise<void> {
    try {
      await this.bulkRestore(ids);
      toast({
        title: "Success",
        description: `${ids.length} assistant teachers restored successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore assistant teachers",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const assistantTeacherService = new AssistantTeacherService();