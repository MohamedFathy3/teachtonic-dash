/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useWebsiteSection.ts

import { useState, useCallback, useEffect } from 'react';
import { sectionService, ISectionService, SectionType } from '@/services/website.service';

export function useWebsiteSection<T = any>(
  type: SectionType, 
  teacherId: number,
  service: ISectionService = sectionService
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);

  const fetchAll = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const data = await service.getAll(type, teacherId);
      setItems(data);
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
    } finally {
      setLoading(false);
    }
  }, [type, teacherId, service]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, refetchKey]);

  const refetch = () => setRefetchKey(prev => prev + 1);

  const create = useCallback(async (data: any) => {
    const newItem = await service.create(type, { ...data, teacher_id: teacherId });
    setItems(prev => [newItem, ...prev]);
    refetch();
    return newItem;
  }, [type, teacherId, service]);

  const update = useCallback(async (id: number, data: any) => {
    const updated = await service.update(type, id, data);
    setItems(prev => prev.map(item => (item as any).id === id ? updated : item));
    return updated;
  }, [type, service]);

  const remove = useCallback(async (id: number) => {
    await service.delete(type, id);
    setItems(prev => prev.filter(item => (item as any).id !== id));
  }, [type, service]);

  const toggleActive = useCallback(async (id: number) => {
    const updated = await service.toggleActive(type, id);
    setItems(prev => prev.map(item => (item as any).id === id ? updated : item));
    return updated;
  }, [type, service]);

  return { items, loading, create, update, remove, toggleActive, refetch };
}