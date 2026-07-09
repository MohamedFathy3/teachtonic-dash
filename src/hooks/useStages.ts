// src/hooks/useStages.ts

import { useState, useEffect, useCallback } from 'react';
import { stageService } from '@/services/stage.service';
import type { Stage, StageFilters, PaginatedResponse, StageFormData } from '@/types/stage.types';
import { toast } from '@/hooks/use-toast';

export function useStages() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedStages, setSelectedStages] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<StageFilters>({});
  const [perPage] = useState(10);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ جلب المراحل مع الفلاتر
  const fetchStages = useCallback(async () => {
    setLoading(true);
    try {
      const queryFilters: StageFilters = {
        ...filters,
      };

      // إضافة فلتر المحذوفات
      if (showDeleted) {
        queryFilters.trashed = 'with';
      }

      const response = await stageService.getStages(
        queryFilters,
        perPage,
        currentPage,
        searchQuery,
        showDeleted
      );

      setStages(response.data);
      setTotal(response.total);
      setLastPage(response.last_page);
    } catch (error: any) {
      console.error('Error fetching stages:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch stages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, showDeleted, currentPage, searchQuery, perPage]);

  // ✅ جلب البيانات عند تغيير أي فلتر أو الصفحة
  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  // ✅ تحديث الفلاتر مع الحفاظ على الصفحة الحالية أو الرجوع للصفحة 1
  const updateFilters = useCallback((newFilters: StageFilters, resetPage: boolean = true) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
    // إعادة للصفحة الأولى عند تغيير الفلتر (اختياري)
    if (resetPage) {
      setCurrentPage(1);
    }
  }, []);

  // ✅ مسح الفلاتر
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
    setShowDeleted(false);
  }, []);

  // ✅ التنقل بين الصفحات مع الحفاظ على الفلاتر
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
      // ✅ الفلاتر هتفضل موجودة لأنها في الـ State
    }
  }, [lastPage]);

  // ✅ إنشاء مرحلة جديدة
  const createStage = useCallback(async (data: StageFormData) => {
    setActionLoading(true);
    try {
      const newStage = await stageService.createStage(data);
      toast({
        title: 'Success',
        description: 'Stage created successfully',
      });
      await fetchStages();
      return newStage;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create stage',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchStages]);

  // ✅ تحديث مرحلة
  const updateStage = useCallback(async (id: number, data: Partial<StageFormData>) => {
    setActionLoading(true);
    try {
      const updatedStage = await stageService.updateStage(id, data);
      toast({
        title: 'Success',
        description: 'Stage updated successfully',
      });
      await fetchStages();
      return updatedStage;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update stage',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchStages]);

  // ✅ حذف مرحلة (نقل إلى سلة المحذوفات)
  const deleteStage = useCallback(async (id: number) => {
    setActionLoading(true);
    try {
      await stageService.deleteStage(id);
      toast({
        title: 'Success',
        description: 'Stage moved to trash successfully',
      });
      await fetchStages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete stage',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchStages]);

  // ✅ حذف نهائي لمرحلة
  const forceDeleteStage = useCallback(async (id: number) => {
    setActionLoading(true);
    try {
      await stageService.forceDeleteStage(id);
      toast({
        title: 'Success',
        description: 'Stage permanently deleted',
      });
      await fetchStages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to force delete stage',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchStages]);

  // ✅ استعادة مرحلة محذوفة
  const restoreStage = useCallback(async (id: number) => {
    setActionLoading(true);
    try {
      await stageService.restoreStage(id);
      toast({
        title: 'Success',
        description: 'Stage restored successfully',
      });
      await fetchStages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to restore stage',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchStages]);

  // ✅ تبديل حالة المرحلة (نشط/غير نشط)
  const toggleActive = useCallback(async (id: number) => {
    try {
      const result = await stageService.toggleStageActive(id);
      toast({
        title: 'Success',
        description: result.message || 'Stage status changed successfully',
      });
      await fetchStages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle stage status',
        variant: 'destructive',
      });
      throw error;
    }
  }, [fetchStages]);

  // ✅ حذف مجموعة من المراحل
  const bulkDelete = useCallback(async (ids: number[]) => {
    setActionLoading(true);
    try {
      await stageService.bulkDeleteStages(ids);
      toast({
        title: 'Success',
        description: `${ids.length} stages moved to trash successfully`,
      });
      setSelectedStages(new Set());
      await fetchStages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete stages',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchStages]);

  // ✅ حذف نهائي لمجموعة من المراحل
  const bulkForceDelete = useCallback(async (ids: number[]) => {
    setActionLoading(true);
    try {
      await stageService.bulkForceDeleteStages(ids);
      toast({
        title: 'Success',
        description: `${ids.length} stages permanently deleted`,
      });
      setSelectedStages(new Set());
      await fetchStages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to force delete stages',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchStages]);

  // ✅ استعادة مجموعة من المراحل
  const bulkRestore = useCallback(async (ids: number[]) => {
    setActionLoading(true);
    try {
      await stageService.bulkRestoreStages(ids);
      toast({
        title: 'Success',
        description: `${ids.length} stages restored successfully`,
      });
      setSelectedStages(new Set());
      await fetchStages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to restore stages',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [fetchStages]);

  return {
    stages,
    loading,
    total,
    currentPage,
    lastPage,
    showDeleted,
    setShowDeleted,
    selectedStages,
    setSelectedStages,
    createStage,
    updateStage,
    deleteStage,
    forceDeleteStage,
    restoreStage,
    toggleActive,
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore,
    updateFilters,
    clearFilters,
    filters,
    searchQuery,
    setSearchQuery,
    fetchStages,
    actionLoading,
  };
}