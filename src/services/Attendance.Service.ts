/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/StudentAttendance/services/AttendanceService.ts

import api from '@/lib/api';

export class AttendanceService {
  
  // ✅ جلب الكورسات مع فلترة حسب المرحلة
  static async getCourses(
    teacherId: number, 
    page: number = 1, 
    perPage: number = 10,
    stageId?: number | null
  ) {
    const filters: any = { 
      teacher_id: teacherId, 
      type: 'center' 
    };

    if (stageId) {
      filters.stage_id = stageId;
    }

    console.log('📡 Fetching courses with filters:', filters);

    const response = await api.post('/course/index', {
      filters,
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage,
      page,
      paginate: true,
      delete: false,
    });

    console.log('📥 Courses response:', response.data);
    return response.data;
  }

  // ✅ جلب الدروس لكورس معين
  static async getLessons(courseId: number, page: number = 1, perPage: number = 100) {
    console.log('📡 Fetching lessons for course_id:', courseId);
    
    try {
      const response = await api.post('/course-detail/index', {
        filters: { 
          course_id: courseId 
        },
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage,
        page,
        paginate: true,
        delete: false,
      });
      
      console.log('📥 Lessons response:', response.data);
      
      if (!response.data) {
        console.warn('⚠️ No data in response');
        return { data: [], meta: { total: 0 } };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching lessons:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  }

  // ✅ جلب الطالب باستخدام الباركود
  static async getStudentByBarcode(barcode: string, teacherId: number) {
    console.log('📡 Fetching student by barcode:', barcode);
    
    const response = await api.post('/student/index', {
      filters: {
        barcode: barcode,
        teacher_id: teacherId,
      },
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage: 1,
      page: 1,
      paginate: true,
      delete: false,
    });
    
    console.log('📥 Student response:', response.data);
    return response.data;
  }

  // ✅ جلب الطالب باستخدام ID
  static async getStudentById(studentId: number, teacherId: number) {
    const response = await api.post('/student/index', {
      filters: {
        id: studentId,
        teacher_id: teacherId,
      },
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage: 1,
      page: 1,
      paginate: true,
      delete: false,
    });
    return response.data;
  }

  // ✅ تسجيل حضور طالب واحد
  static async recordAttendance(lessonId: number, studentId: number) {
    console.log('📝 Recording attendance:', { lessonId, studentId });
    
    try {
      const response = await api.post('/all/course-detail-attendance', {
        course_detail_id: lessonId,
        student_id: studentId,
      });
      
      console.log('✅ Attendance recorded:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error recording attendance:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  }

  // ✅ تسجيل حضور دفعة
  static async recordBatchAttendance(lessonId: number, studentIds: number[]) {
    console.log('📝 Recording batch attendance:', { lessonId, studentIds });
    
    const response = await api.post('/course-detail-attendance/batch', {
      course_detail_id: lessonId,
      student_ids: studentIds,
    });
    
    console.log('✅ Batch attendance recorded:', response.data);
    return response.data;
  }

  // ✅ التحقق من حالة حضور طالب
  static async checkStudentAttendance(lessonId: number, studentId: number) {
    const response = await api.post('/course-detail-attendance/check', {
      course_detail_id: lessonId,
      student_id: studentId,
    });
    return response.data;
  }

  // ✅ جلب قائمة الحضور لدرس معين
  static async getAttendanceList(lessonId: number, page: number = 1, perPage: number = 10) {
    const response = await api.post('/attendance/index', {
      filters: {
        course_detail_id: lessonId,
      },
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage,
      page,
      paginate: true,
      delete: false,
    });
    return response.data;
  }

  static async deleteAttendance(attendanceId: number) {
    const response = await api.delete(`/attendance/${attendanceId}`);
    return response.data;
  }
}