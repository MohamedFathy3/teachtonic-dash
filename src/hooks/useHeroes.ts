// src/hooks/useHeroes.ts

import { useState, useEffect, useCallback } from 'react';
import { heroService } from '@/services/hero.service';
import type { Hero, HeroFilters, HeroFormData } from '@/types/hero.types';

export function useHeroes() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedHeroes, setSelectedHeroes] = useState<Set<number>>(new Set());

  const fetchHeroes = useCallback(async (
    page = 1,
    search?: string,
    filters?: HeroFilters
  ) => {
    setLoading(false);
    try {
      const response = await heroService.getAllHeroes(
        filters,
        10,
        page,
        search,
        showDeleted
      );
      setHeroes(response.data);
      setTotal(response.meta.total);
      setCurrentPage(response.meta.current_page);
      setLastPage(response.meta.last_page);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  const createHero = async (data: HeroFormData) => {
    const newHero = await heroService.createHero(data);
    await fetchHeroes(currentPage);
    return newHero;
  };

  const updateHero = async (id: number, data: Partial<HeroFormData>) => {
    const updated = await heroService.updateHero(id, data);
    await fetchHeroes(currentPage);
    return updated;
  };

  const deleteHero = async (id: number) => {
    await heroService.deleteHero(id);
    await fetchHeroes(currentPage);
  };

  const forceDeleteHero = async (id: number) => {
    await heroService.forceDeleteHero(id);
    await fetchHeroes(currentPage);
  };

  const restoreHero = async (id: number) => {
    await heroService.restoreHero(id);
    await fetchHeroes(currentPage);
  };

  const toggleActive = async (id: number) => {
    await heroService.toggleHeroActive(id);
    await fetchHeroes(currentPage);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      fetchHeroes(page);
    }
  };

  const bulkDelete = async (ids: number[]) => {
    await heroService.bulkDeleteHeroes(ids);
    setSelectedHeroes(new Set());
    await fetchHeroes(currentPage);
  };

  const bulkForceDelete = async (ids: number[]) => {
    await heroService.bulkForceDeleteHeroes(ids);
    setSelectedHeroes(new Set());
    await fetchHeroes(currentPage);
  };

  const bulkRestore = async (ids: number[]) => {
    await heroService.bulkRestoreHeroes(ids);
    setSelectedHeroes(new Set());
    await fetchHeroes(currentPage);
  };

  useEffect(() => {
    fetchHeroes(1);
  }, [showDeleted, fetchHeroes]);

  return {
    heroes,
    loading,
    total,
    currentPage,
    lastPage,
    showDeleted,
    setShowDeleted,
    selectedHeroes,
    setSelectedHeroes,
    createHero,
    updateHero,
    deleteHero,
    forceDeleteHero,
    restoreHero,
    toggleActive,
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore,
  };
}