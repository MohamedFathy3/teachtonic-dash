
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useStages.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { stageService } from '@/services/stage.service';
import type { Stage, StageFilters } from '@/types/stage.types';

interface UseStagesReturn {
  stages: Stage[];
  loading: boolean;
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
  filters: StageFilters;
  searchQuery: string;
  showDeleted: boolean;
  selectedStages: Set<number>;
  setSelectedStages: (ids: Set<number>) => void;
  setShowDeleted: (show: boolean) => void;
  setFilters: (filters: StageFilters) => void;
  setPerPage: (perPage: number) => void;
  setSearchQuery: (query: string) => void;
  fetchStages: () => Promise<void>;
  createStage: (data: any) => Promise<void>;
  updateStage: (id: number, data: any) => Promise<void>;
  deleteStage: (id: number) => Promise<void>;
  forceDeleteStage: (id: number) => Promise<void>;
  restoreStage: (id: number) => Promise<void>;
  toggleActive: (id: number) => Promise<void>;
  goToPage: (page: number) => void;
  bulkDelete: (ids: number[]) => Promise<void>;
  bulkForceDelete: (ids: number[]) => Promise<void>;
  bulkRestore: (ids: number[]) => Promise<void>;
  updateFilters: (newFilters: Partial<StageFilters>) => void;
  clearFilters: () => void;
}

export const useStages = (): UseStagesReturn => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState<StageFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedStages, setSelectedStages] = useState<Set<number>>(new Set());
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchStages = useCallback(async () => {
    if (!isMounted.current) return;
    
    setLoading(true);
    try {
      const response = await stageService.getAllStages(
        filters, 
        perPage, 
        currentPage, 
        searchQuery,
        showDeleted
      );
      
      console.log('📦 fetchStages - response:', response);
      
      if (isMounted.current) {
        // ✅ التحقق من وجود البيانات بالشكل الصحيح
        if (response && response.data && Array.isArray(response.data)) {
          setStages(response.data);
          setTotal(response.meta?.total || response.data.length || 0);
          setCurrentPage(response.meta?.current_page || currentPage);
          setLastPage(response.meta?.last_page || 1);
        } else {
          // ✅ إذا كانت البيانات مش بالشكل المطلوب
          console.warn('⚠️ Unexpected response structure:', response);
          setStages([]);
          setTotal(0);
          setCurrentPage(1);
          setLastPage(1);
        }
        setSelectedStages(new Set());
      }
    } catch (error) {
      console.error('❌ Failed to fetch stages:', error);
      if (isMounted.current) {
        setStages([]);
        setTotal(0);
        setCurrentPage(1);
        setLastPage(1);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [filters, perPage, currentPage, searchQuery, showDeleted]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  }, [lastPage]);

  // ✅ دالة تحديث الفلاتر
  const updateFilters = useCallback((newFilters: Partial<StageFilters>) => {
    setFilters(prev => {
      // تنظيف الفلاتر من القيم الفارغة
      const cleanedFilters: StageFilters = {};
      Object.keys(newFilters).forEach(key => {
        const value = newFilters[key as keyof StageFilters];
        if (value !== undefined && value !== null && value !== '') {
          cleanedFilters[key as keyof StageFilters] = value;
        }
      });
      
      return {
        ...prev,
        ...cleanedFilters
      };
    });
    setCurrentPage(1);
  }, []);

  // ✅ دالة مسح الفلاتر
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  const createStage = useCallback(async (data: any) => {
    await stageService.createStage(data);
    setCurrentPage(1);
    await fetchStages();
  }, [fetchStages]);

  const updateStage = useCallback(async (id: number, data: any) => {
    await stageService.updateStage(id, data);
    await fetchStages();
  }, [fetchStages]);

  const deleteStage = useCallback(async (id: number) => {
    await stageService.deleteStage(id);
    await fetchStages();
  }, [fetchStages]);

  const forceDeleteStage = useCallback(async (id: number) => {
    await stageService.forceDeleteStage(id);
    await fetchStages();
  }, [fetchStages]);

  const restoreStage = useCallback(async (id: number) => {
    await stageService.restoreStage(id);
    await fetchStages();
  }, [fetchStages]);

  const bulkDelete = useCallback(async (ids: number[]) => {
    await stageService.bulkDeleteStages(ids);
    await fetchStages();
  }, [fetchStages]);

  const bulkForceDelete = useCallback(async (ids: number[]) => {
    await stageService.bulkForceDeleteStages(ids);
    await fetchStages();
  }, [fetchStages]);

  const bulkRestore = useCallback(async (ids: number[]) => {
    await stageService.bulkRestoreStages(ids);
    await fetchStages();
  }, [fetchStages]);

  const toggleActive = useCallback(async (id: number) => {
    try {
      await stageService.toggleStageActive(id);
      setStages(prevStages => 
        prevStages.map(stage => 
          stage.id === id 
            ? { ...stage, active: !stage.active }
            : stage
        )
      );
    } catch (error) {
      console.error('Failed to toggle stage status:', error);
    }
  }, []);

  const handleSetFilters = useCallback((newFilters: StageFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSetPerPage = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  return {
    stages,
    loading,
    total,
    currentPage,
    lastPage,
    perPage,
    filters,
    searchQuery,
    showDeleted,
    selectedStages,
    setSelectedStages,
    setShowDeleted,
    setFilters: handleSetFilters,
    setPerPage: handleSetPerPage,
    setSearchQuery: handleSetSearchQuery,
    fetchStages,
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
  };
};