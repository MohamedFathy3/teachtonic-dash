/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import teachersService from '@/services/teachers.service';
import { TeacherResponse } from '@/types/teacherProfile.types';
import { Student } from '@/types/student.types';

export function useTeacherDashboard(teacherId: number) {
  const [teacherData, setTeacherData] = useState<TeacherResponse | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [allCourseDetails, setAllCourseDetails] = useState<any[]>([]);
  const [allExams, setAllExams] = useState<any[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [allSemesters, setAllSemesters] = useState<any[]>([]);
  
  // Students modal data
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [selectedSemesterStudents, setSelectedSemesterStudents] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedCourseStudents, setSelectedCourseStudents] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedLessonStudents, setSelectedLessonStudents] = useState<any[]>([]);
  const [studentsModalLoading, setStudentsModalLoading] = useState(false);
  
  // ✅ منع التكرار
  const fetchedRef = useRef(false);
  const fetchingRef = useRef(false);
  const examsFetchedRef = useRef(false);
  const assignmentsFetchedRef = useRef(false);

  // ================= FETCH TEACHER =================
  const fetchTeacher = useCallback(async () => {
    try {
      const response = await teachersService.getTeacherById(teacherId);
      setTeacherData(response);
    } catch (error) {
      console.error('Error fetching teacher:', error);
    }
  }, [teacherId]);

  // ================= FETCH BOOKS =================
  const fetchBooks = useCallback(async () => {
    try {
      const response = await teachersService.getTeacherBooks(teacherId);
      setAllBooks(response || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  }, [teacherId]);

  // ================= FETCH SEMESTERS =================
  const fetchSemesters = useCallback(async () => {
    try {
      const response = await teachersService.getTeacherSemesters(teacherId);
      setAllSemesters(response || []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  }, [teacherId]);

  // ✅ جلب جميع الامتحانات مرة واحدة بدل ما يجيب لكل درس
  const fetchAllExamsOnce = useCallback(async () => {
    if (examsFetchedRef.current) return;
    examsFetchedRef.current = true;
    
    try {
      const response = await teachersService.getAllExamsByTeacher(teacherId);
      setAllExams(response || []);
    } catch (error) {
      console.error('Error fetching all exams:', error);
    }
  }, [teacherId]);

  // ✅ جلب جميع الواجبات مرة واحدة بدل ما يجيب لكل درس
  const fetchAllAssignmentsOnce = useCallback(async () => {
    if (assignmentsFetchedRef.current) return;
    assignmentsFetchedRef.current = true;
    
    try {
      const response = await teachersService.getAllAssignmentsByTeacher(teacherId);
      setAllAssignments(response || []);
    } catch (error) {
      console.error('Error fetching all assignments:', error);
    }
  }, [teacherId]);

  // ✅ جلب طلاب ترم معين
  const fetchSemesterWithStudents = useCallback(async (semesterId: number) => {
    try {
      setStudentsModalLoading(true);
      const response = await teachersService.getSemesterById(semesterId);
      setSelectedSemester(response);
      setSelectedSemesterStudents(response?.students || []);
      return response;
    } catch (error) {
      console.error('Error fetching semester students:', error);
      return null;
    } finally {
      setStudentsModalLoading(false);
    }
  }, []);

  // ✅ جلب طلاب كورس معين
  const fetchCourseWithStudents = useCallback(async (courseId: number) => {
    try {
      setStudentsModalLoading(true);
      const response = await teachersService.getCourseById(courseId);
      setSelectedCourse(response);
      setSelectedCourseStudents(response?.students || []);
      return response;
    } catch (error) {
      console.error('Error fetching course students:', error);
      return null;
    } finally {
      setStudentsModalLoading(false);
    }
  }, []);

  // ✅ جلب طلاب درس معين
  const fetchLessonWithStudents = useCallback(async (lessonId: number) => {
    try {
      setStudentsModalLoading(true);
      const response = await teachersService.getCourseDetailById(lessonId);
      setSelectedLesson(response);
      setSelectedLessonStudents(response?.students || []);
      return response;
    } catch (error) {
      console.error('Error fetching lesson students:', error);
      return null;
    } finally {
      setStudentsModalLoading(false);
    }
  }, []);

  // ================= FETCH COURSES & DETAILS (بدون جلب الامتحانات والواجبات) =================
  const fetchCourses = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    
    try {
      setLoading(true);
      const response = await teachersService.getTeacherCourses(teacherId);
      setCourses(response || []);
      
      const allDetails: any[] = [];
      
      // جلب تفاصيل الكورسات فقط (بدون امتحانات وواجبات)
      for (const course of response || []) {
        try {
          const details = await teachersService.getCourseDetails(course.id);
          
          if (Array.isArray(details)) {
            allDetails.push(...details);
          }
        } catch (error) {
          console.error(`Error fetching details for course ${course.id}:`, error);
        }
      }
      
      setAllCourseDetails(allDetails);
      
      // جلب الامتحانات والواجبات مرة واحدة بعد الكورسات
      await Promise.all([
        fetchAllExamsOnce(),
        fetchAllAssignmentsOnce()
      ]);
      
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [teacherId, fetchAllExamsOnce, fetchAllAssignmentsOnce]);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await teachersService.getStudents();
      setStudents(response || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }, []);

  // ✅ تشغيل مرة واحدة فقط
  useEffect(() => {
    if (!fetchedRef.current && teacherId) {
      fetchedRef.current = true;
      fetchTeacher();
      fetchCourses();
      fetchStudents();
      fetchBooks();
      fetchSemesters();
    }
  }, [teacherId, fetchTeacher, fetchCourses, fetchStudents, fetchBooks, fetchSemesters]);

  // ================= COURSES =================
  const dashboardCourses: any[] = useMemo(() => {
    if (!courses.length) return [];

    return courses.map((courseItem) => {
      const lessons = allCourseDetails.filter(
        (detail) => detail.course_id === courseItem.id
      );

      const examsCount = allExams.filter(
        (exam) => exam.course_id === courseItem.id || exam.courseId === courseItem.id
      ).length;

      const assignmentsCount = allAssignments.filter(
        (assignment) => assignment.course_id === courseItem.id || assignment.courseId === courseItem.id
      ).length;

      return {
        id: courseItem.id,
        title: courseItem.title || 'Untitled Course',
        title_ar: courseItem.title_ar || '',
        category: courseItem.semester?.name ?? 'General',
        semesterName: courseItem.semester?.name,
        semesterId: courseItem.semester_id,
        students: courseItem.count_student ?? 0,
        price: Number(courseItem.price ?? 0),
        priceBeforeDiscount: Number(courseItem.price_before_discount ?? 0),
        discount: Number(courseItem.discount ?? 0),
        status: courseItem.active === 1 ? 'published' : 'draft',
        image: courseItem.imageUrl ?? '',
        lessonsCount: lessons.length,
        examsCount,
        assignmentsCount,
        type: courseItem.type || 'online',
        description: courseItem.description,
        stageId: courseItem.stage_id,
        subjectId: courseItem.subject_id,
        active: courseItem.active === 1,
        totalContent: lessons.length + examsCount + assignmentsCount,
        teacherName: courseItem.teacher?.name || 'Teacher',
        details: lessons,
      };
    });
  }, [courses, allCourseDetails, allExams, allAssignments]);

  // ================= STUDENTS =================
  const dashboardStudents: Student[] = useMemo(() => {
    return (students || [])
      .filter(student => student.teacher_id === teacherId)
      .map(student => ({
        ...student,
        avatar: student.name?.charAt(0)?.toUpperCase() ?? "S",
        progress: student.progress ?? Math.floor(Math.random() * 100),
        status: student.active ? "active" : "inactive",
        enrolledCourses: student.courses_count ?? dashboardCourses.length,
        completedCourses: student.completed_courses ?? 0,
        totalAssignments: student.assignments_count ?? 0,
        totalExams: student.exams_count ?? 0,
        totalPoints: student.total_points ?? 0,
        lastActive: student.joined_at ?? student.created_at ?? new Date().toISOString(),
      }));
  }, [students, teacherId, dashboardCourses]);

  // ================= ASSIGNMENTS =================
  const dashboardAssignments = useMemo(() => {
    return (allAssignments || []).map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      total_marks: assignment.total_marks || 0,
      duration_minutes: assignment.duration_minutes || 0,
      questions: assignment.questions || [],
      active: assignment.active === 1 || assignment.active === true,
      created_at: assignment.createdAt || assignment.created_at,
      imageUrl: assignment.imageUrl,
      lessonId: assignment.course_detail_id,
      courseId: assignment.course_id,
    }));
  }, [allAssignments]);

  // ================= EXAMS =================
  const dashboardExams = useMemo(() => {
    return (allExams || []).map((exam) => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      total_marks: exam.total_marks || 0,
      duration_minutes: exam.duration_minutes || 0,
      questions: exam.questions || [],
      questions_count: exam.questions?.length || 0,
      active: exam.active === 1 || exam.active === true,
      show_result: exam.show_result === 1 || exam.show_result === true,
      passing_score: exam.passing_score,
      created_at: exam.createdAt || exam.created_at,
      imageUrl: exam.imageUrl,
      lessonId: exam.course_detail_id,
      courseId: exam.course_id,
      courseTitle: dashboardCourses.find(c => c.id === exam.course_id)?.title || 'Unknown',
    }));
  }, [allExams, dashboardCourses]);

  // ================= BOOKS =================
  const dashboardBooks = useMemo(() => {
    return (allBooks || []).map((book) => ({
      id: book.id,
      title: book.title,
      writer: book.writer || 'Unknown',
      price: Number(book.price ?? 0),
      pagesCount: book.pages_count ?? 0,
      active: book.active === 1 || book.active === true,
      imageUrl: book.imageUrl || book.image?.fullUrl || '/placeholder-book.png',
      description: book.description,
      createdAt: book.createdAt || new Date().toISOString(),
      teacherId: book.teacher_id,
    }));
  }, [allBooks]);

  // ================= SEMESTERS =================
  const dashboardSemesters = useMemo(() => {
    return (allSemesters || []).map((semester) => ({
      id: semester.id,
      name: semester.name,
      name_ar: semester.name_ar,
      active: semester.active === 1 || semester.active === true,
      price: Number(semester.price ?? 0),
      discount: Number(semester.discount ?? 0),
      teacher_id: semester.teacher_id,
      subject_id: semester.subject_id,
      courses: semester.courses || [],
      studentsCount: semester.students?.length || 0,
      createdAt: semester.createdAt,
    }));
  }, [allSemesters]);

  // ================= HELPERS =================
  const getCourseDetails = useCallback((courseId: number) => {
    const course = dashboardCourses.find(c => c.id === courseId);
    return course?.details || [];
  }, [dashboardCourses]);

  const getExamsByCourse = useCallback((courseId: number) => {
    return dashboardExams.filter(exam => exam.courseId === courseId);
  }, [dashboardExams]);

  const getAssignmentsByCourse = useCallback((courseId: number) => {
    return dashboardAssignments.filter(assignment => assignment.courseId === courseId);
  }, [dashboardAssignments]);

  // ✅ دالة لتحديث البيانات يدوياً
  const refreshData = useCallback(async () => {
    fetchedRef.current = false;
    fetchingRef.current = false;
    examsFetchedRef.current = false;
    assignmentsFetchedRef.current = false;
    
    await Promise.all([
      fetchTeacher(),
      fetchCourses(),
      fetchStudents(),
      fetchBooks(),
      fetchSemesters()
    ]);
  }, [fetchTeacher, fetchCourses, fetchStudents, fetchBooks, fetchSemesters]);

  return {
    teacherData,
    loading,
    dashboardCourses,
    dashboardStudents,
    dashboardAssignments,
    dashboardExams,
    dashboardBooks,
    dashboardSemesters,
    allCourseDetails,
    allExams,
    allAssignments,
    allBooks,
    allSemesters,
    selectedSemester,
    selectedSemesterStudents,
    selectedCourse,
    selectedCourseStudents,
    selectedLesson,
    selectedLessonStudents,
    studentsModalLoading,
    fetchTeacher,
    fetchCourses,
    fetchStudents,
    fetchBooks,
    fetchSemesters,
    fetchSemesterWithStudents,
    fetchCourseWithStudents,
    fetchLessonWithStudents,
    getCourseDetails,
    getExamsByCourse,
    getAssignmentsByCourse,
    refreshData,
  };
}