/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/StudentAttendance/hooks/useAttendance.ts

import { useState } from 'react';
import { toast  } from "@/hooks/use-toast";
import { AttendanceService } from '@/services/Attendance.Service';

export const useAttendance = () => {
  const [recording, setRecording] = useState(false);

  const recordAttendance = async (studentId: number, attended: boolean, lessonId: number) => {
    setRecording(true);
    try {
      await AttendanceService.recordAttendance(lessonId, studentId, attended);
      
      toast.success(
        attended 
          ? '✅ Attendance recorded successfully' 
          : '✅ Absence recorded successfully'
      );
      
      return true;
    } catch (error: any) {
      console.error('Error recording attendance:', error);
      toast.error(error.response?.data?.message || '❌ An error occurred');
      return false;
    } finally {
      setRecording(false);
    }
  };

  const recordBatchAttendance = async (studentIds: number[], lessonId: number) => {
    setRecording(true);
    try {
      await AttendanceService.recordBatchAttendance(lessonId, studentIds, true);
      
      toast.success(`✅ ${studentIds.length} students recorded successfully`);
      return true;
    } catch (error: any) {
      console.error('Error recording batch attendance:', error);
      toast.error(error.response?.data?.message || '❌ An error occurred');
      return false;
    } finally {
      setRecording(false);
    }
  };

  return { recording, recordAttendance, recordBatchAttendance };
};