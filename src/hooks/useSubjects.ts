/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useSubjects.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { subjectService } from '@/services/subject.service';
import type { Subject, SubjectFilters } from '@/types/subject.types';

interface UseSubjectsReturn {
  subjects: Subject[];
  loading: boolean;
  total: number;
  perPage: number;
  filters: SubjectFilters;
  searchQuery: string;
  showDeleted: boolean;
  selectedSubjects: Set<number>;
  setSelectedSubjects: (ids: Set<number>) => void;
  setShowDeleted: (show: boolean) => void;
  setFilters: (filters: SubjectFilters) => void;
  setPerPage: (perPage: number) => void;
  setSearchQuery: (query: string) => void;
  fetchSubjects: () => Promise<void>;
  createSubject: (data: any) => Promise<void>;
  updateSubject: (id: number, data: any) => Promise<void>;
  deleteSubject: (id: number) => Promise<void>;
  forceDeleteSubject: (id: number) => Promise<void>;
  restoreSubject: (id: number) => Promise<void>;
  toggleActive: (id: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
  bulkForceDelete: (ids: number[]) => Promise<void>;
  bulkRestore: (ids: number[]) => Promise<void>;
}

export const useSubjects = (): UseSubjectsReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10000);
  const [filters, setFilters] = useState<SubjectFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<number>>(new Set());
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchSubjects = useCallback(async () => {
    if (!isMounted.current) return;
    
    setLoading(true);
    try {
      const response = await subjectService.getAllSubjects(
        filters, 
        perPage,
        searchQuery,
        showDeleted
      );
      if (isMounted.current) {
        setSubjects(response.data || []);
        setTotal(response.data?.length || 0);
        setSelectedSubjects(new Set());
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [filters, perPage, searchQuery, showDeleted]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const createSubject = useCallback(async (data: any) => {
    await subjectService.createSubject(data);
    await fetchSubjects();
  }, [fetchSubjects]);

  const updateSubject = useCallback(async (id: number, data: any) => {
    await subjectService.updateSubject(id, data);
    await fetchSubjects();
  }, [fetchSubjects]);

  const deleteSubject = useCallback(async (id: number) => {
    await subjectService.deleteSubject(id);
    await fetchSubjects();
  }, [fetchSubjects]);

  const forceDeleteSubject = useCallback(async (id: number) => {
    await subjectService.forceDeleteSubject(id);
    await fetchSubjects();
  }, [fetchSubjects]);

  const restoreSubject = useCallback(async (id: number) => {
    await subjectService.restoreSubject(id);
    await fetchSubjects();
  }, [fetchSubjects]);

  const bulkDelete = useCallback(async (ids: number[]) => {
    await subjectService.bulkDeleteSubjects(ids);
    await fetchSubjects();
  }, [fetchSubjects]);

  const bulkForceDelete = useCallback(async (ids: number[]) => {
    await subjectService.bulkForceDeleteSubjects(ids);
    await fetchSubjects();
  }, [fetchSubjects]);

  const bulkRestore = useCallback(async (ids: number[]) => {
    await subjectService.bulkRestoreSubjects(ids);
    await fetchSubjects();
  }, [fetchSubjects]);

  const toggleActive = useCallback(async (id: number) => {
    try {
      await subjectService.toggleSubjectActive(id);
      setSubjects(prevSubjects => 
        prevSubjects.map(subject => 
          subject.id === id 
            ? { ...subject, active: !subject.active }
            : subject
        )
      );
    } catch (error) {
      console.error('Failed to toggle subject status:', error);
    }
  }, []);

  const handleSetFilters = useCallback((newFilters: SubjectFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSetPerPage = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    subjects,
    loading,
    total,
    perPage,
    filters,
    searchQuery,
    showDeleted,
    selectedSubjects,
    setSelectedSubjects,
    setShowDeleted,
    setFilters: handleSetFilters,
    setPerPage: handleSetPerPage,
    setSearchQuery: handleSetSearchQuery,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    forceDeleteSubject,
    restoreSubject,
    toggleActive,
    bulkDelete,
    bulkForceDelete,
    bulkRestore,
  };
};