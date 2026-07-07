/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/stage.service.ts

import { BaseService, PaginationParams } from './base.service';
import type { Stage, StageFilters, PaginatedResponse, StageFormData } from '@/types/stage.types';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { teacherService } from './teacher.service';

class StageService extends BaseService<Stage> {
  constructor() {
    super('stage');
  }

  async getAllStages(
    filters?: StageFilters, 
    perPage: number = 10,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<Stage>> {
    try {
      const params: PaginationParams = {
        filters: filters || {},
        orderBy: 'position',
        orderByDirection: 'asc',
        perPage,
        page,
        paginate: true,
        delete: showDeleted,
      };

      if (search && search.trim()) {
        params.search = search.trim();
        params.searchFields = ['name', 'name_ar'];
      }

      const response = await this.getAll(params);
      return response;
    } catch (error: any) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch stages",
        variant: "destructive",
      });
      throw error;
    }
  }

  async getDeletedStages(
    perPage: number = 10,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Stage>> {
    return this.getAllStages({}, perPage, page, search, true);
  }

  async getStage(id: number): Promise<Stage> {
    try {
      const response = await api.get(`/stage/${id}`);
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch stage",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ✅ دالة جديدة: تجلب المرحلة مع ID المعلم
  async getStageWithTeacherId(id: number): Promise<any> {
    try {
      const stage = await this.getStage(id);
      
      // ✅ إذا كان هناك معلم مميز، نجلب ID المعلم
      if (stage.distinctiveMarkForTeacherName) {
        try {
          // جلب جميع المدرسين
          const response = await teacherService.getAllTeachers(
            { active: true },
            100,
            1,
            '',
            false
          );
          
          // البحث عن المعلم بالاسم
          const teacher = response.data.find(
            (t: any) => t.name === stage.distinctiveMarkForTeacherName
          );
          
          if (teacher) {
            // ✅ إضافة ID المعلم إلى الـ stage
            (stage as any).distinctive_mark_for_teacher_id = teacher.id;
          }
        } catch (error) {
          console.error('Error fetching teacher:', error);
        }
      }
      
      return stage;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch stage with teacher",
        variant: "destructive",
      });
      throw error;
    }
  }

  async createStage(data: StageFormData): Promise<Stage> {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('name_ar', data.name_ar);
      formData.append('position', data.position.toString());
      formData.append('active', data.active ? '1' : '0');
      
      if (data.distinctive_mark_for_teacher_id) {
        formData.append('distinctive_mark_for_teacher_id', data.distinctive_mark_for_teacher_id.toString());
      }
      
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await api.post('/stage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast({
        title: "Success",
        description: "Stage created successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create stage",
        variant: "destructive",
      });
      throw error;
    }
  }

  async updateStage(id: number, data: Partial<StageFormData>): Promise<Stage> {
    try {
      const formData = new FormData();
      
      if (data.name) formData.append('name', data.name);
      if (data.name_ar) formData.append('name_ar', data.name_ar);
      if (data.position !== undefined) formData.append('position', data.position.toString());
      if (data.active !== undefined) formData.append('active', data.active ? '1' : '0');
      
      if (data.distinctive_mark_for_teacher_id !== undefined) {
        if (data.distinctive_mark_for_teacher_id) {
          formData.append('distinctive_mark_for_teacher_id', data.distinctive_mark_for_teacher_id.toString());
        } else {
          formData.append('distinctive_mark_for_teacher_id', '');
        }
      }
      
      if (data.image) {
        formData.append('image', data.image);
      }
      
      formData.append('_method', 'PATCH');

      const response = await api.post(`/stage/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast({
        title: "Success",
        description: "Stage updated successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update stage",
        variant: "destructive",
      });
      throw error;
    }
  }

  async deleteStage(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({
        title: "Success",
        description: "Stage moved to trash successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete stage",
        variant: "destructive",
      });
      throw error;
    }
  }

  async forceDeleteStage(id: number): Promise<void> {
    try {
      await this.forceDelete(id);
      toast({
        title: "Success",
        description: "Stage permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete stage",
        variant: "destructive",
      });
      throw error;
    }
  }

  async restoreStage(id: number): Promise<Stage> {
    try {
      const stage = await this.restore(id);
      toast({
        title: "Success",
        description: "Stage restored successfully",
      });
      return stage;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore stage",
        variant: "destructive",
      });
      throw error;
    }
  }

  async toggleStageActive(id: number): Promise<{ message: string }> {
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
        description: error.response?.data?.message || "Failed to toggle stage status",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkDeleteStages(ids: number[]): Promise<void> {
    try {
      await this.bulkDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} stages moved to trash successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete stages",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkForceDeleteStages(ids: number[]): Promise<void> {
    try {
      await this.bulkForceDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} stages permanently deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete stages",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkRestoreStages(ids: number[]): Promise<void> {
    try {
      await this.bulkRestore(ids);
      toast({
        title: "Success",
        description: `${ids.length} stages restored successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore stages",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const stageService = new StageService();