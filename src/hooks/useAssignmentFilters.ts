/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useAssignmentFilters.ts

import { useState, useCallback } from 'react';
import { toast  } from "@/hooks/use-toast";
import { useApp } from '@/contexts/AppContext';

interface AssignmentFilters {
  stageId: number | null;
  lessonId: number | null;
  marksMin: number | null;
  active: boolean | null;
}

export const useAssignmentFilters = (fetchAssignments: (page?: number, filters?: any, search?: string) => void) => {
  const { lang } = useApp();
  const [filters, setFilters] = useState<AssignmentFilters>({
    stageId: null,
    lessonId: null,
    marksMin: null,
    active: null,
  });
  const [savedFilters, setSavedFilters] = useState<AssignmentFilters | null>(null);

  const loadSavedFilters = useCallback(() => {
    const saved = localStorage.getItem('assignmentFilters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFilters(parsed);
        setSavedFilters(parsed);
        toast.success(lang === 'ar' ? 'تم تحميل الفلاتر المحفوظة' : 'Saved filters loaded');
        
        const apiFilters: any = {};
        if (parsed.stageId) apiFilters.stage_id = parsed.stageId;
        if (parsed.lessonId) apiFilters.course_detail_id = parsed.lessonId;
        if (parsed.marksMin) apiFilters.total_marks = parsed.marksMin;
        if (parsed.active !== null) apiFilters.active = parsed.active ? 1 : 0;
        fetchAssignments(1, apiFilters);
      } catch (e) {
        console.error('Error loading saved filters', e);
      }
    }
  }, [lang, fetchAssignments]);

  const applyFilters = useCallback(() => {
    localStorage.setItem('assignmentFilters', JSON.stringify(filters));
    setSavedFilters(filters);
    
    const apiFilters: any = {};
    if (filters.stageId) apiFilters.stage_id = filters.stageId;
    if (filters.lessonId) apiFilters.course_detail_id = filters.lessonId;
    if (filters.marksMin) apiFilters.total_marks = filters.marksMin;
    if (filters.active !== null) apiFilters.active = filters.active ? 1 : 0;
    
    fetchAssignments(1, apiFilters);
    toast.success(lang === 'ar' ? 'تم تطبيق الفلاتر' : 'Filters applied');
  }, [filters, lang, fetchAssignments]);

  const clearFilters = useCallback(() => {
    const resetFilters = {
      stageId: null,
      lessonId: null,
      marksMin: null,
      active: null,
    };
    setFilters(resetFilters);
    setSavedFilters(null);
    localStorage.removeItem('assignmentFilters');
    fetchAssignments(1);
    toast.info(lang === 'ar' ? 'تم مسح جميع الفلاتر' : 'All filters cleared');
  }, [lang, fetchAssignments]);

  return {
    filters,
    setFilters,
    savedFilters,
    applyFilters,
    clearFilters,
    loadSavedFilters,
  };
};