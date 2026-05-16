/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useCourses.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { courseService } from '@/services/course.service';
import type { Course, CourseFormData } from '@/types/course.types';
import { useApp } from '@/contexts/AppContext';

interface UseCoursesOptions {
  instructorId?: number;
  autoFetch?: boolean;
}

export const useCourses = (options: UseCoursesOptions = {}) => {
  const { instructorId, autoFetch = true } = options;
  const { user } = useApp();
  const [courses, setCourses] = useState<Course[]>([]);
  const [deletedCourses, setDeletedCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 12,
  });
  
  const isMounted = useRef(true);

  // ✅ جلب الكورسات النشطة
  const fetchCourses = useCallback(async (page = 1, search = '') => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const id = instructorId || user?.id;
      if (!id) {
        setCourses([]);
        return;
      }
      
      const response = await courseService.getAllCourses(
        { teacher_id: id },
        12,
        page,
        search,
        false
      );
      
      if (!isMounted.current) return;
      
      setCourses(response.data || []);
      setPagination({
        currentPage: response.meta?.current_page || 1,
        lastPage: response.meta?.last_page || 1,
        total: response.meta?.total || 0,
        perPage: response.meta?.per_page || 12,
      });
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to fetch courses');
      setCourses([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [instructorId, user?.id]);

  // ✅ جلب الكورسات المحذوفة
  const fetchDeletedCourses = useCallback(async (page = 1, search = '') => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const id = instructorId || user?.id;
      if (!id) {
        setDeletedCourses([]);
        return;
      }
      
      const response = await courseService.getDeletedCourses(12, page, search);
      
      if (!isMounted.current) return;
      
      setDeletedCourses(response.data || []);
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error('Error fetching deleted courses:', err);
      setError(err.message || 'Failed to fetch deleted courses');
      setDeletedCourses([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [instructorId, user?.id]);

  const fetchCourseById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const course = await courseService.getCourse(id);
      setSelectedCourse(course);
      return course;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch course details');
      console.error('Error fetching course:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCourse = useCallback(async (data: CourseFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newCourse = await courseService.createCourse(data);
      setCourses(prev => [newCourse, ...prev]);
      return newCourse;
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCourse = useCallback(async (id: number, data: Partial<CourseFormData>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedCourse = await courseService.updateCourse(id, data);
      setCourses(prev => prev.map(c => c.id === id ? updatedCourse : c));
      if (selectedCourse?.id === id) {
        setSelectedCourse(updatedCourse);
      }
      return updatedCourse;
    } catch (err: any) {
      setError(err.message || 'Failed to update course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  const deleteCourse = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await courseService.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreCourse = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const restored = await courseService.restoreCourse(id);
      setDeletedCourses(prev => prev.filter(c => c.id !== id));
      setCourses(prev => [restored, ...prev]);
      return restored;
    } catch (err: any) {
      setError(err.message || 'Failed to restore course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const forceDeleteCourse = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await courseService.forceDeleteCourse(id);
      setDeletedCourses(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to force delete course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleActive = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await courseService.toggleCourseActive(id);
      // تحديث الحالة في القوائم
      setCourses(prev => prev.map(c => 
        c.id === id ? { ...c, active: c.active === 1 ? 0 : 1 } : c
      ));
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to toggle course status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ التحقق التلقائي عند تغيير المعطيات
  useEffect(() => {
    if (autoFetch && (instructorId || user?.id)) {
      fetchCourses();
      fetchDeletedCourses();
    }
  }, [autoFetch, instructorId, user?.id, fetchCourses, fetchDeletedCourses]);

  // ✅ تنظيف
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    // بيانات
    courses,
    deletedCourses,
    selectedCourse,
    loading,
    error,
    pagination,
    
    // دوال الجلب
    fetchCourses,
    fetchDeletedCourses,
    fetchCourseById,
    
    // دوال CRUD
    createCourse,
    updateCourse,
    deleteCourse,
    restoreCourse,
    forceDeleteCourse,
    toggleActive,
  };
};