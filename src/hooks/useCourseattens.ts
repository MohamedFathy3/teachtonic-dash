// src/pages/instructor/StudentAttendance/hooks/useCourses.ts

import { useState, useEffect, useCallback } from 'react';
import { AttendanceService } from '@/services/Attendance.Service';
import { Course } from '../types/attendance.types';

interface UseCoursesOptions {
  teacherId?: number;
  stageId?: number | null;  // ✅ إضافة فلترة المرحلة
  page?: number;
  perPage?: number;
}

export const useCourses = ({ 
  teacherId, 
  stageId,
  page = 1,
  perPage = 10
}: UseCoursesOptions = {}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchCourses = useCallback(async () => {
    if (!teacherId) {
      setCourses([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await AttendanceService.getCourses(teacherId, page, perPage, stageId);
      
      const coursesData = data?.data || data || [];
      setCourses(coursesData);
      setTotal(data?.total || coursesData.length);
      
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to fetch courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [teacherId, stageId, page, perPage]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { 
    courses, 
    loading, 
    error, 
    total,
    fetchCourses,
    refetch: fetchCourses 
  };
};