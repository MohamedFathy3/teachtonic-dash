// src/hooks/useStages.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { stageService } from '@/services/stage.service';
import type { Stage, StageFilters, StageFormData } from '@/types/stage.types';
import { toast } from '@/hooks/use-toast';

export function useStages() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10000);
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
      const response = await stageService.getStages(
        filters,
        perPage,
        1, // ✅ نجيب الصفحة الأولى فقط
        searchQuery,
        showDeleted
      );
      if (isMounted.current) {
        setStages(response.data || []);
        setTotal(response.total || 0);
        setSelectedStages(new Set());
      }
    } catch (error) {
      console.error('Failed to fetch stages:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [filters, perPage, searchQuery, showDeleted]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  const createStage = useCallback(async (data: StageFormData) => {
    await stageService.createStage(data);
    await fetchStages();
  }, [fetchStages]);

  const updateStage = useCallback(async (id: number, data: Partial<StageFormData>) => {
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

  return {
    stages,
    loading,
    total,
    perPage,
    setPerPage,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    showDeleted,
    setShowDeleted,
    selectedStages,
    setSelectedStages,
    fetchStages,
    createStage,
    updateStage,
    deleteStage,
    forceDeleteStage,
    restoreStage,
    toggleActive,
    bulkDelete,
    bulkForceDelete,
    bulkRestore,
  };
}