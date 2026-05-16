// src/hooks/useAbouts.ts

import { useState, useEffect, useCallback } from 'react';
import { aboutService } from '@/services/about.service';
import type { About, AboutFilters, AboutFormData } from '@/types/about.types';

export function useAbouts() {
  const [abouts, setAbouts] = useState<About[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedAbouts, setSelectedAbouts] = useState<Set<number>>(new Set());

  const fetchAbouts = useCallback(async (
    page = 1,
    search?: string,
    filters?: AboutFilters
  ) => {
    setLoading(false);
    try {
      const response = await aboutService.getAllAbouts(
        filters,
        10,
        page,
        search,
        showDeleted
      );
      setAbouts(response.data);
      setTotal(response.meta.total);
      setCurrentPage(response.meta.current_page);
      setLastPage(response.meta.last_page);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  const createAbout = async (data: AboutFormData) => {
    const newAbout = await aboutService.createAbout(data);
    await fetchAbouts(currentPage);
    return newAbout;
  };

  const updateAbout = async (id: number, data: Partial<AboutFormData>) => {
    const updated = await aboutService.updateAbout(id, data);
    await fetchAbouts(currentPage);
    return updated;
  };

  const deleteAbout = async (id: number) => {
    await aboutService.deleteAbout(id);
    await fetchAbouts(currentPage);
  };

  const forceDeleteAbout = async (id: number) => {
    await aboutService.forceDeleteAbout(id);
    await fetchAbouts(currentPage);
  };

  const restoreAbout = async (id: number) => {
    await aboutService.restoreAbout(id);
    await fetchAbouts(currentPage);
  };

  const toggleActive = async (id: number) => {
    await aboutService.toggleAboutActive(id);
    await fetchAbouts(currentPage);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      fetchAbouts(page);
    }
  };

  const bulkDelete = async (ids: number[]) => {
    await aboutService.bulkDeleteAbouts(ids);
    setSelectedAbouts(new Set());
    await fetchAbouts(currentPage);
  };

  const bulkForceDelete = async (ids: number[]) => {
    await aboutService.bulkForceDeleteAbouts(ids);
    setSelectedAbouts(new Set());
    await fetchAbouts(currentPage);
  };

  const bulkRestore = async (ids: number[]) => {
    await aboutService.bulkRestoreAbouts(ids);
    setSelectedAbouts(new Set());
    await fetchAbouts(currentPage);
  };

  useEffect(() => {
    fetchAbouts(1);
  }, [showDeleted, fetchAbouts]);

  return {
    abouts,
    loading,
    total,
    currentPage,
    lastPage,
    showDeleted,
    setShowDeleted,
    selectedAbouts,
    setSelectedAbouts,
    createAbout,
    updateAbout,
    deleteAbout,
    forceDeleteAbout,
    restoreAbout,
    toggleActive,
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore,
  };
}