// src/hooks/lesson/useLessonData.ts

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { courseDetailService } from '@/services/course-detail.service';
import { toast } from "@/hooks/use-toast";
import type { LessonDetail } from '@/types/lesson.types';

export const useLessonData = (lessonId: number) => {
  const { lang } = useApp();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLesson = async () => {
    if (!lessonId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // ✅ الآن getById موجودة في الخدمة
      const response = await courseDetailService.getById(lessonId);
      
      if (response) {
        setLesson(response);
      } else {
        setLesson(null);
        const message = lang === 'ar' ? 'الدرس غير موجود' : 'Lesson not found';
        setError(message);
        toast.error(message);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      const message = lang === 'ar' ? 'حدث خطأ في تحميل الدرس' : 'Error loading lesson';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  return { 
    lesson, 
    loading, 
    error, 
    refetch: fetchLesson 
  };
};