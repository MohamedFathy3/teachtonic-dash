/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/footer.service.ts

import { BaseService, PaginationParams } from './base.service';
import type { 
  Footer, 
  FooterFilters, 
  PaginatedResponse, 
  FooterFormData 
} from '@/types/footer.types';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

class FooterService extends BaseService<Footer> {
  constructor() {
    super('footer');
  }

  async getAllFooters(
    filters?: FooterFilters, 
    perPage: number = 10,
    page: number = 1,
    search?: string,
    showDeleted: boolean = false
  ): Promise<PaginatedResponse<Footer>> {
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
        description: error.response?.data?.message || "Failed to fetch footer sections",
        variant: "destructive",
      });
      throw error;
    }
  }

  async getDeletedFooters(
    perPage: number = 10,
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Footer>> {
    return this.getAllFooters({}, perPage, page, search, true);
  }

  async getFooter(id: number): Promise<Footer> {
    try {
      const footer = await this.getById(id);
      return footer;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch footer section",
        variant: "destructive",
      });
      throw error;
    }
  }

  async createFooter(data: FooterFormData): Promise<Footer> {
    try {
      const payload = {
        name: data.name,
        name_ar: data.name_ar,
        description: data.description,
        description_ar: data.description_ar,
        facebook_link: data.facebook_link || null,
        youtube_link: data.youtube_link || null,
        instagram_link: data.instagram_link || null,
        tiktok_link: data.tiktok_link || null,
        whatsapp_link: data.whatsapp_link || null,
        teacher_id: data.teacher_id,
        active: data.active !== undefined ? data.active : true,
      };

      const response = await api.post('/footer', payload);
      
      toast({
        title: "Success",
        description: "Footer section created successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create footer section",
        variant: "destructive",
      });
      throw error;
    }
  }

  async updateFooter(id: number, data: Partial<FooterFormData>): Promise<Footer> {
    try {
      const payload: any = {};
      
      if (data.name !== undefined) payload.name = data.name;
      if (data.name_ar !== undefined) payload.name_ar = data.name_ar;
      if (data.description !== undefined) payload.description = data.description;
      if (data.description_ar !== undefined) payload.description_ar = data.description_ar;
      if (data.facebook_link !== undefined) payload.facebook_link = data.facebook_link || null;
      if (data.youtube_link !== undefined) payload.youtube_link = data.youtube_link || null;
      if (data.instagram_link !== undefined) payload.instagram_link = data.instagram_link || null;
      if (data.tiktok_link !== undefined) payload.tiktok_link = data.tiktok_link || null;
      if (data.whatsapp_link !== undefined) payload.whatsapp_link = data.whatsapp_link || null;
      if (data.teacher_id !== undefined) payload.teacher_id = data.teacher_id;
      if (data.active !== undefined) payload.active = data.active;

      const response = await api.patch(`/footer/${id}`, payload);
      
      toast({
        title: "Success",
        description: "Footer section updated successfully",
      });
      
      return response.data.data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update footer section",
        variant: "destructive",
      });
      throw error;
    }
  }

  async deleteFooter(id: number): Promise<void> {
    try {
      await this.delete(id);
      toast({
        title: "Success",
        description: "Footer section moved to trash successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete footer section",
        variant: "destructive",
      });
      throw error;
    }
  }

  async forceDeleteFooter(id: number): Promise<void> {
    try {
      await this.forceDelete(id);
      toast({
        title: "Success",
        description: "Footer section permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete footer section",
        variant: "destructive",
      });
      throw error;
    }
  }

  async restoreFooter(id: number): Promise<Footer> {
    try {
      const footer = await this.restore(id);
      toast({
        title: "Success",
        description: "Footer section restored successfully",
      });
      return footer;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore footer section",
        variant: "destructive",
      });
      throw error;
    }
  }

  async toggleFooterActive(id: number): Promise<{ message: string }> {
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
        description: error.response?.data?.message || "Failed to toggle footer section status",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkDeleteFooters(ids: number[]): Promise<void> {
    try {
      await this.bulkDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} footer sections moved to trash successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete footer sections",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkForceDeleteFooters(ids: number[]): Promise<void> {
    try {
      await this.bulkForceDelete(ids);
      toast({
        title: "Success",
        description: `${ids.length} footer sections permanently deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to force delete footer sections",
        variant: "destructive",
      });
      throw error;
    }
  }

  async bulkRestoreFooters(ids: number[]): Promise<void> {
    try {
      await this.bulkRestore(ids);
      toast({
        title: "Success",
        description: `${ids.length} footer sections restored successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restore footer sections",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const footerService = new FooterService();