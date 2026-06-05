// src/hooks/useTeachers.ts

import { useState, useEffect, useCallback } from 'react';
import { teacherService } from '@/services/teacher.service';
import type { Teacher, TeacherFilters, TeacherFormData } from '@/types/teacher.types';

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false); // 🔥 starts as true
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<Set<number>>(new Set());





  
  const fetchTeachers = useCallback(async (
    page = 1,
    search?: string,
    filters?: TeacherFilters
  ) => {
    setLoading(false);
    try {
      const response = await teacherService.getAllTeachers(
        filters,
        10,
        page,
        search,
        showDeleted
      );
      setTeachers(response.data);
      setTotal(response.meta.total);
      setCurrentPage(response.meta.currentPage);
      setLastPage(response.meta.lastPage);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);






  
  const createTeacher = async (data: TeacherFormData) => {
    const newTeacher = await teacherService.createTeacher(data);
    await fetchTeachers(currentPage);
    return newTeacher;
  };

  const updateTeacher = async (id: number, data: Partial<TeacherFormData>) => {
    const updated = await teacherService.updateTeacher(id, data);
    await fetchTeachers(currentPage);
    return updated;
  };

  const deleteTeacher = async (id: number) => {
    await teacherService.deleteTeacher(id);
    await fetchTeachers(currentPage);
  };

  const forceDeleteTeacher = async (id: number) => {
    await teacherService.forceDeleteTeacher(id);
    await fetchTeachers(currentPage);
  };

  const restoreTeacher = async (id: number) => {
    await teacherService.restoreTeacher(id);
    await fetchTeachers(currentPage);
  };

  const toggleActive = async (id: number) => {
    await teacherService.toggleTeacherActive(id);
    await fetchTeachers(currentPage);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      fetchTeachers(page);
    }
  };

  const bulkDelete = async (ids: number[]) => {
    await teacherService.bulkDeleteTeachers(ids);
    setSelectedTeachers(new Set());
    await fetchTeachers(currentPage);
  };

  const bulkForceDelete = async (ids: number[]) => {
    await teacherService.bulkForceDeleteTeachers(ids);
    setSelectedTeachers(new Set());
    await fetchTeachers(currentPage);
  };

  const bulkRestore = async (ids: number[]) => {
    await teacherService.bulkRestoreTeachers(ids);
    setSelectedTeachers(new Set());
    await fetchTeachers(currentPage);
  };

  useEffect(() => {
    fetchTeachers(1);
  }, [showDeleted, fetchTeachers]);

  return {
    teachers,
    loading,
    total,
    currentPage,
    lastPage,
    showDeleted,
    setShowDeleted,
    selectedTeachers,
    setSelectedTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    forceDeleteTeacher,
    restoreTeacher,
    toggleActive,
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore,
  };
}