// src/hooks/useFavicon.ts

import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import api from '@/lib/api';

export const useFavicon = () => {
  const { role, instructorData } = useApp();

  useEffect(() => {
    const updateFavicon = async () => {
      try {
        // إذا كان المستخدم معلم
        if (role === 'teacher' || role === 'instructor') {
          // إذا كانت البيانات موجودة بالفعل في الـ Context
          if (instructorData?.image?.fullUrl) {
            updateFaviconElement(instructorData.image.fullUrl, instructorData.name);
            return;
          }

          // إذا لم تكن موجودة، جلبها من الـ API
          const response = await api.get('/admin/check-auth');
          
          if (response.data?.result === 'Success' && response.data?.data) {
            const data = response.data.data;
            if (data.image?.fullUrl) {
              updateFaviconElement(data.image.fullUrl, data.name);
            }
          }
        } else {
          // إعادة الشعار الافتراضي
          resetFavicon();
        }
      } catch (error) {
        console.warn('⚠️ Could not update favicon:', error);
        resetFavicon();
      }
    };

    updateFavicon();
  }, [role, instructorData]);
};

// دالة مساعدة لتحديث عناصر الـ Favicon
const updateFaviconElement = (imageUrl: string, teacherName?: string) => {
  // تحديث Favicon
  const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (faviconLink) {
    faviconLink.href = imageUrl;
  }

  // تحديث Shortcut Icon
  const shortcutIcon = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
  if (shortcutIcon) {
    shortcutIcon.href = imageUrl;
  }

  // تحديث Open Graph Image
  const ogImage = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
  if (ogImage) {
    ogImage.content = imageUrl;
  }

  // تحديث Twitter Image
  const twitterImage = document.querySelector("meta[name='twitter:image']") as HTMLMetaElement;
  if (twitterImage) {
    twitterImage.content = imageUrl;
  }

  // تحديث Title
  if (teacherName) {
    document.title = `${teacherName} | Teacher Dashboard`;
  }

  // تحديث JSON-LD
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent || '{}');
      data.logo = imageUrl;
      data.name = teacherName || 'Teacher';
      jsonLd.textContent = JSON.stringify(data);
    } catch (e) {
      // ignore
    }
  }
};

// دالة لإعادة الشعار الافتراضي
const resetFavicon = () => {
  const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (faviconLink) {
    faviconLink.href = '/logo.png';
  }

  const shortcutIcon = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
  if (shortcutIcon) {
    shortcutIcon.href = '/logo.png';
  }

  const ogImage = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
  if (ogImage) {
    ogImage.content = '/logo.png';
  }

  const twitterImage = document.querySelector("meta[name='twitter:image']") as HTMLMetaElement;
  if (twitterImage) {
    twitterImage.content = '/logo.png';
  }

  document.title = 'Teacher Planet | Modern LMS Dashboard';
};