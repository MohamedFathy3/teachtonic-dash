// src/hooks/useFooters.ts

import { useState, useEffect, useCallback } from 'react';
import { footerService } from '@/services/footer.service';
import type { Footer, FooterFilters, FooterFormData } from '@/types/footer.types';

export function useFooters() {
  const [footers, setFooters] = useState<Footer[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedFooters, setSelectedFooters] = useState<Set<number>>(new Set());

  const fetchFooters = useCallback(async (
    page = 1,
    search?: string,
    filters?: FooterFilters
  ) => {
    setLoading(false);
    try {
      const response = await footerService.getAllFooters(
        filters,
        10,
        page,
        search,
        showDeleted
      );
      setFooters(response.data);
      setTotal(response.meta.total);
      setCurrentPage(response.meta.current_page);
      setLastPage(response.meta.last_page);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  const createFooter = async (data: FooterFormData) => {
    const newFooter = await footerService.createFooter(data);
    await fetchFooters(currentPage);
    return newFooter;
  };

  const updateFooter = async (id: number, data: Partial<FooterFormData>) => {
    const updated = await footerService.updateFooter(id, data);
    await fetchFooters(currentPage);
    return updated;
  };

  const deleteFooter = async (id: number) => {
    await footerService.deleteFooter(id);
    await fetchFooters(currentPage);
  };

  const forceDeleteFooter = async (id: number) => {
    await footerService.forceDeleteFooter(id);
    await fetchFooters(currentPage);
  };

  const restoreFooter = async (id: number) => {
    await footerService.restoreFooter(id);
    await fetchFooters(currentPage);
  };

  const toggleActive = async (id: number) => {
    await footerService.toggleFooterActive(id);
    await fetchFooters(currentPage);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      fetchFooters(page);
    }
  };

  const bulkDelete = async (ids: number[]) => {
    await footerService.bulkDeleteFooters(ids);
    setSelectedFooters(new Set());
    await fetchFooters(currentPage);
  };

  const bulkForceDelete = async (ids: number[]) => {
    await footerService.bulkForceDeleteFooters(ids);
    setSelectedFooters(new Set());
    await fetchFooters(currentPage);
  };

  const bulkRestore = async (ids: number[]) => {
    await footerService.bulkRestoreFooters(ids);
    setSelectedFooters(new Set());
    await fetchFooters(currentPage);
  };

  useEffect(() => {
    fetchFooters(1);
  }, [showDeleted, fetchFooters]);

  return {
    footers,
    loading,
    total,
    currentPage,
    lastPage,
    showDeleted,
    setShowDeleted,
    selectedFooters,
    setSelectedFooters,
    createFooter,
    updateFooter,
    deleteFooter,
    forceDeleteFooter,
    restoreFooter,
    toggleActive,
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore,
  };
}