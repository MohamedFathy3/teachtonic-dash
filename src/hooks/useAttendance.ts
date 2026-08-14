/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/StudentAttendance/hooks/useAttendance.ts

import { useState, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { AttendanceService } from '@/services/Attendance.Service';

export const useAttendance = () => {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // ✅ جلب الدروس
  const fetchLessons = useCallback(async (courseId: number, lang: string = 'en') => {
    const isRTL = lang === 'ar';
    
    if (!courseId) {
      console.warn('⚠️ No course ID provided');
      setLessons([]);
      return [];
    }

    setLoadingLessons(true);
    setError(null);

    try {
      console.log('🔍 Fetching lessons for course:', courseId);
      
      const response = await AttendanceService.getLessons(courseId, 1, 100);
      
      let lessonsData = [];
      
      if (response?.data) {
        lessonsData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        lessonsData = response;
      }
      
      console.log('📚 Lessons data:', lessonsData);
      console.log('📊 Number of lessons:', lessonsData.length);
      
      setLessons(lessonsData);
      
      if (lessonsData.length === 0) {
        toast.info(isRTL ? 'لا توجد دروس في هذا الكورس' : 'No lessons found for this course');
      }
      
      return lessonsData;
    } catch (error: any) {
      console.error('❌ Error fetching lessons:', error);
      setError(error.message);
      setLessons([]);
      return [];
    } finally {
      setLoadingLessons(false);
    }
  }, []);

  // ✅ تسجيل حضور طالب واحد (المهمة الأساسية)
  const recordAttendance = useCallback(async (
    studentId: number, 
    attended: boolean, 
    lessonId: number,
    lang: string = 'en'
  ) => {
    const isRTL = lang === 'ar';
    setRecording(true);
    setError(null);

    try {
      // ✅ التحقق من صحة البيانات
      if (!studentId) {
        throw new Error(isRTL ? 'معرف الطالب مطلوب' : 'Student ID is required');
      }
      
      if (!lessonId) {
        throw new Error(isRTL ? 'معرف الدرس مطلوب' : 'Lesson ID is required');
      }

      console.log('📝 Recording attendance with:', {
        studentId,
        lessonId,
        attended,
        type: attended ? 'present' : 'absent',
      });

      // ✅ استدعاء الـ Service
      const response = await AttendanceService.recordAttendance(lessonId, studentId);
      
      console.log('✅ Attendance recorded successfully:', response);

      toast.success(
        attended 
          ? (isRTL ? '✅ تم تسجيل الحضور بنجاح' : '✅ Attendance recorded successfully')
          : (isRTL ? '✅ تم تسجيل الغياب بنجاح' : '✅ Absence recorded successfully')
      );
      
      return true;
    } catch (error: any) {
      console.error('❌ Error recording attendance:', error);
      console.error('❌ Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      
      toast.error(
        errorMessage || (isRTL ? '❌ حدث خطأ في تسجيل الحضور' : '❌ An error occurred while recording attendance')
      );
      
      return false;
    } finally {
      setRecording(false);
    }
  }, []);

  // ✅ تسجيل حضور دفعة
  const recordBatchAttendance = useCallback(async (
    studentIds: number[], 
    lessonId: number,
    lang: string = 'en'
  ) => {
    const isRTL = lang === 'ar';
    setRecording(true);
    setError(null);

    try {
      if (!studentIds || studentIds.length === 0) {
        throw new Error(isRTL ? 'يجب تحديد طالب واحد على الأقل' : 'At least one student is required');
      }
      
      if (!lessonId) {
        throw new Error(isRTL ? 'معرف الدرس مطلوب' : 'Lesson ID is required');
      }

      console.log('📝 Recording batch attendance:', {
        studentIds,
        count: studentIds.length,
        lessonId,
      });

      const response = await AttendanceService.recordBatchAttendance(lessonId, studentIds);
      
      console.log('✅ Batch attendance recorded:', response);

      toast.success(
        isRTL 
          ? `✅ تم تسجيل ${studentIds.length} طالب بنجاح`
          : `✅ ${studentIds.length} students recorded successfully`
      );
      
      return true;
    } catch (error: any) {
      console.error('❌ Error recording batch attendance:', error);
      
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      
      toast.error(
        errorMessage || (isRTL ? '❌ حدث خطأ في تسجيل الحضور' : '❌ An error occurred while recording attendance')
      );
      
      return false;
    } finally {
      setRecording(false);
    }
  }, []);

  return {
    recording,
    error,
    lessons,
    loadingLessons,
    fetchLessons,
    recordAttendance,
    recordBatchAttendance,
  };
};