// src/services/stage.service.ts

import { BaseService, PaginationParams } from './base.service';
import type { 
  Stage, 
  StageFilters, 
  PaginatedResponse, 
  StageFormData 
} from '@/types/stage.types';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

class StageService extends BaseService<Stage> {
  constructor() {
    super('stage');
  }

  /**
   * ✅ جلب المراحل مع دعم الفلاتر المتقدمة
   */
  async getStages(
    filters?: StageFilters,
    perPage: number = 10,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<Stage>> {
    try {
      const params: PaginationParams = {
        filters: filters || {},
        orderBy: 'id',
        orderByDirection: 'desc',
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

  /**
   * ✅ جلب المراحل المحذوفة فقط
   */
  async getDeletedStages(
    perPage: number = 10,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Stage>> {
    return this.getStages(
      { trashed: 'only' },
      perPage,
      page,
      search,
      true
    );
  }

  /**
   * ✅ جلب مرحلة مع المعلم المميز
   */
  async getStageWithTeacherId(id: number): Promise<Stage> {
    try {
      const response = await api.get(`/stage/${id}/with-teacher`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching stage with teacher:', error);
      throw error;
    }
  }

  /**
   * ✅ جلب مرحلة محددة
   */
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

  /**
   * ✅ إنشاء مرحلة جديدة
   */
  async createStage(data: StageFormData): Promise<Stage> {
    try {
      const payload = {
        name: data.name,
        name_ar: data.name_ar,
        active: data.active !== undefined ? data.active : true,
        distinctive_mark_for_teacher_id: data.distinctive_mark_for_teacher_id || null,
      };

      const response = await api.post('/stage', payload);
      
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

  /**
   * ✅ تحديث مرحلة
   */
  async updateStage(id: number, data: Partial<StageFormData>): Promise<Stage> {
    try {
      const payload: any = {};
      
      if (data.name !== undefined) payload.name = data.name;
      if (data.name_ar !== undefined) payload.name_ar = data.name_ar;
      if (data.active !== undefined) payload.active = data.active;
      if (data.distinctive_mark_for_teacher_id !== undefined) {
        payload.distinctive_mark_for_teacher_id = data.distinctive_mark_for_teacher_id;
      }

      const response = await api.patch(`/stage/${id}`, payload);
      
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

  /**
   * ✅ حذف مرحلة (نقل إلى سلة المحذوفات)
   */
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

  /**
   * ✅ حذف نهائي لمرحلة
   */
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

  /**
   * ✅ استعادة مرحلة محذوفة
   */
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

  /**
   * ✅ تبديل حالة المرحلة (نشط/غير نشط)
   */
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

  // ✅ Bulk Operations
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

  /**
   * ✅ جلب المراحل النشطة فقط
   */
  async getActiveStages(
    perPage: number = 10,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Stage>> {
    return this.getStages(
      { active: true },
      perPage,
      page,
      search,
      false
    );
  }

  /**
   * ✅ جلب المراحل حسب المعلم المميز
   */
  async getStagesByTeacher(
    teacherId: number,
    perPage: number = 10,
    page: number = 1
  ): Promise<PaginatedResponse<Stage>> {
    return this.getStages(
      { distinctive_mark_for_teacher_id: teacherId },
      perPage,
      page
    );
  }

  /**
   * ✅ جلب المراحل بدون معلم مميز
   */
  async getStagesWithoutTeacher(
    perPage: number = 10,
    page: number = 1
  ): Promise<PaginatedResponse<Stage>> {
    return this.getStages(
      { distinctive_mark_for_teacher_id: null },
      perPage,
      page
    );
  }
}

export const stageService = new StageService();