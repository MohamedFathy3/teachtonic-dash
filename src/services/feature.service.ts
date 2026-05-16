/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/feature.service.ts

import { BaseService, PaginationParams } from './base.service';
import type { 
  Feature, 
  FeatureFilters, 
  PaginatedResponse, 
  FeatureFormData 
} from '@/types/feature.types';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

class FeatureService extends BaseService<Feature> {
  constructor() {
    super('feature');
  }

  async getAllFeatures(
    filters?: FeatureFilters, 
    perPage: number = 10,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<Feature>> {
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
        description: error.response?.data?.message || "Failed to fetch features",
        variant: "destructive",
      });
      throw error;
    }
  }

  async getDeletedFeatures(
    perPage: number = 10,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Feature>> {
    return this.getAllFeatures({}, perPage, page, search, true);
  }

  async getFeature(id: number): Promise<Feature> {
    try {
      const feature = await this.getById(id);
      return feature;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch feature",
        variant: "destructive",
      });
      throw error;
    }
  }

  async createFeature(data: FeatureFormData): Promise<Feature> {
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

      const response = await api.post('/feature', payload);
      
      toast({
        title: "Success",
        description: "Feature created successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create feature",
        variant: "destructive",
      });
      throw error;
    }
  }

  async updateFeature(id: number, data: Partial<FeatureFormData>): Promise<Feature> {
    try {
      const payload: any = {};
      
      if (data.name !== undefined) payload.name = data.name;
      if (data.description !== undefined) payload.description = data.description;
      if (data.name_ar !== undefined) payload.name_ar = data.name_ar;
      if (data.description_ar !== undefined) payload.description_ar = data.description_ar;
      if (data.teacher_id !== undefined) payload.teacher_id = data.teacher_id;
      if (data.image !== undefined) payload.image = data.image;
      if (data.active !== undefined) payload.active = data.active;

      const response = await api.patch(`/feature/${id}`, payload);
      
      toast({
        title: "Success",
        description: "Feature updated successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update feature",
        variant: "destructive",
      });
      throw error;
    }
  }

  async deleteFeature(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({
        title: "Success",
        description: "Feature moved to trash successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete feature",
        variant: "destructive",
      });
      throw error;
    }
  }

  async forceDeleteFeature(id: number): Promise<void> {
    try {
      await this.forceDelete(id);
      toast({
        title: "Success",
        description: "Feature permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete feature",
        variant: "destructive",
      });
      throw error;
    }
  }

  async restoreFeature(id: number): Promise<Feature> {
    try {
      const feature = await this.restore(id);
      toast({
        title: "Success",
        description: "Feature restored successfully",
      });
      return feature;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore feature",
        variant: "destructive",
      });
      throw error;
    }
  }

  async toggleFeatureActive(id: number): Promise<{ message: string }> {
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
        description: error.response?.data?.message || "Failed to toggle feature status",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkDeleteFeatures(ids: number[]): Promise<void> {
    try {
      await this.bulkDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} features moved to trash successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete features",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkForceDeleteFeatures(ids: number[]): Promise<void> {
    try {
      await this.bulkForceDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} features permanently deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete features",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkRestoreFeatures(ids: number[]): Promise<void> {
    try {
      await this.bulkRestore(ids);
      toast({
        title: "Success",
        description: `${ids.length} features restored successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore features",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const featureService = new FeatureService();