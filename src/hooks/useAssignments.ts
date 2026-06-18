/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useAssignments.ts

import { useState, useCallback } from 'react';
import { assignmentService } from '@/services/assignment.service';
import { toast  } from "@/hooks/use-toast";
import { useApp } from '@/contexts/AppContext';

export const useAssignments = (teacherId: number, perPage: number = 12) => {
  const { lang } = useApp();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: perPage,
    total: 0,
  });

  const fetchAssignments = useCallback(async (
    page: number = 1,
    filters: Record<string, any> = {},
    search: string = ''
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await assignmentService.getAllAssignments(filters, perPage, page, search);
      setAssignments(response.data);
      setPagination({
        currentPage: response.meta.current_page,
        lastPage: response.meta.last_page,
        perPage: response.meta.per_page,
        total: response.meta.total,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assignments');
      toast.error(lang === 'ar' ? 'فشل في تحميل الواجبات' : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [perPage, lang]);

  const deleteAssignment = async (id: number) => {
    try {
      await assignmentService.deleteAssignment(id);
      toast.success(lang === 'ar' ? 'تم حذف الواجب بنجاح' : 'Assignment deleted successfully');
      fetchAssignments(1);
      return true;
    } catch (error) {
      return false;
    }
  };

  const toggleAssignmentActive = async (id: number) => {
    try {
      await assignmentService.toggleAssignmentActive(id);
      fetchAssignments(pagination.currentPage);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    assignments,
    loading,
    error,
    pagination,
    fetchAssignments,
    deleteAssignment,
    toggleAssignmentActive,
    setAssignments,
  };
};