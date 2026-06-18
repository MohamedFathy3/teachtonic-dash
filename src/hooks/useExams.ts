/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/exams/hooks/useExams.ts

import { useState, useCallback, useEffect } from 'react';
import { examService } from '@/services/exam.service';
import { toast  } from "@/hooks/use-toast";
import { useApp } from '@/contexts/AppContext';

export const useExams = (teacherId: number, perPage: number = 12) => {
  const { lang } = useApp();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: perPage,
  });

  const fetchExams = useCallback(async (page = 1, filters: any = {}, search: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const apiFilters = { teacher_id: teacherId, ...filters };
      const response = await examService.getAllExams(apiFilters, perPage, page, search);
      
      setExams(response.data || []);
      setPagination({
        currentPage: response.meta?.current_page || 1,
        lastPage: response.meta?.last_page || 1,
        total: response.meta?.total || 0,
        perPage: response.meta?.per_page || perPage,
      });
    } catch (err: any) {
      setError(err.message);
      toast.error(lang === 'ar' ? 'حدث خطأ في جلب الامتحانات' : 'Error fetching exams');
    } finally {
      setLoading(false);
    }
  }, [teacherId, perPage, lang]);

  const getExam = useCallback(async (id: number) => {
    try {
      const response = await examService.getExam(id);
      return response;
    } catch (err: any) {
      toast.error(lang === 'ar' ? 'حدث خطأ في جلب الامتحان' : 'Error fetching exam');
      throw err;
    }
  }, [lang]);

  const deleteExam = useCallback(async (id: number) => {
    try {
      await examService.deleteExam(id);
      toast.success(lang === 'ar' ? 'تم حذف الامتحان بنجاح' : 'Exam deleted successfully');
      return true;
    } catch (err) {
      toast.error(lang === 'ar' ? 'حدث خطأ في حذف الامتحان' : 'Error deleting exam');
      return false;
    }
  }, [lang]);
const toggleShowResult = useCallback(async (examId: number, currentValue: boolean) => {
  try {
    await examService.toggleShowResult(examId);
    // تحديث الحالة المحلية
    setExams(prevExams => prevExams.map(exam => 
      exam.id === examId 
        ? { ...exam, show_result: !currentValue } 
        : exam
    ));
    toast.success(lang === 'ar' ? 'تم تحديث إعدادات عرض النتيجة' : 'Show result setting updated');
  } catch (error) {
    console.error('Error toggling show result:', error);
    toast.error(lang === 'ar' ? 'حدث خطأ في تحديث الإعدادات' : 'Error updating setting');
  }
}, [lang, setExams]);
  const toggleRandomQuestions = useCallback(async (id: number, currentValue: boolean) => {
    try {
      await examService.toggleRandomQuestions(id);
      setExams(prev => prev.map(e => e.id === id ? { ...e, random_questions: !currentValue } : e));
      toast.success(lang === 'ar' ? 'تم تغيير ترتيب الأسئلة' : 'Random questions toggled');
    } catch (error) {
      console.error('Error toggling random questions:', error);
    }
  }, [lang]);

  const toggleRandomAnswers = useCallback(async (id: number, currentValue: boolean) => {
    try {
      await examService.toggleRandomAnswers(id);
      setExams(prev => prev.map(e => e.id === id ? { ...e, random_answers: !currentValue } : e));
      toast.success(lang === 'ar' ? 'تم تغيير ترتيب الإجابات' : 'Random answers toggled');
    } catch (error) {
      console.error('Error toggling random answers:', error);
    }
  }, [lang]);

  return {
    exams,
    loading,
    error,
    pagination,
    fetchExams,
    getExam,
    deleteExam,
    toggleRandomQuestions,
    toggleRandomAnswers,
    setExams,
    toggleShowResult,
  };
};