/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/subject.service.ts

import { BaseService, PaginationParams } from './base.service';
import type { Subject, SubjectFilters, PaginatedResponse, SubjectFormData } from '@/types/subject.types';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

class SubjectService extends BaseService<Subject> {
  constructor() {
    super('subject');
  }

  async getAllSubjects(
    filters?: SubjectFilters,
    perPage: number = 10,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<Subject>> {
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
        description: error.response?.data?.message || "Failed to fetch subjects",
        variant: "destructive",
      });
      throw error;
    }
  }

  async getDeletedSubjects(
    perPage: number = 10,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Subject>> {
    return this.getAllSubjects({}, perPage, page, search, true);
  }

  async getSubject(id: number): Promise<Subject> {
    try {
      const subject = await this.getById(id);
      return subject;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch subject",
        variant: "destructive",
      });
      throw error;
    }
  }

  async createSubject(data: SubjectFormData): Promise<Subject> {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('name_ar', data.name_ar);
      formData.append('stage_id', data.stage_id.toString());
      formData.append('position', data.position.toString());
      formData.append('active', data.active ? '1' : '0');
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await api.post('/subject', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast({
        title: "Success",
        description: "Subject created successfully",
      });

      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create subject",
        variant: "destructive",
      });
      throw error;
    }
  }


  async updateSubject(id: number, data: Partial<SubjectFormData>): Promise<Subject> {
    try {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.name_ar) formData.append('name_ar', data.name_ar);
      if (data.stage_id) formData.append('stage_id', data.stage_id.toString());
      if (data.position) formData.append('position', data.position.toString());
      if (data.active !== undefined) formData.append('active', data.active ? '1' : '0');
      if (data.image) formData.append('image', data.image);
      formData.append('_method', 'PATCH');

      const response = await api.post(`/subject/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast({
        title: "Success",
        description: "Subject updated successfully",
      });

      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update subject",
        variant: "destructive",
      });
      throw error;
    }
  }

  async deleteSubject(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({
        title: "Success",
        description: "Subject moved to trash successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete subject",
        variant: "destructive",
      });
      throw error;
    }
  }

  async forceDeleteSubject(id: number): Promise<void> {
    try {
      await this.forceDelete(id);
      toast({
        title: "Success",
        description: "Subject permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete subject",
        variant: "destructive",
      });
      throw error;
    }
  }

  async restoreSubject(id: number): Promise<Subject> {
    try {
      const subject = await this.restore(id);
      toast({
        title: "Success",
        description: "Subject restored successfully",
      });
      return subject;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore subject",
        variant: "destructive",
      });
      throw error;
    }
  }

  async toggleSubjectActive(id: number): Promise<{ message: string }> {
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
        description: error.response?.data?.message || "Failed to toggle subject status",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Bulk operations
  async bulkDeleteSubjects(ids: number[]): Promise<void> {
    try {
      await this.bulkDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} subjects moved to trash successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete subjects",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkForceDeleteSubjects(ids: number[]): Promise<void> {
    try {
      await this.bulkForceDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} subjects permanently deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete subjects",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkRestoreSubjects(ids: number[]): Promise<void> {
    try {
      await this.bulkRestore(ids);
      toast({
        title: "Success",
        description: `${ids.length} subjects restored successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore subjects",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const subjectService = new SubjectService();