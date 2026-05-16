// src/hooks/useAssistantTeachers.ts

import { useState, useEffect, useCallback } from 'react';
import { assistantTeacherService } from '@/services/assistant-teacher.service';
import type { AssistantTeacher, AssistantTeacherFilters, AssistantTeacherFormData } from '@/types/assistant-teacher.types';

export function useAssistantTeachers() {
  const [assistants, setAssistants] = useState<AssistantTeacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedAssistants, setSelectedAssistants] = useState<Set<number>>(new Set());

  const fetchAssistants = useCallback(async (
    page = 1,
    search?: string,
    filters?: AssistantTeacherFilters
  ) => {
    setLoading(false);
    try {
      const response = await assistantTeacherService.getAllAssistantTeachers(
        filters,
        10,
        page,
        search,
        showDeleted
      );
      setAssistants(response.data);
      setTotal(response.meta.total);
      setCurrentPage(response.meta.currentPage);
      setLastPage(response.meta.lastPage);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  const createAssistant = async (data: AssistantTeacherFormData) => {
    const newAssistant = await assistantTeacherService.createAssistantTeacher(data);
    await fetchAssistants(currentPage);
    return newAssistant;
  };

  const updateAssistant = async (id: number, data: Partial<AssistantTeacherFormData>) => {
    const updated = await assistantTeacherService.updateAssistantTeacher(id, data);
    await fetchAssistants(currentPage);
    return updated;
  };

  const deleteAssistant = async (id: number) => {
    await assistantTeacherService.deleteAssistantTeacher(id);
    await fetchAssistants(currentPage);
  };

  const forceDeleteAssistant = async (id: number) => {
    await assistantTeacherService.forceDeleteAssistantTeacher(id);
    await fetchAssistants(currentPage);
  };

  const restoreAssistant = async (id: number) => {
    await assistantTeacherService.restoreAssistantTeacher(id);
    await fetchAssistants(currentPage);
  };

  const toggleActive = async (id: number) => {
    await assistantTeacherService.toggleAssistantTeacherActive(id);
    await fetchAssistants(currentPage);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      fetchAssistants(page);
    }
  };

  const bulkDelete = async (ids: number[]) => {
    await assistantTeacherService.bulkDeleteAssistantTeachers(ids);
    setSelectedAssistants(new Set());
    await fetchAssistants(currentPage);
  };

  const bulkForceDelete = async (ids: number[]) => {
    await assistantTeacherService.bulkForceDeleteAssistantTeachers(ids);
    setSelectedAssistants(new Set());
    await fetchAssistants(currentPage);
  };

  const bulkRestore = async (ids: number[]) => {
    await assistantTeacherService.bulkRestoreAssistantTeachers(ids);
    setSelectedAssistants(new Set());
    await fetchAssistants(currentPage);
  };

  useEffect(() => {
    fetchAssistants(1);
  }, [showDeleted, fetchAssistants]);

  return {
    assistants,
    loading,
    total,
    currentPage,
    lastPage,
    showDeleted,
    setShowDeleted,
    selectedAssistants,
    setSelectedAssistants,
    createAssistant,
    updateAssistant,
    deleteAssistant,
    forceDeleteAssistant,
    restoreAssistant,
    toggleActive,
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore,
  };
}