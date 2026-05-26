/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useExams.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { examService } from '@/services/exam.service';
import type { Exam, ExamFormData, Question,UpdateExamDTO } from '@/types/exam.types';
import { useApp } from '@/contexts/AppContext';

interface UseExamsOptions {
  teacherId?: number;
  autoFetch?: boolean;
}

export const useExams = (options: UseExamsOptions = {}) => {
  const { teacherId, autoFetch = true } = options;
  const { user } = useApp();
  const [exams, setExams] = useState<Exam[]>([]);
  const [deletedExams, setDeletedExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 12,
  });
  
  const isMounted = useRef(true);

  // ✅ جلب الامتحانات النشطة
  const fetchExams = useCallback(async (page = 1, search = '') => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const id = teacherId || user?.id;
      if (!id) {
        setExams([]);
        return;
      }
      
      const response = await examService.getAllExams(
        { teacher_id: id },
        12,
        page,
        search,
        false
      );
      
      if (!isMounted.current) return;
      
      setExams(response.data || []);
      setPagination({
        currentPage: response.meta?.current_page || 1,
        lastPage: response.meta?.last_page || 1,
        total: response.meta?.total || 0,
        perPage: response.meta?.per_page || 12,
      });
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error('Error fetching exams:', err);
      setError(err.message || 'Failed to fetch exams');
      setExams([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [teacherId, user?.id]);

  // ✅ جلب الامتحانات المحذوفة
  const fetchDeletedExams = useCallback(async (page = 1, search = '') => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const id = teacherId || user?.id;
      if (!id) {
        setDeletedExams([]);
        return;
      }
      
      const response = await examService.getDeletedExams(12, page, search);
      
      if (!isMounted.current) return;
      
      setDeletedExams(response.data || []);
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error('Error fetching deleted exams:', err);
      setError(err.message || 'Failed to fetch deleted exams');
      setDeletedExams([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [teacherId, user?.id]);
const submitExam = useCallback(async (examId: number, answers: Record<number, string>) => {
  setLoading(true);
  try {
    const result = await examService.submitExam({ exam_id: examId, answers });
    return result;
  } catch (err: any) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

const getExamResult = useCallback(async (examId: number, studentId?: number) => {
  setLoading(true);
  try {
    const result = await examService.getExamResult(examId, studentId);
    return result;
  } catch (err: any) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

  // ✅ جلب امتحان بالـ ID مع أسئلته
  const fetchExamById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const exam = await examService.getExam(id);
      setSelectedExam(exam);
      setQuestions(exam.questions || []);
      return exam;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch exam details');
      console.error('Error fetching exam:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ إنشاء امتحان جديد
  const createExam = useCallback(async (data: ExamFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newExam = await examService.createExam(data);
      setExams(prev => [newExam, ...prev]);
      return newExam;
    } catch (err: any) {
      setError(err.message || 'Failed to create exam');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ تحديث امتحان
  const updateExam = useCallback(async (id: number, data: Partial<UpdateExamDTO>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedExam = await examService.updateExam(id, data);
      setExams(prev => prev.map(e => e.id === id ? updatedExam : e));
      if (selectedExam?.id === id) {
        setSelectedExam(updatedExam);
      }
      return updatedExam;
    } catch (err: any) {
      setError(err.message || 'Failed to update exam');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedExam]);

  // ✅ حذف امتحان (نقل إلى سلة المحذوفات)
  const deleteExam = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await examService.deleteExam(id);
      setExams(prev => prev.filter(e => e.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete exam');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ استعادة امتحان
  const restoreExam = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const restored = await examService.restoreExam(id);
      setDeletedExams(prev => prev.filter(e => e.id !== id));
      setExams(prev => [restored, ...prev]);
      return restored;
    } catch (err: any) {
      setError(err.message || 'Failed to restore exam');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ حذف نهائي
  const forceDeleteExam = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await examService.forceDeleteExam(id);
      setDeletedExams(prev => prev.filter(e => e.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to force delete exam');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ تبديل حالة التفعيل
  const toggleActive = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await examService.toggleExamActive(id);
      setExams(prev => prev.map(e => 
        e.id === id ? { ...e, active: e.active === 1 ? 0 : 1 } : e
      ));
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to toggle exam status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ إضافة أسئلة
  const addQuestions = useCallback(async (examId: number, questionsList: Partial<Question>[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await examService.addQuestions(examId, questionsList);
      if (selectedExam?.id === examId) {
        const updatedExam = await examService.getExam(examId);
        setSelectedExam(updatedExam);
        setQuestions(updatedExam.questions || []);
      }
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to add questions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedExam]);

  // ✅ تصحيح سؤال مقالي
  const gradeEssay = useCallback(async (answerId: number, mark: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await examService.gradeEssayQuestion(answerId, mark);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to grade essay');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ العمليات الجماعية
  const bulkDeleteExams = useCallback(async (ids: number[]) => {
    setLoading(true);
    try {
      await examService.bulkDeleteExams(ids);
      setExams(prev => prev.filter(e => !ids.includes(e.id)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkRestoreExams = useCallback(async (ids: number[]) => {
    setLoading(true);
    try {
      await examService.bulkRestoreExams(ids);
      setDeletedExams(prev => prev.filter(e => !ids.includes(e.id)));
      await fetchExams();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchExams]);

  const bulkForceDeleteExams = useCallback(async (ids: number[]) => {
    setLoading(true);
    try {
      await examService.bulkForceDeleteExams(ids);
      setDeletedExams(prev => prev.filter(e => !ids.includes(e.id)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ التحقق التلقائي
  useEffect(() => {
    if (autoFetch && (teacherId || user?.id)) {
      fetchExams();
      fetchDeletedExams();
    }
  }, [autoFetch, teacherId, user?.id, fetchExams, fetchDeletedExams]);

  // ✅ تنظيف
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    // Data
    exams,
    deletedExams,
    selectedExam,
    questions,
    loading,
    error,
    pagination,
    
    // Fetch functions
    fetchExams,
    fetchDeletedExams,
    fetchExamById,
    
    // CRUD
    createExam,
    updateExam,
    deleteExam,
    restoreExam,
    forceDeleteExam,
    toggleActive,
    
    // Questions
    addQuestions,
    gradeEssay,
    
    // Bulk operations
    bulkDeleteExams,
    bulkRestoreExams,
    bulkForceDeleteExams,
     submitExam,
  getExamResult,  
    // Pagination
    goToPage: (page: number) => fetchExams(page),
  };
};