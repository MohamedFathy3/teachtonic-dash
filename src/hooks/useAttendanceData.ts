// src/hooks/lesson/useAttendanceData.ts

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { toast } from "@/hooks/use-toast";
import api from '@/lib/api';
import type { AttendanceRecord } from '@/types/lesson.types';

export const useAttendanceData = (lessonId: number) => {
  const { lang } = useApp();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      // ✅ استخدام POST مع body
      const response = await api.post(`/all/course-detail-attendance`, {
        course_detail_id: lessonId
      });
      setAttendanceData(response.data?.data || []);
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل بيانات الحضور' : 'Error loading attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [lessonId]);

  const attendanceStats = {
    total: attendanceData.length,
    attended: attendanceData.filter(a => a.attended === 1).length,
    absent: attendanceData.filter(a => a.attended === 0).length,
    online: attendanceData.filter(a => a.student?.type_of_attendance === 'online').length,
    center: attendanceData.filter(a => a.student?.type_of_attendance === 'center').length,
  };

  return { attendanceData, attendanceStats, loading, refetch: fetchAttendance };
};