// src/services/website.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export type SectionType = 'home' | 'about' | 'feature' | 'footer';

export interface ISectionService {
  getAll(type: SectionType, teacherId: number): Promise<any[]>;
  create(type: SectionType, data: any): Promise<any>;
  update(type: SectionType, id: number, data: any): Promise<any>;
  delete(type: SectionType, id: number): Promise<void>;
  toggleActive(type: SectionType, id: number): Promise<any>;
}

class WebsiteSectionService implements ISectionService {
  private getListEndpoint(type: SectionType): string {
    switch (type) {
      case 'home': return 'home/index';
      case 'about': return 'about/index';
      case 'feature': return 'feature/index';
      case 'footer': return 'footer/index';
      default: return `${type}/index`;
    }
  }

  private getCrudEndpoint(type: SectionType): string {
    switch (type) {
      case 'home': return 'home';
      case 'about': return 'about';
      case 'feature': return 'feature';
      case 'footer': return 'footer';
      default: return type;
    }
  }

  async getAll(type: SectionType, teacherId: number): Promise<any[]> {
    try {
      const response = await api.post(`/${this.getListEndpoint(type)}`, { filters: { teacher_id: teacherId } });
      return response.data?.data || [];
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
      return [];
    }
  }

  async create(type: SectionType, data: any): Promise<any> {
    try {
      const response = await api.post(`/${this.getCrudEndpoint(type)}`, data);
      toast({ title: "Success", description: `${type} created successfully` });
      return response.data?.data;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || `Failed to create ${type}`, variant: "destructive" });
      throw error;
    }
  }

  async update(type: SectionType, id: number, data: any): Promise<any> {
    try {
      const response = await api.patch(`/${this.getCrudEndpoint(type)}/${id}`, data);
      toast({ title: "Success", description: `${type} updated successfully` });
      return response.data?.data;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || `Failed to update ${type}`, variant: "destructive" });
      throw error;
    }
  }

  async delete(type: SectionType, id: number): Promise<void> {
    try {
      // Backend expects bulk delete payload: { items: [id] }
      // but route method might be POST (not DELETE) depending on the API.
      await api.delete(`/${this.getCrudEndpoint(type)}/delete`, {
        data: { items: [id] }
      });
      toast({ title: "Success", description: `${type} deleted successfully` });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || `Failed to delete ${type}`, variant: "destructive" });
      throw error;
    }
  }

  async toggleActive(type: SectionType, id: number): Promise<any> {
    try {
      const response = await api.patch(`/${this.getCrudEndpoint(type)}/${id}/toggle-active`);
      toast({ title: "Success", description: `${type} status changed` });
      return response.data?.data;
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || `Failed to toggle ${type}`, variant: "destructive" });
      throw error;
    }
  }
}

export const sectionService = new WebsiteSectionService();