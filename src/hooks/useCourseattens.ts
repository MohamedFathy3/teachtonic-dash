/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/StudentAttendance/hooks/useCourses.ts

import { useState, useEffect, useCallback } from 'react';
import { AttendanceService } from '@/services/Attendance.Service';
import { Course } from '../types/attendance.types';

export const useCourses = (teacherId?: number) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!teacherId) {
      setCourses([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await AttendanceService.getCourses(teacherId);
      setCourses(data?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, fetchCourses };
};