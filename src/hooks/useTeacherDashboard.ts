import { useCallback, useEffect, useMemo, useState } from 'react';
import teachersService from '@/services/teachers.service';

import { TeacherResponse } from '@/types/teacherProfile.types';
import { DashboardCourse } from '@/types/dashboard.types';
import { Student } from '@/types/student.types';
import { Assignment } from '@/types/assignment.types';

export function useTeacherDashboard(teacherId: number) {
  const [teacherData, setTeacherData] = useState<TeacherResponse | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);



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




  // ================= FETCH COURSES (الجديد!) =================
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teachersService.getTeacherCourses(teacherId);
      console.log("🚀 COURSES:", response);
      setCourses(response);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);
  const fetchStudents = useCallback(async () => {
    try {
      const response =
        await teachersService.getStudents();

      console.log("STUDENTS => ", response);

      setStudents(response);
    } catch (error) {
      console.error(
        "Error fetching students:",
        error
      );
    }
  }, []);


  useEffect(() => {
    fetchTeacher();
    fetchCourses();
    fetchStudents();
  }, [fetchTeacher, fetchCourses, fetchStudents]);


  // ================= COURSES =================
  const dashboardCourses: any[] = useMemo(() => {
    if (courses.length === 0) return [];

    return courses.map((courseItem) => {
      const lessons = courseItem.details ?? [];

      const examsCount = lessons.reduce(
        (acc: number, d: any) => acc + (d.exams?.length ?? 0),
        0
      );

      const assignmentsCount = lessons.reduce(
        (acc: number, d: any) => acc + (d.assignments?.length ?? 0),
        0
      );

      return {
        id: courseItem.id,
        title: courseItem.title || 'Untitled Course',
        title_ar: courseItem.title_ar || '',
        category: courseItem.semester?.name ?? 'General',
        semesterName: courseItem.semester?.name,
        students: courseItem.count_student ?? 0,
        price: Number(courseItem.price ?? 0),
        priceBeforeDiscount: Number(courseItem.price_before_discount ?? 0),
        discount: Number(courseItem.discount ?? 0),
        status: courseItem.active === 1 ? 'published' : 'draft',
        image: courseItem.imageUrl ?? '',
        lessonsCount: lessons.length,
        examsCount,
        assignmentsCount,
        type: courseItem.type || 'online', // ✅ TYPE موجود!
        description: courseItem.description,
        stageId: courseItem.stage_id,
        subjectId: courseItem.subject_id,
        active: courseItem.active === 1,
        totalContent: lessons.length + examsCount + assignmentsCount,
        teacherName: courseItem.teacher?.name || 'Teacher',
      };
    });
  }, [courses]);






  // ================= STUDENTS =================
  const dashboardStudents: Student[] = useMemo(() => {
    return students
      .filter(student => student.teacher_id === teacherId)
      .map(student => ({
        ...student,

        avatar:
          student.name?.charAt(0)?.toUpperCase() ?? "S",

        progress: 0,

        status: student.active
          ? "active"
          : "inactive",

        enrolledCourses: dashboardCourses.length,

        completedCourses: 0,

        totalAssignments: 0,

        totalExams: 0,

        totalPoints: 0,

        lastActive:
          student.joined_at ??
          student.created_at,
      }));
  }, [students, teacherId, dashboardCourses]);



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