/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useSettings.ts

import { useState, useEffect, useCallback } from 'react';
import { settingsService } from '@/services/settings.service';
import type { MetaTag, SettingsGroup } from '@/types/settings.types';
import { toast } from '@/hooks/use-toast';

export const useSettings = () => {
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);
  const [groups, setGroups] = useState<SettingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // جلب الإعدادات
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingsService.getAllSettings();
      setMetaTags(response.meta_tags);
      setGroups(response.groups);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  // تحديث Meta Tag واحد
  const updateMetaTag = useCallback(async (key: string, value: string) => {
    setSaving(true);
    try {
      const updated = await settingsService.updateMetaTag(key, value);
      // تحديث القائمة المحلية
      setMetaTags(prev => 
        prev.map(tag => tag.key === key ? updated : tag)
      );
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update setting');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // تحديث مجموعة من الإعدادات
  const updateMultipleSettings = useCallback(async (data: Record<string, string>) => {
    setSaving(true);
    try {
      const response = await settingsService.updateSettings({ meta_tags: data });
      // تحديث القائمة المحلية
      const updatedTags = Object.entries(data).map(([key, value]) => ({
        key,
        value,
        // ... باقي البيانات
      }));
      
      setMetaTags(prev => 
        prev.map(tag => {
          const updated = updatedTags.find(u => u.key === tag.key);
          return updated ? { ...tag, value: updated.value } : tag;
        })
      );
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // إعادة تحميل الإعدادات
  const refresh = useCallback(() => {
    return fetchSettings();
  }, [fetchSettings]);

  // تحميل الإعدادات عند التهيئة
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    metaTags,
    groups,
    loading,
    saving,
    error,
    updateMetaTag,
    updateMultipleSettings,
    refresh,
  };
};