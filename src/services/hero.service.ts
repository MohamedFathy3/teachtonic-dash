/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/hero.service.ts

import { BaseService, PaginationParams } from './base.service';
import type { 
  Hero, 
  HeroFilters, 
  PaginatedResponse, 
  HeroFormData 
} from '@/types/hero.types';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

class HeroService extends BaseService<Hero> {
  constructor() {
    super('home'); // endpoint: home
  }

  async getAllHeroes(
    filters?: HeroFilters, 
    perPage: number = 10,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<Hero>> {
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
        params.searchFields = ['title', 'title_ar', 'sub_title', 'sub_title_ar'];
      }

      const response = await this.getAll(params);
      return response;
    } catch (error: any) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch heroes",
        variant: "destructive",
      });
      throw error;
    }
  }

  async getDeletedHeroes(
    perPage: number = 10,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Hero>> {
    return this.getAllHeroes({}, perPage, page, search, true);
  }

  async getHero(id: number): Promise<Hero> {
    try {
      const hero = await this.getById(id);
      return hero;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch hero",
        variant: "destructive",
      });
      throw error;
    }
  }

  async createHero(data: HeroFormData): Promise<Hero> {
    try {
      const payload = {
        title: data.title,
        sub_title: data.sub_title,
        description: data.description,
        title_ar: data.title_ar,
        sub_title_ar: data.sub_title_ar,
        description_ar: data.description_ar,
        teacher_id: data.teacher_id,
        ...(data.image && { image: data.image }),
        active: data.active !== undefined ? data.active : true,
      };

      const response = await api.post('/home', payload);
      
      toast({
        title: "Success",
        description: "Hero section created successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create hero",
        variant: "destructive",
      });
      throw error;
    }
  }

  async updateHero(id: number, data: Partial<HeroFormData>): Promise<Hero> {
    try {
      const payload: any = {};
      
      if (data.title !== undefined) payload.title = data.title;
      if (data.sub_title !== undefined) payload.sub_title = data.sub_title;
      if (data.description !== undefined) payload.description = data.description;
      if (data.title_ar !== undefined) payload.title_ar = data.title_ar;
      if (data.sub_title_ar !== undefined) payload.sub_title_ar = data.sub_title_ar;
      if (data.description_ar !== undefined) payload.description_ar = data.description_ar;
      if (data.teacher_id !== undefined) payload.teacher_id = data.teacher_id;
      if (data.image !== undefined) payload.image = data.image;
      if (data.active !== undefined) payload.active = data.active;

      const response = await api.patch(`/home/${id}`, payload);
      
      toast({
        title: "Success",
        description: "Hero section updated successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update hero",
        variant: "destructive",
      });
      throw error;
    }
  }

  async deleteHero(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({
        title: "Success",
        description: "Hero section moved to trash successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete hero",
        variant: "destructive",
      });
      throw error;
    }
  }

  async forceDeleteHero(id: number): Promise<void> {
    try {
      await this.forceDelete(id);
      toast({
        title: "Success",
        description: "Hero section permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete hero",
        variant: "destructive",
      });
      throw error;
    }
  }

  async restoreHero(id: number): Promise<Hero> {
    try {
      const hero = await this.restore(id);
      toast({
        title: "Success",
        description: "Hero section restored successfully",
      });
      return hero;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore hero",
        variant: "destructive",
      });
      throw error;
    }
  }

  async toggleHeroActive(id: number): Promise<{ message: string }> {
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
        description: error.response?.data?.message || "Failed to toggle hero status",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Bulk operations
  async bulkDeleteHeroes(ids: number[]): Promise<void> {
    try {
      await this.bulkDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} heroes moved to trash successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete heroes",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkForceDeleteHeroes(ids: number[]): Promise<void> {
    try {
      await this.bulkForceDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} heroes permanently deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete heroes",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkRestoreHeroes(ids: number[]): Promise<void> {
    try {
      await this.bulkRestore(ids);
      toast({
        title: "Success",
        description: `${ids.length} heroes restored successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore heroes",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const heroService = new HeroService();