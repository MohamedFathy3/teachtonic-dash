// src/hooks/useTeachers.ts

import { useState, useEffect, useCallback } from 'react';
import { teacherService } from '@/services/teacher.service';
import type { Teacher, TeacherFormData } from '@/types/teacher.types';

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<Set<number>>(new Set());

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await teacherService.getAllTeachers(
        {}, // filters
        perPage,
        currentPage,
        searchQuery,
        showDeleted
      );
      
      console.log('📊 Teachers Response:', response);
      
      setTeachers(response.data);
      setTotal(response.total);
      setCurrentPage(response.current_page);
      setLastPage(response.last_page);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchQuery, showDeleted]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
      setSelectedTeachers(new Set());
    }
  };

  const createTeacher = async (data: TeacherFormData) => {
    const result = await teacherService.createTeacher(data);
    await fetchTeachers();
    return result;
  };

  const updateTeacher = async (id: number, data: Partial<TeacherFormData>) => {
    const result = await teacherService.updateTeacher(id, data);
    await fetchTeachers();
    return result;
  };

  const deleteTeacher = async (id: number) => {
    await teacherService.deleteTeacher(id);
    await fetchTeachers();
  };

  const forceDeleteTeacher = async (id: number) => {
    await teacherService.forceDeleteTeacher(id);
    await fetchTeachers();
  };

  const restoreTeacher = async (id: number) => {
    const result = await teacherService.restoreTeacher(id);
    await fetchTeachers();
    return result;
  };

  const toggleActive = async (id: number) => {
    const result = await teacherService.toggleTeacherActive(id);
    await fetchTeachers();
    return result;
  };

  const bulkDelete = async (ids: number[]) => {
    await teacherService.bulkDeleteTeachers(ids);
    setSelectedTeachers(new Set());
    await fetchTeachers();
  };

  const bulkForceDelete = async (ids: number[]) => {
    await teacherService.bulkForceDeleteTeachers(ids);
    setSelectedTeachers(new Set());
    await fetchTeachers();
  };

  const bulkRestore = async (ids: number[]) => {
    await teacherService.bulkRestoreTeachers(ids);
    setSelectedTeachers(new Set());
    await fetchTeachers();
  };

  return {
    teachers,
    loading,
    total,
    currentPage,
    lastPage,
    perPage,
    searchQuery,
    setSearchQuery,
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
    refetch: fetchTeachers,
  };
}