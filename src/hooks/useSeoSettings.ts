// src/hooks/useSeoSettings.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { seoService } from '@/services/seo.service';
import { SeoSettings, AboutItem } from '@/types/seo.types';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

export const useSeoSettings = () => {
  const { user } = useApp();
  const [aboutData, setAboutData] = useState<AboutItem | null>(null);
  const [settings, setSettings] = useState<SeoSettings | null>(null);
  const [seoId, setSeoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teacherId = user?.teacher_id || user?.id;

  // 🔹 جلب البيانات من /about/index ثم /seo/show/{id}
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ جلب About عشان ناخد الـ id
      const aboutResponse = await seoService.getAboutWithSeo({
        teacher_id: teacherId,
      });

      console.log('📦 About Response:', aboutResponse);

      if (aboutResponse.status === 200 && aboutResponse.data.length > 0) {
        const about = aboutResponse.data[0];
        setAboutData(about);
        
        // 2️⃣ استخراج الـ id من About
        const aboutId = about.id;
        setSeoId(aboutId);

        // 3️⃣ جلب SEO settings باستخدام /seo/show/{id}
        try {
          const seoData = await seoService.getSeoById(aboutId);
          setSettings(seoData);
          console.log('✅ SEO Data loaded:', seoData);
        } catch (seoError) {
          console.warn('⚠️ No SEO settings found, using empty data');
          setSettings({
            id: aboutId,
            site_name: '',
            site_title: '',
            site_description: '',
            site_url: '',
            site_keywords: '',
            default_language: '',
            favicon: '',
            favicon_svg: '',
            favicon_32: '',
            favicon_16: '',
            favicon_apple: '',
            favicon_android: '',
            favicon_ms: '',
            manifest_json: '',
            browserconfig_xml: '',
            seo_title: '',
            seo_description: '',
            seo_keywords: '',
            og_title: '',
            og_description: '',
            og_image: '',
            og_image_width: '',
            og_image_height: '',
            og_type: '',
            og_url: '',
            og_site_name: '',
            geo_region: '',
            geo_placename: '',
            geo_position: '',
            geo_icbm: '',
            canonical_url: '',
            language: '',
            twitter_card: '',
            facebook_app_id: '',
            facebook_page: '',
            twitter_username: '',
            instagram_url: '',
            youtube_url: '',
            linkedin_url: '',
            google_analytics_id: '',
            google_tag_manager_id: '',
            facebook_pixel_id: '',
            clarity_id: '',
          });
        }
      } else {
        setAboutData(null);
        setSettings(null);
        setSeoId(null);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
      console.error('❌ Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  // ⭐⭐⭐ حفظ كل البيانات (update seo)
  const saveAllSettings = useCallback(async (data: Partial<SeoSettings>) => {
    try {
      setSaving(true);
      setError(null);

      const idToUse = seoId || settings?.id || aboutData?.id;
      
      console.log('🆔 Saving with ID:', idToUse);
      console.log('📦 Data to save:', data);

      if (!idToUse) {
        toast.error('لا يوجد ID للتحديث');
        throw new Error('No ID found to update');
      }

      // ✅ ننظف البيانات
      const cleanData: Record<string, any> = {};
      Object.keys(data).forEach(key => {
        const value = data[key as keyof SeoSettings];
        cleanData[key] = value !== null && value !== undefined ? value : '';
      });

      // ✅ تحديث SEO settings
      const response = await seoService.updateSeo(idToUse, cleanData);
      setSettings(response);
      
      toast.success('تم حفظ جميع الإعدادات بنجاح ✅');
      return response;

    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
      toast.error('❌ فشل في حفظ الإعدادات');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [seoId, settings, aboutData]);

  // 🔹 تحديث حقل واحد (PATCH)
  const updateField = useCallback(async (key: keyof SeoSettings, value: any) => {
    const idToUse = seoId || settings?.id || aboutData?.id;
    
    if (!idToUse) {
      toast.error('لا يوجد ID للتحديث');
      throw new Error('No ID found to update');
    }

    try {
      setSaving(true);
      
      const cleanValue = value === null || value === undefined ? '' : value;
      
      const response = await seoService.update(idToUse, { [key]: cleanValue });
      setSettings(response);
      
      toast.success(`تم تحديث ${String(key)} بنجاح`);
      return response;
    } catch (err: any) {
      setError(err.message || `Failed to update ${String(key)}`);
      toast.error(`فشل في تحديث ${String(key)}`);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [seoId, settings, aboutData]);

  // 🔹 تحديث About
  const updateAbout = useCallback(async (data: Partial<any>) => {
    if (!aboutData?.id) {
      toast.error('لا يوجد About للتحديث');
      throw new Error('No About found to update');
    }

    try {
      setSaving(true);
      setError(null);

      const response = await seoService.updateAbout(aboutData.id, data);
      setAboutData(response);
      toast.success('تم تحديث About بنجاح');
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update About');
      toast.error('فشل في تحديث About');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [aboutData]);

  useEffect(() => {
    if (teacherId) {
      fetchData();
    }
  }, [fetchData, teacherId]);

  return {
    settings,
    aboutData,
    seoId,
    loading,
    saving,
    error,
    fetchData,
    saveAllSettings,
    updateField,
    updateAbout,
    hasSettings: !!settings,
    hasSeoId: !!seoId,
  };
};