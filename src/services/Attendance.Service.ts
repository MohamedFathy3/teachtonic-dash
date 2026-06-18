// src/pages/instructor/StudentAttendance/services/AttendanceService.ts

import api from '@/lib/api';

export class AttendanceService {
  
  static async getCourses(teacherId: number, page: number = 1, perPage: number = 10) {
    const response = await api.post('/course/index', {
      filters: { teacher_id: teacherId, type: 'center' },
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage,
      page,
      paginate: true,
      delete: false,
    });
    return response.data;
  }

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

  // O - Open/Closed: نقدر نضيف دوال جديدة من غير ما نعدل القديمة
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

  // Batch attendance recording
  static async recordBatchAttendance(lessonId: number, studentIds: number[], attended: boolean = true) {
    const response = await api.post('/course-detail-attendance/batch', {
      course_detail_id: lessonId,
      student_ids: studentIds,
      attended,
    });
    return response.data;
  }
}