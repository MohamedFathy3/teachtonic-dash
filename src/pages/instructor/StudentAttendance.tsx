/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/StudentAttendance.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Search,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  UserPlus,
  UserMinus,
  Award,
  Star,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  Hash,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

// ============================================
// 📦 Types
// ============================================

interface Course {
  id: number;
  title: string;
  title_ar: string;
  type: string;
  count_student: number;
  image?: { fullUrl: string };
}

interface Lesson {
  id: number;
  course_id: number;
  titles: string[];
  titles_ar: string[];
  description: string;
  description_ar: string;
  lession_date: string;
  lession_time: string;
  price: string;
  attended: boolean;
  course?: Course;
  image?: { fullUrl: string };
}

// ============================================
// 🎯 Service Layer
// ============================================

class AttendanceService {
  static async getCourses(teacherId: number, page: number = 1, perPage: number = 10) {
    const response = await api.post('/course/index', {
      filters: { teacher_id: teacherId ,
        type:"center"
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

  static async recordAttendance(lessonId: number, studentId: number, attended: boolean) {
    const response = await api.post('/course-detail-attendance', {
      course_detail_id: lessonId,
      student_id: studentId,
    });
    return response.data;
  }

  // ✅ جلب بيانات طالب بواسطة ID مع teacher_id
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
}

// ============================================
// 🎯 Student Attendance Modal
// ============================================

const StudentAttendanceModal: React.FC<{
  open: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  onRecordAttendance: (studentId: number, attended: boolean) => void;
  lang: string;
  teacherId?: number;
}> = ({ open, onClose, lesson, onRecordAttendance, lang, teacherId }) => {
  const isRTL = lang === 'ar';
  const [studentId, setStudentId] = useState<string>('');
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [attended, setAttended] = useState<boolean>(true);
  const [notFound, setNotFound] = useState(false); // ✅ حالة عدم العثور على الطالب

  const fetchStudent = async () => {
    if (!studentId || isNaN(Number(studentId))) {
      toast.error(isRTL ? 'يرجى إدخال ID صحيح' : 'Please enter a valid ID');
      return;
    }

    if (!teacherId) {
      toast.error(isRTL ? 'لم يتم العثور على المعلم' : 'Teacher not found');
      return;
    }

    setLoading(false);
    setNotFound(false);
    setStudentData(null);

    try {
      const data = await AttendanceService.getStudentById(Number(studentId), teacherId);
      const student = data?.data?.[0] || data?.data;
      
      if (!student) {
        setNotFound(true);
        toast.error(isRTL ? 'الطالب غير موجود أو لا يتبع لك' : 'Student not found or does not belong to you');
        return;
      }
      
      setStudentData(student);
      toast.success(isRTL ? 'تم جلب بيانات الطالب' : 'Student data loaded');
    } catch (error: any) {
      console.error('Error fetching student:', error);
      setNotFound(true);
      toast.error(error.response?.data?.message || (isRTL ? 'الطالب غير موجود' : 'Student not found'));
    } finally {
      setLoading(false);
    }
  };

  // ✅ تسجيل الحضور
  const handleConfirm = () => {
    if (!studentId || isNaN(Number(studentId))) {
      toast.error(isRTL ? 'يرجى إدخال ID الطالب' : 'Please enter student ID');
      return;
    }
    if (!studentData) {
      toast.error(isRTL ? 'يرجى البحث عن الطالب أولاً' : 'Please search for student first');
      return;
    }
    onRecordAttendance(Number(studentId), attended);
    setStudentId('');
    setStudentData(null);
    setAttended(true);
    setNotFound(false);
    onClose();
  };

  // ✅ Press Enter to search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchStudent();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-primary" />
            {isRTL ? 'تسجيل حضور طالب' : 'Student Attendance'}
          </DialogTitle>
          <DialogDescription>
            {lesson && (
              <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                    {lesson.image?.fullUrl ? (
                      <img src={lesson.image.fullUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {isRTL ? lesson.titles_ar?.[0] || lesson.titles?.[0] : lesson.titles?.[0] || lesson.titles_ar?.[0]}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {lesson.lession_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.lession_time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ✅ Student ID Input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              {isRTL ? 'ID الطالب' : 'Student ID'}
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    setNotFound(false);
                    setStudentData(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={isRTL ? 'أدخل ID الطالب' : 'Enter student ID'}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={fetchStudent}
                disabled={loading || !studentId}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isRTL ? 'بحث' : 'Search'}
              </Button>
            </div>
          </div>

          {/* ✅ Student Data Display */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-6"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {isRTL ? 'جاري البحث...' : 'Searching...'}
                </span>
              </motion.div>
            )}

            {!loading && notFound && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-center"
              >
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {isRTL ? 'الطالب غير موجود' : 'Student not found'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL 
                    ? 'تأكد من ID الطالب أو أن الطالب يتبع لك' 
                    : 'Check student ID or make sure the student belongs to you'}
                </p>
              </motion.div>
            )}

            {!loading && studentData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                    {studentData.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{studentData.name || 'Student'}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {studentData.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {studentData.phone}
                        </span>
                      )}
                      {studentData.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {studentData.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {isRTL ? 'تم العثور' : 'Found'}
                  </Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ✅ Attendance Status - Only show if student found */}
          {studentData && !loading && (
            <div className="space-y-3">
              <Label>{isRTL ? 'حالة الحضور' : 'Attendance Status'}</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={attended ? 'default' : 'outline'}
                  className={attended ? 'bg-green-500 hover:bg-green-600' : ''}
                  onClick={() => setAttended(true)}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {isRTL ? 'حاضر' : 'Present'}
                </Button>
                <Button
                  variant={!attended ? 'default' : 'outline'}
                  className={!attended ? 'bg-red-500 hover:bg-red-600' : ''}
                  onClick={() => setAttended(false)}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  {isRTL ? 'غائب' : 'Absent'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!studentData || !studentId}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isRTL ? 'تسجيل الحضور' : 'Record Attendance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// 🏠 Main Component
// ============================================

export const StudentAttendance: React.FC = () => {
  const { t, lang, user } = useApp();
  const isRTL = lang === 'ar';

  // ✅ State
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // ✅ Pagination
  const [coursePage, setCoursePage] = useState(1);
  const [lessonPage, setLessonPage] = useState(1);
  const [courseTotal, setCourseTotal] = useState(0);
  const [lessonTotal, setLessonTotal] = useState(0);
  const perPage = 10;

  // ✅ Fetch Courses
  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await AttendanceService.getCourses(user.id, coursePage, perPage);
      setCourses(data?.data || []);
      setCourseTotal(data?.meta?.total || 0);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error(isRTL ? 'حدث خطأ في جلب الكورسات' : 'Error fetching courses');
    } finally {
      setLoading(false);
    }
  }, [user?.id, coursePage, isRTL]);

  // ✅ Fetch Lessons
  const fetchLessons = useCallback(async () => {
    if (!selectedCourseId) {
      setLessons([]);
      return;
    }
    setLoadingLessons(true);
    try {
      const data = await AttendanceService.getLessons(selectedCourseId, lessonPage, perPage);
      setLessons(data?.data || []);
      setLessonTotal(data?.meta?.total || 0);
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      toast.error(isRTL ? 'حدث خطأ في جلب الدروس' : 'Error fetching lessons');
    } finally {
      setLoadingLessons(false);
    }
  }, [selectedCourseId, lessonPage, isRTL]);

  // ✅ Record Attendance
  const handleRecordAttendance = async (studentId: number, attended: boolean) => {
    if (!selectedLesson) return;
    
    try {
      await AttendanceService.recordAttendance(selectedLesson.id, studentId, attended);
      toast.success(
        isRTL 
          ? attended ? '✅ تم تسجيل الحضور بنجاح' : '✅ تم تسجيل الغياب بنجاح'
          : attended ? '✅ Attendance recorded successfully' : '✅ Absence recorded successfully'
      );
    } catch (error: any) {
      console.error('Error recording attendance:', error);
      toast.error(error.response?.data?.message || (isRTL ? '❌ حدث خطأ' : '❌ An error occurred'));
    }
  };

  // ✅ Effects
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // ✅ Reset pagination when selection changes
  useEffect(() => {
    setLessonPage(1);
  }, [selectedCourseId]);

  // ✅ Get lesson title
  const getLessonTitle = (lesson: Lesson) => {
    if (isRTL) {
      return lesson.titles_ar?.[0] || lesson.titles?.[0] || `Lesson ${lesson.id}`;
    }
    return lesson.titles?.[0] || lesson.titles_ar?.[0] || `Lesson ${lesson.id}`;
  };

  // ✅ Get course title
  const getCourseTitle = (course: Course) => {
    if (isRTL) {
      return course.title_ar || course.title;
    }
    return course.title || course.title_ar;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ✅ Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {isRTL ? '📝 تسجيل حضور الطلاب' : '📝 Student Attendance'}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {isRTL 
                ? 'اختر الكورس ← الدرس ← أدخل ID الطالب لتسجيل الحضور'
                : 'Select Course → Lesson → Enter Student ID to record attendance'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              fetchCourses();
              fetchLessons();
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </motion.div>

        {/* ✅ Steps Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5"
        >
          <div className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${selectedCourseId ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedCourseId ? 'bg-primary text-white' : 'bg-muted'}`}>
                1
              </div>
              <span className="text-sm font-medium">{isRTL ? 'الكورس' : 'Course'}</span>
            </div>
            <div className={`flex-1 h-0.5 ${selectedCourseId ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center gap-2 ${selectedLesson ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedLesson ? 'bg-primary text-white' : 'bg-muted'}`}>
                2
              </div>
              <span className="text-sm font-medium">{isRTL ? 'الدرس' : 'Lesson'}</span>
            </div>
            <div className={`flex-1 h-0.5 ${selectedLesson ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center gap-2 ${modalOpen ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${modalOpen ? 'bg-primary text-white' : 'bg-muted'}`}>
                3
              </div>
              <span className="text-sm font-medium">{isRTL ? 'التسجيل' : 'Record'}</span>
            </div>
          </div>
        </motion.div>

        {/* ✅ Selection Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* ✅ Select Course */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                {isRTL ? 'اختر الكورس' : 'Select Course'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Select
                  value={selectedCourseId?.toString() || ''}
                  onValueChange={(value) => {
                    setSelectedCourseId(value ? parseInt(value) : null);
                    setSelectedLesson(null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isRTL ? 'اختر الكورس' : 'Select a course'} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {getCourseTitle(course)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* ✅ Select Lesson */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                {isRTL ? 'اختر الدرس' : 'Select Lesson'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedCourseId ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isRTL ? '⚠️ يرجى اختيار الكورس أولاً' : '⚠️ Please select a course first'}
                </p>
              ) : loadingLessons ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isRTL ? '📭 لا توجد دروس في هذا الكورس' : '📭 No lessons in this course'}
                </p>
              ) : (
                <Select
                  value={selectedLesson?.id?.toString() || ''}
                  onValueChange={(value) => {
                    const lesson = lessons.find(l => l.id === parseInt(value));
                    setSelectedLesson(lesson || null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isRTL ? 'اختر الدرس' : 'Select a lesson'} />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id.toString()}>
                        {getLessonTitle(lesson)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            onClick={() => setModalOpen(true)}
            disabled={!selectedLesson}
            className="gap-3 px-8 py-6 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
          >
            <UserPlus className="h-5 w-5" />
            {isRTL ? '📌 تسجيل حضور طالب' : '📌 Record Student Attendance'}
            {!selectedLesson && (
              <span className="text-xs text-white/70">
                ({isRTL ? 'اختر درساً أولاً' : 'Select a lesson first'})
              </span>
            )}
          </Button>
        </motion.div>

        {/* ✅ Attendance Modal */}
        <StudentAttendanceModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedLesson(null);
          }}
          lesson={selectedLesson}
          onRecordAttendance={handleRecordAttendance}
          lang={lang}
          teacherId={user?.id}
        />
      </div>
    </div>
  );
};

export default StudentAttendance;