/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/about.service.ts

import { BaseService, PaginationParams } from './base.service';
import type { 
  About, 
  AboutFilters, 
  PaginatedResponse, 
  AboutFormData 
} from '@/types/about.types';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

class AboutService extends BaseService<About> {
  constructor() {
    super('about');
  }

  async getAllAbouts(
    filters?: AboutFilters, 
    perPage: number = 10,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<About>> {
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
        params.searchFields = ['name', 'name_ar', 'description', 'description_ar'];
      }

      const response = await this.getAll(params);
      return response;
    } catch (error: any) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch about sections",
        variant: "destructive",
      });
      throw error;
    }
  }

  async getDeletedAbouts(
    perPage: number = 10,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<About>> {
    return this.getAllAbouts({}, perPage, page, search, true);
  }

  async getAbout(id: number): Promise<About> {
    try {
      const about = await this.getById(id);
      return about;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch about section",
        variant: "destructive",
      });
      throw error;
    }
  }

  async createAbout(data: AboutFormData): Promise<About> {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        name_ar: data.name_ar,
        description_ar: data.description_ar,
        teacher_id: data.teacher_id,
        ...(data.image && { image: data.image }),
        active: data.active !== undefined ? data.active : true,
      };

      const response = await api.post('/about', payload);
      
      toast({
        title: "Success",
        description: "About section created successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create about section",
        variant: "destructive",
      });
      throw error;
    }
  }

  async updateAbout(id: number, data: Partial<AboutFormData>): Promise<About> {
    try {
      const payload: any = {};
      
      if (data.name !== undefined) payload.name = data.name;
      if (data.description !== undefined) payload.description = data.description;
      if (data.name_ar !== undefined) payload.name_ar = data.name_ar;
      if (data.description_ar !== undefined) payload.description_ar = data.description_ar;
      if (data.teacher_id !== undefined) payload.teacher_id = data.teacher_id;
      if (data.image !== undefined) payload.image = data.image;
      if (data.active !== undefined) payload.active = data.active;

      const response = await api.patch(`/about/${id}`, payload);
      
      toast({
        title: "Success",
        description: "About section updated successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update about section",
        variant: "destructive",
      });
      throw error;
    }
  }

  async deleteAbout(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({
        title: "Success",
        description: "About section moved to trash successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete about section",
        variant: "destructive",
      });
      throw error;
    }
  }

  async forceDeleteAbout(id: number): Promise<void> {
    try {
      await this.forceDelete(id);
      toast({
        title: "Success",
        description: "About section permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete about section",
        variant: "destructive",
      });
      throw error;
    }
  }

  async restoreAbout(id: number): Promise<About> {
    try {
      const about = await this.restore(id);
      toast({
        title: "Success",
        description: "About section restored successfully",
      });
      return about;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore about section",
        variant: "destructive",
      });
      throw error;
    }
  }

  async toggleAboutActive(id: number): Promise<{ message: string }> {
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
        description: error.response?.data?.message || "Failed to toggle about section status",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkDeleteAbouts(ids: number[]): Promise<void> {
    try {
      await this.bulkDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} about sections moved to trash successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete about sections",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkForceDeleteAbouts(ids: number[]): Promise<void> {
    try {
      await this.bulkForceDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} about sections permanently deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete about sections",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkRestoreAbouts(ids: number[]): Promise<void> {
    try {
      await this.bulkRestore(ids);
      toast({
        title: "Success",
        description: `${ids.length} about sections restored successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore about sections",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const aboutService = new AboutService();