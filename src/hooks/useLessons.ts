/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/StudentAttendance/hooks/useLessons.ts

import { useState, useEffect, useCallback } from 'react';
import { AttendanceService } from '@/services/Attendance.Service';
import { Lesson } from '../types/attendance.types';

export const useLessons = (courseId?: number | null) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!courseId) {
      setLessons([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await AttendanceService.getLessons(courseId);
      setLessons(data?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch lessons');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return { lessons, loading, error, fetchLessons };
};