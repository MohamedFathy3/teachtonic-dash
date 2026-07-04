/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/lesson/export.service.ts

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "@/hooks/use-toast";
import type { Student, AttendanceRecord } from '@/types/lesson.types';

export class ExportService {
  static exportStudentsToExcel(
    students: Student[],
    lessonId: string,
    lang: string,
    exams: any[] = [],
    assignments: any[] = []
  ): void {
    const filteredData = students.map((student, index) => {
      const examMarks: Record<string, string> = {};
      exams?.forEach(exam => {
        const studentExam = (student as any).exam_marks?.find((em: any) => em.exam_id === exam.id);
        const mark = studentExam?.mark ?? '—';
        const total = exam.total_marks;
        const passed = studentExam ? (studentExam.mark >= exam.total_must_pass_marks ? 'ناجح' : 'راسب') : '—';
        examMarks[`امتحان: ${exam.title}`] = `${mark} / ${total} (${passed})`;
      });

      const assignmentMarks: Record<string, string> = {};
      assignments?.forEach(assignment => {
        const studentAssignment = (student as any).assignment_marks?.find((am: any) => am.assignment_id === assignment.id);
        const mark = studentAssignment?.mark ?? '—';
        const total = assignment.total_marks;
        const passed = studentAssignment ? (studentAssignment.mark >= assignment.total_must_pass_marks ? 'ناجح' : 'راسب') : '—';
        assignmentMarks[`واجب: ${assignment.title}`] = `${mark} / ${total} (${passed})`;
      });

      const isOnline = student.type_of_attendance === 'online';

      return {
        [lang === 'ar' ? '#' : 'No']: index + 1,
        [lang === 'ar' ? 'الرقم' : 'ID']: student.id,
        [lang === 'ar' ? 'الاسم' : 'Name']: student.name,
        [lang === 'ar' ? 'الهاتف' : 'Phone']: student.phone,
        [lang === 'ar' ? 'نوع الحضور' : 'Attendance Type']: isOnline ? (lang === 'ar' ? 'أونلاين' : 'Online') : (lang === 'ar' ? 'سنتر' : 'Center'),
        [lang === 'ar' ? 'الحالة' : 'Status']: student.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive'),
        [lang === 'ar' ? 'حضور الدرس' : 'Lesson Attendance']: isOnline 
          ? (student.attended ? (lang === 'ar' ? 'حاضر' : 'Attended') : '—')
          : (student.attended ? (lang === 'ar' ? 'حاضر' : 'Attended') : (lang === 'ar' ? 'غائب' : 'Absent')),
        [lang === 'ar' ? 'المحافظة' : 'Governorate']: student.governorate || '—',
        [lang === 'ar' ? 'المدرسة' : 'School']: student.school_name || '—',
        ...examMarks,
        ...assignmentMarks,
      };
    });

    if (filteredData.length === 0) {
      toast.warning(lang === 'ar' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

    const fileName = `lesson_${lessonId}_students_${new Date().toISOString().split('T')[0]}.xlsx`;
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const colWidths = Object.keys(filteredData[0] || {}).map((key) => ({
      wch: Math.max(key.length * 2, 15)
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, lang === 'ar' ? 'طلاب الدرس' : 'Lesson Students');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
    
    toast.success(lang === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully');
  }

  static exportAttendanceToExcel(
    attendanceData: AttendanceRecord[],
    lessonId: string,
    lang: string
  ): void {
    const filteredData = attendanceData.map((item, index) => ({
      [lang === 'ar' ? '#' : 'No']: index + 1,
      [lang === 'ar' ? 'رقم الطالب' : 'Student ID']: item.student?.id || '—',
      [lang === 'ar' ? 'اسم الطالب' : 'Student Name']: item.student?.name || '—',
      [lang === 'ar' ? 'الهاتف' : 'Phone']: item.student?.phone || '—',
      [lang === 'ar' ? 'نوع الحضور' : 'Attendance Type']: item.student?.type_of_attendance === 'online' ? (lang === 'ar' ? 'أونلاين' : 'Online') : (lang === 'ar' ? 'سنتر' : 'Center'),
      [lang === 'ar' ? 'الحالة' : 'Status']: item.attended ? (lang === 'ar' ? '✅ حاضر' : '✅ Attended') : (lang === 'ar' ? '❌ غائب' : '❌ Absent'),
      [lang === 'ar' ? 'وقت الحضور' : 'Attendance Time']: item.attended_at ? new Date(item.attended_at).toLocaleString() : '—',
      [lang === 'ar' ? 'تاريخ التسجيل' : 'Registered Date']: item.student?.created_at ? new Date(item.student.created_at).toLocaleDateString() : '—',
    }));

    if (filteredData.length === 0) {
      toast.warning(lang === 'ar' ? 'لا توجد بيانات حضور للتصدير' : 'No attendance data to export');
      return;
    }

    const fileName = `attendance_lesson_${lessonId}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const colWidths = Object.keys(filteredData[0] || {}).map((key) => ({
      wch: Math.max(key.length * 2, 15)
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, lang === 'ar' ? 'حضور الدرس' : 'Lesson Attendance');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
    
    toast.success(lang === 'ar' ? 'تم تصدير بيانات الحضور بنجاح' : 'Attendance data exported successfully');
  }
}