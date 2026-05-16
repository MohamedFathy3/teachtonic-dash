// src/hooks/useFeatures.ts

import { useState, useEffect, useCallback } from 'react';
import { featureService } from '@/services/feature.service';
import type { Feature, FeatureFilters, FeatureFormData } from '@/types/feature.types';

export function useFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<number>>(new Set());

  const fetchFeatures = useCallback(async (
    page = 1,
    search?: string,
    filters?: FeatureFilters
  ) => {
    setLoading(false);
    try {
      const response = await featureService.getAllFeatures(
        filters,
        10,
        page,
        search,
        showDeleted
      );
      setFeatures(response.data);
      setTotal(response.meta.total);
      setCurrentPage(response.meta.current_page);
      setLastPage(response.meta.last_page);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  const createFeature = async (data: FeatureFormData) => {
    const newFeature = await featureService.createFeature(data);
    await fetchFeatures(currentPage);
    return newFeature;
  };

  const updateFeature = async (id: number, data: Partial<FeatureFormData>) => {
    const updated = await featureService.updateFeature(id, data);
    await fetchFeatures(currentPage);
    return updated;
  };

  const deleteFeature = async (id: number) => {
    await featureService.deleteFeature(id);
    await fetchFeatures(currentPage);
  };

  const forceDeleteFeature = async (id: number) => {
    await featureService.forceDeleteFeature(id);
    await fetchFeatures(currentPage);
  };

  const restoreFeature = async (id: number) => {
    await featureService.restoreFeature(id);
    await fetchFeatures(currentPage);
  };

  const toggleActive = async (id: number) => {
    await featureService.toggleFeatureActive(id);
    await fetchFeatures(currentPage);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      fetchFeatures(page);
    }
  };

  const bulkDelete = async (ids: number[]) => {
    await featureService.bulkDeleteFeatures(ids);
    setSelectedFeatures(new Set());
    await fetchFeatures(currentPage);
  };

  const bulkForceDelete = async (ids: number[]) => {
    await featureService.bulkForceDeleteFeatures(ids);
    setSelectedFeatures(new Set());
    await fetchFeatures(currentPage);
  };

  const bulkRestore = async (ids: number[]) => {
    await featureService.bulkRestoreFeatures(ids);
    setSelectedFeatures(new Set());
    await fetchFeatures(currentPage);
  };

  useEffect(() => {
    fetchFeatures(1);
  }, [showDeleted, fetchFeatures]);

  return {
    features,
    loading,
    total,
    currentPage,
    lastPage,
    showDeleted,
    setShowDeleted,
    selectedFeatures,
    setSelectedFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
    forceDeleteFeature,
    restoreFeature,
    toggleActive,
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore,
  };
}