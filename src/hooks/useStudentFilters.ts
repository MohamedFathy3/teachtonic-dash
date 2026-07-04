// src/hooks/lesson/useStudentFilters.ts

import { useState, useMemo } from 'react';
import type { Student, StudentFilters, Stats } from '@/types/lesson.types';

export const useStudentFilters = (students: Student[] = []) => {
  const [filters, setFilters] = useState<StudentFilters>({
    search: '',
    typeOfAttendance: '',
    active: '',
    attended: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredStudents = useMemo(() => {
    let filtered = students;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(searchTerm) ||
        s.id?.toString().includes(searchTerm)
      );
    }

    if (filters.typeOfAttendance) {
      filtered = filtered.filter(s => s.type_of_attendance === filters.typeOfAttendance);
    }

    if (filters.active !== '') {
      filtered = filtered.filter(s => s.active === (filters.active === 'active'));
    }

    if (filters.attended !== '') {
      filtered = filtered.filter(s => s.attended === (filters.attended === 'attended'));
    }

    return filtered;
  }, [students, filters]);

  const stats: Stats = {
    total: students.length,
    active: students.filter(s => s.active).length,
    inactive: students.filter(s => !s.active).length,
    online: students.filter(s => s.type_of_attendance === 'online').length,
    center: students.filter(s => s.type_of_attendance === 'center').length,
    attended: students.filter(s => s.attended).length,
    absent: students.filter(s => !s.attended).length,
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      typeOfAttendance: '',
      active: '',
      attended: '',
    });
    setShowFilters(false);
  };

  const hasActiveFilters = !!(filters.search || filters.typeOfAttendance || filters.active || filters.attended);

  return {
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    filteredStudents,
    stats,
    clearFilters,
    hasActiveFilters,
  };
};