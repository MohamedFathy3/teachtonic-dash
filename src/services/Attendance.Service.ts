/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/StudentAttendance/services/AttendanceService.ts

import api from '@/lib/api';

export class AttendanceService {
  
  // ✅ جلب الكورسات مع فلترة حسب المرحلة
  static async getCourses(
    teacherId: number, 
    page: number = 1, 
    perPage: number = 10,
    stageId?: number | null  // ✅ إضافة فلترة المرحلة
  ) {
    // ✅ بناء الفلاتر
    const filters: any = { 
      teacher_id: teacherId, 
      type: 'center' 
    };

    // ✅ إضافة فلترة المرحلة لو موجودة
    if (stageId) {
      filters.stage_id = stageId;
    }

    const response = await api.post('/course/index', {
      filters,
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage,
      page,
      paginate: true,
      delete: false,
    });
    return response.data;
  }

  // ❌ مش محتاجين getStages و getSemesters لأننا بنستخدم useTeacherMeta
  // static async getStages() { ... }
  // static async getSemesters() { ... }

  static async getLessons(courseId: number, page: number = 1, perPage: number = 10) {
    const response = await api.post('/course-detail/index', {
      filters: { course_id: courseId },
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage,
      page,
      paginate: true,
      delete: false,
    });
    return response.data;
  }

  static async getStudentById(studentId: number, teacherId: number) {
    const response = await api.post('/student/index', {
      filters: {
        barcode: studentId,
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

  static async getStudentsByBatch(studentIds: number[], teacherId: number) {
    const response = await api.post('/student/batch', {
      filters: {
        barcode: studentIds,
        teacher_id: teacherId,
      },
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage: studentIds.length,
      page: 1,
      paginate: false,
      delete: false,
    });
    return response.data;
  }

  static async recordAttendance(lessonId: number, studentId: number, attended: boolean = true) {
    const response = await api.post('/course-detail-attendance', {
      course_detail_id: lessonId,
      student_id: studentId,
    });
    return response.data;
  }

  static async recordBatchAttendance(lessonId: number, studentIds: number[], attended: boolean = true) {
    const response = await api.post('/course-detail-attendance/batch', {
      course_detail_id: lessonId,
      student_ids: studentIds,
      attended,
    });
    return response.data;
  }
}