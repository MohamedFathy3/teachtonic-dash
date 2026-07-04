// src/hooks/lesson/useAttendanceFilters.ts

import { useState, useMemo } from 'react';
import type { AttendanceRecord, AttendanceFilters } from '@/types/lesson.types';

export const useAttendanceFilters = (attendanceData: AttendanceRecord[] = []) => {
  const [filters, setFilters] = useState<AttendanceFilters>({
    search: '',
    attended: '',
  });

  const filteredAttendance = useMemo(() => {
    let filtered = attendanceData;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.student?.name?.toLowerCase().includes(searchTerm) ||
        item.student?.id?.toString().includes(searchTerm)
      );
    }

    if (filters.attended !== '') {
      filtered = filtered.filter(item => item.attended === parseInt(filters.attended));
    }

    return filtered;
  }, [attendanceData, filters]);

  return { filters, setFilters, filteredAttendance };
};