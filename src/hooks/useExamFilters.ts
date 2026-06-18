/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useExamFilters.ts

import { useState, useCallback } from 'react';
import { toast  } from "@/hooks/use-toast";
import { useApp } from '@/contexts/AppContext';

interface ExamFilters {
  stageId: number | null;
  subjectId: number | null;
  semesterId: number | null;
  active: boolean | null;
  marksMin: number | null;
  marksMax: number | null;
  lessonId: number | null;
}

export const useExamFilters = (fetchExams: (page?: number, filters?: any, search?: string) => void) => {
  const { lang } = useApp();
  const [filters, setFilters] = useState<ExamFilters>({
    stageId: null,
    subjectId: null,
    semesterId: null,
    active: null,
    marksMin: null,
    marksMax: null,
    lessonId: null,
  });
  const [savedFilters, setSavedFilters] = useState<ExamFilters | null>(null);

  // Load saved filters from localStorage on mount
  const loadSavedFilters = useCallback(() => {
    const saved = localStorage.getItem('examFilters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFilters(parsed);
        setSavedFilters(parsed);
        toast.success(lang === 'ar' ? 'تم تحميل الفلاتر المحفوظة' : 'Saved filters loaded');
        
        // Apply filters after loading
        const apiFilters: any = {};
        if (parsed.stageId) apiFilters.stage_id = parsed.stageId;
        if (parsed.lessonId) apiFilters.course_detail_id = parsed.lessonId;
        if (parsed.marksMin) apiFilters.total_marks = parsed.marksMin;
        fetchExams(1, apiFilters);
      } catch (e) {
        console.error('Error loading saved filters', e);
      }
    }
  }, [lang, fetchExams]);

  const applyFilters = useCallback(() => {
    // Save to localStorage
    localStorage.setItem('examFilters', JSON.stringify(filters));
    setSavedFilters(filters);
    
    // Build API filters
    const apiFilters: any = {};
    if (filters.stageId) apiFilters.stage_id = filters.stageId;
    if (filters.lessonId) apiFilters.course_detail_id = filters.lessonId;
    if (filters.marksMin) apiFilters.total_marks = filters.marksMin;
    
    fetchExams(1, apiFilters);
    toast.success(lang === 'ar' ? 'تم تطبيق الفلاتر' : 'Filters applied');
  }, [filters, lang, fetchExams]);

  const clearFilters = useCallback(() => {
    const resetFilters = {
      stageId: null,
      subjectId: null,
      semesterId: null,
      active: null,
      marksMin: null,
      marksMax: null,
      lessonId: null,
    };
    setFilters(resetFilters);
    setSavedFilters(null);
    localStorage.removeItem('examFilters');
    fetchExams(1);
    toast.info(lang === 'ar' ? 'تم مسح جميع الفلاتر' : 'All filters cleared');
  }, [lang, fetchExams]);

  return {
    filters,
    setFilters,
    savedFilters,
    applyFilters,
    clearFilters,
    loadSavedFilters,
  };
};