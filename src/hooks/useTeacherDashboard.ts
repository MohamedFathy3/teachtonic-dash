import { useCallback, useEffect, useMemo, useState } from 'react';
import teachersService from '@/services/teachers.service';

import { TeacherResponse } from '@/types/teacherProfile.types';
import { DashboardCourse } from '@/types/dashboard.types';
import { Student } from '@/types/student.types';
import { Assignment } from '@/types/assignment.types';

export function useTeacherDashboard(teacherId: number) {
  const [teacherData, setTeacherData] = useState<TeacherResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // ================= FETCH TEACHER =================
  const fetchTeacher = useCallback(async () => {
    try {
      setLoading(true);

      const response = await teachersService.getTeacherById(teacherId);

      setTeacherData(response);
    } catch (error) {
      console.error('Error fetching teacher:', error);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchTeacher();
  }, [fetchTeacher]);

  // ================= COURSES =================
  const dashboardCourses: DashboardCourse[] = useMemo(() => {
    if (!teacherData?.website?.courses) return [];

    return teacherData.website.courses.map((course) => {
      const lessons = course.details ?? [];

      const examsCount = lessons.reduce(
        (acc, d) => acc + (d.exams?.length ?? 0),
        0
      );

      const assignmentsCount = lessons.reduce(
        (acc, d) => acc + (d.assignments?.length ?? 0),
        0
      );

      return {
        id: course.id,
        title: course.title || 'Untitled Course',
        category: course.semester?.name ?? 'General',
        students: course.count_student ?? 0,
        price: Number(course.price ?? 0),
        priceBeforeDiscount: Number(course.price_before_discount ?? 0),
        discount: Number(course.discount ?? 0),
        status: course.active ? 'published' : 'draft',
        image: course.imageUrl ?? '',
        semesterName: course.semester?.name,
        lessonsCount: lessons.length,
        examsCount,
        assignmentsCount,
        description: course.description,
        stageId: course.stage_id,
        subjectId: course.subject_id,
        startDate: course.start_date,
        endDate: course.end_date,
        active: !!course.active,
        totalContent: lessons.length + examsCount + assignmentsCount,
      };
    });
  }, [teacherData]);

  // ================= STUDENTS =================
  const dashboardStudents: Student[] = useMemo(() => {
    if (!teacherData?.website?.courses) return [];

    const studentsMap = new Map<number, Student>();

    teacherData.website.courses.forEach((course) => {
      const enrolledStudents = (course as any).students ?? [];

      enrolledStudents.forEach((student: any) => {
        const existingStudent = studentsMap.get(student.id);

        const lessons = course.details ?? [];

        const examsCount = lessons.reduce(
          (acc, lesson) => acc + (lesson.exams?.length ?? 0),
          0
        );

        const assignmentsCount = lessons.reduce(
          (acc, lesson) => acc + (lesson.assignments?.length ?? 0),
          0
        );

        const studentData: Student = {
          id: student.id,
          name: student.name ?? 'Unknown Student',
          email: student.email ?? 'No Email',
          phone: student.phone,
          avatar: student.name?.charAt(0)?.toUpperCase() ?? 'S',
          progress: student.progress ?? Math.floor(Math.random() * 100),
          status: student.active === false ? 'inactive' : 'active',
          enrolledCourses: (existingStudent?.enrolledCourses ?? 0) + 1,
          completedCourses: student.completed_courses ?? 0,
          totalAssignments:
            (existingStudent?.totalAssignments ?? 0) + assignmentsCount,
          totalExams: (existingStudent?.totalExams ?? 0) + examsCount,
          totalPoints: student.total_points ?? 0,
          lastActive: student.last_active ?? 'Recently Active',
        };

        studentsMap.set(student.id, studentData);
      });
    });

    return Array.from(studentsMap.values());
  }, [teacherData]);

  // ================= ASSIGNMENTS =================
  const dashboardAssignments = useMemo(() => {
    if (!teacherData?.website?.courses) return [];

    const assignmentsMap = new Map<number, Assignment>();

    teacherData.website.courses.forEach((course) => {
      const lessons = course.details ?? [];

      lessons.forEach((lesson) => {
        const assignments = lesson.assignments ?? [];

        assignments.forEach((assignment: Assignment) => {
          assignmentsMap.set(assignment.id, {
            ...assignment,
          });
        });
      });
    });

    return Array.from(assignmentsMap.values());
  }, [teacherData]);

  // ================= EXAMS =================
  const dashboardExams = useMemo(() => {
    if (!teacherData?.website?.courses) return [];

    const examsMap = new Map();

    teacherData.website.courses.forEach((course) => {
      const lessons = course.details ?? [];

      lessons.forEach((lesson) => {
        const exams = lesson.exams ?? [];

        exams.forEach((exam) => {
          examsMap.set(exam.id, {
            ...exam,
            courseTitle: course.title,
            lessonTitle: lesson.title,
          });
        });
      });
    });

    return Array.from(examsMap.values());
  }, [teacherData]);

  // ================= BOOKS =================
  const dashboardBooks = useMemo(() => {
    if (!teacherData?.website?.books) return [];

    return teacherData.website.books.map((book) => ({
      id: book.id,
      title: book.title,
      writer: book.writer,
      price: Number(book.price ?? 0),
      pagesCount: book.pages_count ?? 0,
      active: !!book.active,
      imageUrl: book.imageUrl,
      createdAt: book.createdAt,
    }));
  }, [teacherData]);

  return {
    teacherData,
    loading,
    fetchTeacher,

    dashboardCourses,
    dashboardStudents,
    dashboardAssignments,
    dashboardExams,
    dashboardBooks,
  };
}