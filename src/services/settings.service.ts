/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/settings.service.ts

import api from '@/lib/api';
import type { MetaTag, SettingsResponse, UpdateSettingsRequest } from '@/types/settings.types';
import { toast } from '@/hooks/use-toast';

class SettingsService {
  private baseUrl = '/settings';

  // جلب كل الإعدادات
  async getAllSettings(): Promise<SettingsResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/meta-tags`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load settings',
        variant: 'destructive',
      });
      throw error;
    }
  }

  // تحديث إعدادات معينة
  async updateSettings(data: UpdateSettingsRequest): Promise<{ message: string }> {
    try {
      const response = await api.patch(`${this.baseUrl}/meta-tags`, data);
      toast({
        title: 'Success',
        description: response.data.message || 'Settings updated successfully',
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update settings',
        variant: 'destructive',
      });
      throw error;
    }
  }

  // تحديث Meta Tag واحد
  async updateMetaTag(key: string, value: string): Promise<MetaTag> {
    try {
      const response = await api.patch(`${this.baseUrl}/meta-tags/${key}`, { value });
      toast({
        title: 'Success',
        description: 'Meta tag updated successfully',
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update meta tag:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update meta tag',
        variant: 'destructive',
      });
      throw error;
    }
  }
}

export const settingsService = new SettingsService();