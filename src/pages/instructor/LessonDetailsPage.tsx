/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/LessonDetailsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Calendar, Clock, DollarSign, Video, Link as LinkIcon, 
  FileText, Users, Eye, BookOpen, Download, Lock, CheckCircle2,
  Globe, MapPin, Phone, Mail, User, Award, Loader2, ExternalLink,
  FileQuestion, ClipboardList, Percent, Calendar as CalendarIcon,
  Hourglass, TrendingUp, Shield, Star, BookMarked, GraduationCap,
  Settings, CheckSquare, MessageSquare, ThumbsUp, Share2, Heart,
  AlertCircle, Info, HelpCircle, Image as ImageIcon, X, Database,
  Printer, Copy, Check, ListChecks, Clock as ClockIcon, Pencil,
  XCircle,
  Filter,
  Search
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { courseDetailService } from '@/services/course-detail.service';
import { examService } from '@/services/exam.service';
import { toast  } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

// ==================== أنواع البيانات ====================
interface Question {
  id: number;
  exam_id: number;
  question_type: 'multiple_choice' | 'true_false' | 'essay';
  question: string;
  mark: string;
  correct_answer?: string;
  image: { id: number; fullUrl: string; } | null;
  created_at: string;
}

interface ExamDetail {
  id: number;
  title: string;
  description: string;
  type: string;
  total_marks: number;
  total_must_pass_marks: number;
  duration_minutes: number;
  active: number;
  time_start: string | null;
  time_end: string | null;
  type_exam: string;
  random_questions: boolean;
  random_answers: boolean;
  show_result: boolean;
  imageUrl: string;
  questions: Question[];
  students: any[];
  course_detail_id?: any;
  stage_id?: any;
  teacher_id?: any;
  created_at: string;
  updated_at: string;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  type: string;
  total_marks: number;
  total_must_pass_marks: number;
  duration_minutes: number;
  active: number;
  time_start: string | null;
  time_end: string | null;
  type_exam: string;
  random_questions: boolean;
  random_answers: boolean;
  show_result: boolean;
  imageUrl: string;
  created_at: string;
  updated_at: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  type: string;
  total_marks: number;
  total_must_pass_marks: number;
  duration_minutes: number;
  active: number;
  time_start: string;
  time_end: string;
  type_exam: string;
  random_questions: boolean;
  random_answers: boolean;
  show_result: boolean;
  imageUrl: string;
  created_at: string;
  updated_at: string;
}

interface Student {
  id: number;
  name: string;
  phone: string;
  phone_parent: string;
  code_parent: string;
  type_of_attendance: 'online' | 'center';
  gender: string;
  active: boolean;
  balance: string;
  governorate: string | null;
  school_name: string | null;
  imageUrl: string;
  created_at: string;
}

interface LessonDetail {
  id: number;
  course_id: number;
  course: {
    id: number;
    title: string;
    title_ar: string;
    description: string;
    description_ar: string;
    price: string;
    discount: string;
    type: string;
    count_student: number;
    stage?: { id: number; name: string; name_ar: string; };
    subject?: { id: number; name: string; name_ar: string; };
    teacher?: { id: number; name: string; email: string; phone: string; };
  };
  titles: string[];
  titles_ar: string[];
  link_video: string[];
  description: string;
  description_ar: string;
  content_link: string;
  lession_date: string;
  lession_time: string;
  price: string;
  must_pass_to_unlock: boolean;
  exams: Exam[];
  assignments: Assignment[];
  students: Student[];
  attended: boolean;
  discount: string;
  image: { id: number; fullUrl: string; } | null;
  pdf: { id: number; fullUrl: string; } | null;
  pdfUrl: string | null;
  createdAt: string;
}

// ==================== أنيميشن ====================
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

// ==================== المكون الرئيسي ====================
export const LessonDetailsPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { t, lang } = useApp();
  const isRTL = lang === 'ar';

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Modal states
  const [selectedExam, setSelectedExam] = useState<ExamDetail | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [examLoading, setExamLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
const [studentIdInput, setStudentIdInput] = useState('');
const [attendanceLoading, setAttendanceLoading] = useState(false);
const [attendanceSuccess, setAttendanceSuccess] = useState<{ studentName: string; status: string } | null>(null);
const [studentFilters, setStudentFilters] = useState({
  search: '',
  typeOfAttendance: '',
  active: '',
  attended: '', 
});
const [showStudentFilters, setShowStudentFilters] = useState(false);

// ==================== تسجيل حضور الطالب ====================
const handleMarkAttendance = async () => {
  if (!studentIdInput.trim()) {
    toast.error(lang === 'ar' ? 'الرجاء إدخال ID الطالب' : 'Please enter student ID');
    return;
  }

  setAttendanceLoading(false);
  try {
    // البحث عن الطالب في القائمة
    const foundStudent = lesson?.students?.find(s => s.id === parseInt(studentIdInput));
    
    await courseDetailService.markStudentAttendance(Number(lessonId), parseInt(studentIdInput));
    
    setAttendanceSuccess({
      studentName: foundStudent?.name || `ID: ${studentIdInput}`,
      status: 'تم تسجيل الحضور بنجاح'
    });
    
    setStudentIdInput('');
    
    // إعادة تحميل بيانات الدرس لتحديث حالة الحضور
    setTimeout(() => {
      fetchLesson();
      setAttendanceSuccess(null);
      setShowAttendanceModal(false);
    }, 2000);
    
  } catch (error) {
    console.error('Error marking attendance:', error);
  } finally {
    setAttendanceLoading(false);
  }
};

const exportStudentsToExcel = () => {
  const onlineStudents = lesson?.students?.filter(s => s.type_of_attendance === 'online') || [];
  
  // ✅ بناء بيانات كل طالب مع درجاته
  const filteredData = onlineStudents.map((student, index) => {
    // ✅ جلب درجات الامتحانات للطالب
    const examMarks: Record<string, string> = {};
    lesson?.exams?.forEach(exam => {
      const studentExam = student.exam_marks?.find((em: any) => em.exam_id === exam.id);
      const mark = studentExam?.mark ?? '—';
      const total = exam.total_marks;
      const passed = studentExam ? (studentExam.mark >= exam.total_must_pass_marks ? 'ناجح' : 'راسب') : '—';
      examMarks[`امتحان: ${exam.title}`] = `${mark} / ${total} (${passed})`;
    });

    // ✅ جلب درجات الواجبات للطالب
    const assignmentMarks: Record<string, string> = {};
    lesson?.assignments?.forEach(assignment => {
      const studentAssignment = student.assignment_marks?.find((am: any) => am.assignment_id === assignment.id);
      const mark = studentAssignment?.mark ?? '—';
      const total = assignment.total_marks;
      const passed = studentAssignment ? (studentAssignment.mark >= assignment.total_must_pass_marks ? 'ناجح' : 'راسب') : '—';
      assignmentMarks[`واجب: ${assignment.title}`] = `${mark} / ${total} (${passed})`;
    });

    return {
      [lang === 'ar' ? '#' : 'No']: index + 1,
      [lang === 'ar' ? 'الرقم' : 'ID']: student.id,
      [lang === 'ar' ? 'الاسم' : 'Name']: student.name,
      [lang === 'ar' ? 'الهاتف' : 'Phone']: student.phone,
      [lang === 'ar' ? 'هاتف ولي الأمر' : 'Parent Phone']: student.phone_parent || '—',
      [lang === 'ar' ? 'نوع الحضور' : 'Attendance Type']: 'أونلاين',
      [lang === 'ar' ? 'الحالة' : 'Status']: student.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive'),
      // ✅ للطلاب الأونلاين: بنحط "حاضر" لو حضر، ومبنحطش حاجة لو غائب
      [lang === 'ar' ? 'حضور الدرس' : 'Lesson Attendance']: student.attended ? (lang === 'ar' ? 'حاضر' : 'Attended') : '—',
      [lang === 'ar' ? 'المحافظة' : 'Governorate']: student.governorate || '—',
      [lang === 'ar' ? 'المدرسة' : 'School']: student.school_name || '—',
      [lang === 'ar' ? 'تاريخ التسجيل' : 'Registered Date']: new Date(student.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US'),
      ...examMarks,
      ...assignmentMarks,
    };
  });

  if (filteredData.length === 0) {
    toast.warning(lang === 'ar' ? 'لا يوجد طلاب أونلاين لعرض درجاتهم' : 'No online students to show their marks');
    return;
  }

  const fileName = `lesson_${lessonId}_students_with_marks_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  const worksheet = XLSX.utils.json_to_sheet(filteredData);
  const colWidths = Object.keys(filteredData[0] || {}).map((key) => ({
    wch: Math.max(key.length * 2, 15)
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, lang === 'ar' ? 'طلاب الدرس مع الدرجات' : 'Lesson Students with Marks');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
  
  toast.success(lang === 'ar' ? 'تم تصدير بيانات الطلاب مع الدرجات بنجاح' : 'Students data with marks exported successfully');
};
  // جلب تفاصيل الدرس
  const fetchLesson = async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const response = await courseDetailService.getById(Number(lessonId));
     ('📚 Lesson full data:', response);
      setLesson(response);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل الدرس' : 'Error loading lesson');
    } finally {
      setLoading(false);
    }
  };
const filteredStudents = useMemo(() => {
  let filtered = lesson?.students || [];

  // بحث بالاسم
  if (studentFilters.search) {
    const searchTerm = studentFilters.search.toLowerCase();
    filtered = filtered.filter(s => 
      s.name?.toLowerCase().includes(searchTerm) ||
      s.id?.toString().includes(searchTerm)
    );
  }

  // فلتر نوع الحضور
  if (studentFilters.typeOfAttendance) {
    filtered = filtered.filter(s => s.type_of_attendance === studentFilters.typeOfAttendance);
  }

  // فلتر الحالة (نشط/غير نشط)
  if (studentFilters.active !== '') {
    filtered = filtered.filter(s => s.active === (studentFilters.active === 'active'));
  }

  // فلتر الحضور/الغياب (حسب الدرس الحالي)
  if (studentFilters.attended !== '') {
    filtered = filtered.filter(s => s.attended === (studentFilters.attended === 'attended'));
  }

  return filtered;
}, [lesson?.students, studentFilters]);

// ✅ دالة لمسح الفلاتر
const clearStudentFilters = () => {
  setStudentFilters({
    search: '',
    typeOfAttendance: '',
    active: '',
    attended: '',
  });
  setShowStudentFilters(false);
};

// إحصائيات الطلاب
const studentStats = {
  total: lesson?.students?.length || 0,
  active: lesson?.students?.filter(s => s.active).length || 0,
  inactive: lesson?.students?.filter(s => !s.active).length || 0,
  online: lesson?.students?.filter(s => s.type_of_attendance === 'online').length || 0,
  center: lesson?.students?.filter(s => s.type_of_attendance === 'center').length || 0,
  attended: lesson?.students?.filter(s => s.attended).length || 0,
  absent: lesson?.students?.filter(s => !s.attended).length || 0,
};
  // جلب تفاصيل الامتحان
  const fetchExamDetails = async (examId: number) => {
    setExamLoading(true);
    try {
      const response = await examService.getExamById(examId);
      setSelectedExam(response);
      setIsExamModalOpen(true);
    } catch (error) {
      console.error('Error fetching exam:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل الامتحان' : 'Error loading exam');
    } finally {
      setExamLoading(false);
    }
  };

  // جلب تفاصيل الواجب
  const fetchAssignmentDetails = async (assignmentId: number) => {
    setAssignmentLoading(true);
    try {
      const assignment = lesson?.assignments?.find(a => a.id === assignmentId);
      setSelectedAssignment(assignment || null);
      setIsAssignmentModalOpen(true);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل الواجب' : 'Error loading assignment');
    } finally {
      setAssignmentLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  // دوال مساعدة
  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
  };

  const getTitle = () => {
    if (isRTL && lesson?.titles_ar?.length) return lesson.titles_ar[0];
    if (lesson?.titles?.length) return lesson.titles[0];
    return '—';
  };

  const getAllTitles = () => {
    return isRTL ? lesson?.titles_ar : lesson?.titles;
  };

  const getDescription = () => {
    return isRTL ? lesson?.description_ar : lesson?.description;
  };

  // نسخ الرابط
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(lang === 'ar' ? 'تم نسخ الرابط' : 'Link copied');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{lang === 'ar' ? 'جاري تحميل الدرس...' : 'Loading lesson...'}</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{lang === 'ar' ? 'الدرس غير موجود' : 'Lesson not found'}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
        </div>
      </div>
    );
  }

  const title = getTitle();
  const allTitles = getAllTitles();
  const description = getDescription();
  const courseTitle = isRTL ? lesson.course?.title_ar : lesson.course?.title;
  const stageName = isRTL ? lesson.course?.stage?.name_ar : lesson.course?.stage?.name;

  // إحصائيات سريعة
  const stats = {
    students: lesson.students?.length || 0,
    activeStudents: lesson.students?.filter(s => s.active).length || 0,
    onlineStudents: lesson.students?.filter(s => s.type_of_attendance === 'online').length || 0,
    centerStudents: lesson.students?.filter(s => s.type_of_attendance === 'center').length || 0,
    exams: lesson.exams?.length || 0,
    assignments: lesson.assignments?.length || 0,
  };

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="space-y-6 max-w-7xl mx-auto px-4 pb-8"
      >
        {/* ==================== Header ==================== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ x: -5 }}>
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
                <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                {t('back')}
              </Button>
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
                {title}
              </motion.h1>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  ID: {lesson.id}
                </Badge>
                {courseTitle && (
                  <Badge variant="outline" className="text-xs">
                    {courseTitle}
                  </Badge>
                )}
                {lesson.must_pass_to_unlock && (
                  <Badge variant="warning" className="text-xs gap-1 bg-amber-500/20 text-amber-600">
                    <Lock className="h-3 w-3" />
                    {lang === 'ar' ? 'اجتياز الامتحان مطلوب' : 'Exam required'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Buttons Group */}
          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={copyLink} className="gap-1">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {lang === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{lang === 'ar' ? 'نسخ رابط الصفحة' : 'Copy page link'}</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" size="sm" onClick={() => window.print()} className="gap-1">
                  <Printer className="h-4 w-4" />
                  {lang === 'ar' ? 'طباعة' : 'Print'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{lang === 'ar' ? 'طباعة الصفحة' : 'Print page'}</TooltipContent>
            </Tooltip>
            <Tooltip>
  <TooltipTrigger asChild>
    <Button 
      variant="default" 
      size="sm" 
      onClick={() => setShowAttendanceModal(true)} 
      className="gap-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
    >
      <User className="h-4 w-4" />
      {lang === 'ar' ? 'تسجيل حضور' : 'Mark Attendance'}
    </Button>
  </TooltipTrigger>
  <TooltipContent>{lang === 'ar' ? 'تسجيل حضور طالب في الدرس' : 'Mark student attendance'}</TooltipContent>
</Tooltip>
          </div>
        </div>

        {/* ==================== Hero Section with Image ==================== */}
        {lesson.image?.fullUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
            onClick={() => setSelectedImage(lesson.image?.fullUrl || null)}
          >
            <img 
              src={lesson.image.fullUrl} 
              alt={title} 
              className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-black/60 rounded-full p-3">
                <Eye className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== Stats Cards ==================== */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard icon={Calendar} label={lang === 'ar' ? 'التاريخ' : 'Date'} value={formatDate(lesson.lession_date)} color="blue" />
          <StatCard icon={Clock} label={lang === 'ar' ? 'الوقت' : 'Time'} value={lesson.lession_time?.slice(0, 5) || '—'} color="purple" />
          <StatCard icon={DollarSign} label={lang === 'ar' ? 'السعر' : 'Price'} value={`EGP ${lesson.price}`} color="green" />
          <StatCard icon={Users} label={lang === 'ar' ? 'الطلاب' : 'Students'} value={stats.students} color="orange" />
          <StatCard icon={FileQuestion} label={lang === 'ar' ? 'امتحانات' : 'Exams'} value={stats.exams} color="red" />
        </motion.div>

        {/* ==================== Tabs ==================== */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'نظرة عامة' : 'Overview'}</span>
            </TabsTrigger>
         
            <TabsTrigger value="videos" className="rounded-lg gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">🎬 {lang === 'ar' ? 'فيديوهات' : 'Videos'}</span>
              {stats.videos > 0 && <Badge variant="secondary" className="h-5 w-5 p-0 text-[10px]">{stats.videos}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="exams" className="rounded-lg gap-2">
              <FileQuestion className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'امتحانات' : 'Exams'}</span>
              {stats.exams > 0 && <Badge variant="secondary" className="h-5 w-5 p-0 text-[10px]">{stats.exams}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="assignments" className="rounded-lg gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'واجبات' : 'Assignments'}</span>
              {stats.assignments > 0 && <Badge variant="secondary" className="h-5 w-5 p-0 text-[10px]">{stats.assignments}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="students" className="rounded-lg gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'طلاب' : 'Students'}</span>
              {stats.students > 0 && <Badge variant="secondary" className="h-5 w-5 p-0 text-[10px]">{stats.students}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* ==================== Overview Tab ==================== */}
          <TabsContent value="overview" className="space-y-5 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="rounded-xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    {lang === 'ar' ? 'وصف الدرس' : 'Lesson Description'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {description || (lang === 'ar' ? 'لا يوجد وصف' : 'No description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    {lang === 'ar' ? 'معلومات أساسية' : 'Basic Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <InfoRow icon={Hash} label="ID" value={lesson.id} />
                    <InfoRow icon={Calendar} label={lang === 'ar' ? 'تاريخ الإنشاء' : 'Created At'} value={formatDate(lesson.createdAt)} />
                    <InfoRow icon={DollarSign} label={lang === 'ar' ? 'السعر' : 'Price'} value={`EGP ${lesson.price}`} />
                    {lesson.discount !== '0.00' && (
                      <InfoRow icon={Percent} label={lang === 'ar' ? 'الخصم' : 'Discount'} value={`EGP ${lesson.discount}`} />
                    )}
                    <InfoRow icon={Lock} label={lang === 'ar' ? 'امتحان إجباري' : 'Exam Required'} value={lesson.must_pass_to_unlock ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')} />
                    <InfoRow icon={CheckCircle2} label={lang === 'ar' ? 'تم الحضور' : 'Attended'} value={lesson.attended ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sub Titles */}
            {allTitles && allTitles.length > 0 && (
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    {lang === 'ar' ? 'العناوين' : 'Titles'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {allTitles.map((t, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm py-1 px-3">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Info */}
            {lesson.course && (
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    {lang === 'ar' ? 'معلومات الكورس' : 'Course Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoRow icon={BookOpen} label={lang === 'ar' ? 'عنوان الكورس' : 'Course Title'} value={courseTitle} />
                    <InfoRow icon={DollarSign} label={lang === 'ar' ? 'سعر الكورس' : 'Course Price'} value={`EGP ${lesson.course.price}`} />
                    {lesson.course.discount !== '0.00' && (
                      <InfoRow icon={Percent} label={lang === 'ar' ? 'خصم الكورس' : 'Course Discount'} value={`EGP ${lesson.course.discount}`} />
                    )}
                    <InfoRow icon={Users} label={lang === 'ar' ? 'عدد الطلاب' : 'Students Count'} value={lesson.course.count_student} />
                    <InfoRow icon={Globe} label={lang === 'ar' ? 'نوع الكورس' : 'Course Type'} value={lesson.course.type === 'online' ? (lang === 'ar' ? 'أونلاين' : 'Online') : (lang === 'ar' ? 'سنتر' : 'Center')} />
                    {stageName && <InfoRow icon={GraduationCap} label={lang === 'ar' ? 'المرحلة' : 'Stage'} value={stageName} />}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ==================== All Data Tab (JSON View) ==================== */}
       

          {/* ==================== Videos Tab ==================== */}
          <TabsContent value="videos" className="mt-4">
            {stats.videos > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.link_video.filter(v => v?.trim()).map((video, idx) => (
                  <VideoCard key={idx} video={video} index={idx} lang={lang} />
                ))}
              </div>
            ) : (
              <EmptyState icon={Video} message={lang === 'ar' ? 'لا توجد فيديوهات لهذا الدرس' : 'No videos for this lesson'} />
            )}
          </TabsContent>

          {/* ==================== Exams Tab ==================== */}
          <TabsContent value="exams" className="mt-4">
            {stats.exams > 0 ? (
              <div className="space-y-4">
                {lesson.exams.map((exam) => (
                  <ExamCard 
                    key={exam.id} 
                    exam={exam} 
                    lang={lang} 
                    onView={() => fetchExamDetails(exam.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon={FileQuestion} message={lang === 'ar' ? 'لا توجد امتحانات لهذا الدرس' : 'No exams for this lesson'} />
            )}
          </TabsContent>

          {/* ==================== Assignments Tab ==================== */}
          <TabsContent value="assignments" className="mt-4">
            {stats.assignments > 0 ? (
              <div className="space-y-4">
                {lesson.assignments.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.id} 
                    assignment={assignment} 
                    lang={lang} 
                    onView={() => fetchAssignmentDetails(assignment.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon={ClipboardList} message={lang === 'ar' ? 'لا توجد واجبات لهذا الدرس' : 'No assignments for this lesson'} />
            )}
          </TabsContent>

          {/* ==================== Students Tab ==================== */}
<TabsContent value="students" className="mt-4">
  {stats.students > 0 ? (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <SummaryCard icon={Users} label={lang === 'ar' ? 'إجمالي الطلاب' : 'Total'} value={studentStats.total} color="blue" />
        <SummaryCard icon={CheckCircle2} label={lang === 'ar' ? 'نشط' : 'Active'} value={studentStats.active} color="green" />
        <SummaryCard icon={XCircle} label={lang === 'ar' ? 'غير نشط' : 'Inactive'} value={studentStats.inactive} color="red" />
        <SummaryCard icon={Globe} label={lang === 'ar' ? 'أونلاين' : 'Online'} value={studentStats.online} color="purple" />
      </div>

      {/* Filter Button and Search */}
    {/* Filter Button and Search */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
  <div className="flex gap-2 flex-wrap">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowStudentFilters(!showStudentFilters)}
      className="gap-2"
    >
      <Filter className="h-4 w-4" />
      {lang === 'ar' ? 'فلاتر متقدمة' : 'Advanced Filters'}
      {(studentFilters.search || studentFilters.typeOfAttendance || studentFilters.active || studentFilters.attended) && (
        <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
          {[studentFilters.search, studentFilters.typeOfAttendance, studentFilters.active, studentFilters.attended].filter(Boolean).length}
        </Badge>
      )}
    </Button>
    
    {/* 🔥 زر تصدير Excel */}
// ✅ زر تصدير Excel الأساسي (كل الطلاب)
{filteredStudents.length > 0 && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => {
      const baseData = filteredStudents.map((student, index) => {
        const isOnline = student.type_of_attendance === 'online';
        
        const row: any = {
          [lang === 'ar' ? '#' : 'No']: index + 1,
          [lang === 'ar' ? 'الرقم' : 'ID']: student.id,
          [lang === 'ar' ? 'الاسم' : 'Name']: student.name,
          [lang === 'ar' ? 'الهاتف' : 'Phone']: student.phone,
          [lang === 'ar' ? 'نوع الحضور' : 'Attendance Type']: student.type_of_attendance === 'online' ? (lang === 'ar' ? 'أونلاين' : 'Online') : (lang === 'ar' ? 'سنتر' : 'Center'),
          [lang === 'ar' ? 'الحالة' : 'Status']: student.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive'),
        };
        
        // ✅ للطلاب الأونلاين: بنحط "حاضر" لو حضر، ومبنحطش حاجة لو غائب (نحط '—')
        if (isOnline) {
          row[lang === 'ar' ? 'حضور الدرس' : 'Lesson Attendance'] = student.attended ? (lang === 'ar' ? 'حاضر' : 'Attended') : '—';
        } else {
          // ✅ للطلاب السنتر: بنحط حاضر أو غائب عادي
          row[lang === 'ar' ? 'حضور الدرس' : 'Lesson Attendance'] = student.attended ? (lang === 'ar' ? 'حاضر' : 'Attended') : (lang === 'ar' ? 'غائب' : 'Absent');
        }
        
        row[lang === 'ar' ? 'المحافظة' : 'Governorate'] = student.governorate || '—';
        row[lang === 'ar' ? 'المدرسة' : 'School'] = student.school_name || '—';
        
        return row;
      });
      
      const fileName = `lesson_${lessonId}_students_${new Date().toISOString().split('T')[0]}.xlsx`;
      const worksheet = XLSX.utils.json_to_sheet(baseData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, lang === 'ar' ? 'طلاب الدرس' : 'Lesson Students');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
      toast.success(lang === 'ar' ? 'تم تصدير بيانات الطلاب بنجاح' : 'Students data exported successfully');
    }}
    className="gap-2"
  >
    <Download className="h-4 w-4" />
    {lang === 'ar' ? 'تصدير Excel' : 'Export Excel'}
  </Button>
)}
    {(studentFilters.search || studentFilters.typeOfAttendance || studentFilters.active || studentFilters.attended) && (
      <Button variant="ghost" size="sm" onClick={clearStudentFilters} className="gap-1 text-red-500">
        <X className="h-4 w-4" />
        {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
      </Button>
    )}
  </div>
  
  {/* Search Input */}
  <div className="relative w-full sm:w-64">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder={lang === 'ar' ? 'بحث بالاسم أو المعرف...' : 'Search by name or ID...'}
      value={studentFilters.search}
      onChange={(e) => setStudentFilters(prev => ({ ...prev, search: e.target.value }))}
      className="pl-9 rounded-xl"
    />
  </div>
</div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showStudentFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-xl rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* نوع الحضور */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {lang === 'ar' ? 'نوع الحضور' : 'Attendance Type'}
                  </label>
                  <select
                    value={studentFilters.typeOfAttendance}
                    onChange={(e) => setStudentFilters(prev => ({ ...prev, typeOfAttendance: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border bg-background"
                  >
                    <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                    <option value="online">💻 {lang === 'ar' ? 'أونلاين' : 'Online'}</option>
                    <option value="center">🏢 {lang === 'ar' ? 'سنتر' : 'Center'}</option>
                  </select>
                </div>

                {/* الحالة */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {lang === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={studentFilters.active}
                    onChange={(e) => setStudentFilters(prev => ({ ...prev, active: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border bg-background"
                  >
                    <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                    <option value="active">✅ {lang === 'ar' ? 'نشط' : 'Active'}</option>
                    <option value="inactive">❌ {lang === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                  </select>
                </div>

                {/* حضور/غياب */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {lang === 'ar' ? 'حضور الدرس' : 'Lesson Attendance'}
                  </label>
                  <select
                    value={studentFilters.attended}
                    onChange={(e) => setStudentFilters(prev => ({ ...prev, attended: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border bg-background"
                  >
                    <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                    <option value="attended">✅ {lang === 'ar' ? 'حاضر' : 'Attended'}</option>
                    <option value="absent">❌ {lang === 'ar' ? 'غائب' : 'Absent'}</option>
                  </select>
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <Button size="sm" onClick={() => setShowStudentFilters(false)} className="gap-2 bg-gradient-to-r from-primary to-secondary">
                  <CheckCircle2 className="h-3 w-3" />
                  {lang === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
                </Button>
              </div>

              {/* Active Filters Display */}
              {(studentFilters.typeOfAttendance || studentFilters.active || studentFilters.attended) && (
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'الفلاتر النشطة:' : 'Active Filters:'}</span>
                  {studentFilters.typeOfAttendance && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      {studentFilters.typeOfAttendance === 'online' ? '💻 أونلاين' : '🏢 سنتر'}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setStudentFilters(prev => ({ ...prev, typeOfAttendance: '' }))} />
                    </Badge>
                  )}
                  {studentFilters.active && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      {studentFilters.active === 'active' ? '✅ نشط' : '❌ غير نشط'}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setStudentFilters(prev => ({ ...prev, active: '' }))} />
                    </Badge>
                  )}
                  {studentFilters.attended && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      {studentFilters.attended === 'attended' ? '✅ حاضر' : '❌ غائب'}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setStudentFilters(prev => ({ ...prev, attended: '' }))} />
                    </Badge>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          {lang === 'ar' 
            ? `عرض ${filteredStudents.length} من ${studentStats.total} طالب`
            : `Showing ${filteredStudents.length} of ${studentStats.total} students`}
        </p>
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <Search className="h-16 w-16 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{lang === 'ar' ? 'لا توجد نتائج مطابقة للبحث' : 'No matching students found'}</p>
          <Button variant="link" onClick={clearStudentFilters} className="mt-2">
            {lang === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, idx) => (
            <StudentCard 
              key={student.id} 
              student={student} 
              idx={idx} 
              lang={lang} 
              formatDate={formatDate}
              lessonAttended={student.attended}
            />
          ))}
        </div>
      )}
    </>
  ) : (
    <EmptyState icon={Users} message={lang === 'ar' ? 'لا يوجد طلاب مسجلين في هذا الكورس' : 'No students enrolled in this course'} />
  )}
</TabsContent>
        </Tabs>

        {/* ==================== Image Modal ==================== */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                src={selectedImage}
                alt="Full size"
                className="max-w-full max-h-full rounded-lg object-contain"
              />
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== Exam Details Modal ==================== */}
        <Dialog open={isExamModalOpen} onOpenChange={setIsExamModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
                <FileQuestion className="h-5 w-5" />
                {selectedExam?.title || (lang === 'ar' ? 'تفاصيل الامتحان' : 'Exam Details')}
              </DialogTitle>
              <DialogDescription>
                {selectedExam?.description}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[calc(90vh-120px)] pr-4">
              {examLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : selectedExam ? (
                <div className="space-y-6">
                  {/* Exam Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/30">
                    <div className="text-center">
                      <Award className="h-5 w-5 text-primary mx-auto mb-1" />
                      <p className="text-2xl font-bold">{selectedExam.total_marks}</p>
                      <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الدرجة الكلية' : 'Total Marks'}</p>
                    </div>
                    <div className="text-center">
                      <Shield className="h-5 w-5 text-green-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold">{selectedExam.total_must_pass_marks}</p>
                      <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'درجة النجاح' : 'Pass Mark'}</p>
                    </div>
                    <div className="text-center">
                      <Hourglass className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold">{selectedExam.duration_minutes}</p>
                      <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المدة (دقائق)' : 'Duration (min)'}</p>
                    </div>
                    <div className="text-center">
                      <Badge variant={selectedExam.active ? "default" : "secondary"} className="mt-2">
                        {selectedExam.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                      </Badge>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-primary" />
                      {lang === 'ar' ? 'أسئلة الامتحان' : 'Exam Questions'} ({selectedExam.questions?.length || 0})
                    </h3>
                    <div className="space-y-4">
                      {selectedExam.questions?.map((question, idx) => (
                        <Card key={question.id} className="rounded-xl">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="shrink-0 mt-0.5">
                                #{idx + 1}
                              </Badge>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <Badge variant="secondary" className="text-[10px]">
                                    {question.question_type === 'multiple_choice' ? (lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice') :
                                     question.question_type === 'true_false' ? (lang === 'ar' ? 'صح/خطأ' : 'True/False') :
                                     (lang === 'ar' ? 'مقالي' : 'Essay')}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] bg-amber-500/10">
                                    <Award className="h-3 w-3 mr-1" />
                                    {question.mark} {lang === 'ar' ? 'درجة' : 'marks'}
                                  </Badge>
                                </div>
                                <p className="font-medium">{question.question}</p>
                                {question.correct_answer && (
                                  <div className="mt-2 p-2 rounded-lg bg-green-500/10 text-green-600 text-sm">
                                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                                    {lang === 'ar' ? 'الإجابة الصحيحة:' : 'Correct answer:'} {question.correct_answer}
                                  </div>
                                )}
                                {question.image?.fullUrl && (
                                  <img 
                                    src={question.image.fullUrl} 
                                    alt="Question" 
                                    className="mt-2 rounded-lg max-h-32 object-cover"
                                  />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Students Who Took Exam */}
                  {selectedExam.students && selectedExam.students.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {lang === 'ar' ? 'الطلاب الذين أدوا الامتحان' : 'Students Who Took The Exam'} ({selectedExam.students.length})
                      </h3>
                      <div className="space-y-4">
                        {selectedExam.students.map((student: any) => {
                          const totalStudentMark = student.answers?.reduce((sum: number, ans: any) => sum + (parseFloat(ans.mark) || 0), 0) || 0;
                          const totalQuestions = student.answers?.length || 0;
                          const correctAnswers = student.answers?.filter((ans: any) => ans.is_correct === true).length || 0;
                          const percentage = selectedExam.total_marks > 0 ? (totalStudentMark / selectedExam.total_marks) * 100 : 0;
                          
                          return (
                            <Card key={student.id} className="rounded-xl overflow-hidden hover:shadow-md transition-all">
                              <CardContent className="p-0">
                                {/* Student Header */}
                                <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
                                  <div className="flex items-start justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                          {student.name?.charAt(0)?.toUpperCase() || 'S'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-semibold text-lg">{student.name}</p>
                                        <p className="text-xs text-muted-foreground">ID: {student.id}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-center px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/20">
                                        <p className="text-xl font-bold text-green-600">{totalStudentMark}</p>
                                        <p className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'من' : 'out of'} {selectedExam.total_marks}</p>
                                      </div>
                                      <Badge variant={percentage >= 50 ? "default" : "destructive"} className="text-xs">
                                        {percentage.toFixed(1)}%
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="px-4 pt-3">
                                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>{lang === 'ar' ? 'نسبة النجاح' : 'Success Rate'}</span>
                                    <span>{percentage.toFixed(1)}%</span>
                                  </div>
                                  <Progress value={percentage} className="h-2" />
                                </div>
                                
                                {/* Answers Summary */}
                                <div className="p-4">
                                  <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="text-center p-2 rounded-lg bg-muted/30">
                                      <p className="text-xl font-bold">{totalQuestions}</p>
                                      <p className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'عدد الإجابات' : 'Answers'}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                                      <p className="text-xl font-bold text-green-600">{correctAnswers}</p>
                                      <p className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'صحيحة' : 'Correct'}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                                      <p className="text-xl font-bold text-red-600">{totalQuestions - correctAnswers}</p>
                                      <p className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'خاطئة' : 'Wrong'}</p>
                                    </div>
                                  </div>
                                  
                                  {/* Answers Details */}
                                  <details className="mt-2">
                                    <summary className="text-sm font-medium cursor-pointer hover:text-primary transition-colors">
                                      {lang === 'ar' ? 'عرض تفاصيل الإجابات' : 'Show Answers Details'}
                                    </summary>
                                    <div className="mt-3 space-y-2">
                                      {student.answers?.map((answer: any, ansIdx: number) => {
                                        const question = selectedExam.questions?.find((q: any) => q.id === answer.question_id);
                                        return (
                                          <div key={answer.id} className="p-2 rounded-lg bg-muted/20 text-sm">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex-1">
                                                <span className="text-xs text-muted-foreground">
                                                  {lang === 'ar' ? 'سؤال' : 'Q'} {ansIdx + 1}:
                                                </span>
                                                <span className="ml-1">{question?.question || `Question ${answer.question_id}`}</span>
                                              </div>
                                              <Badge variant={answer.is_correct ? "default" : "destructive"} className="text-[10px] shrink-0">
                                                {answer.is_correct ? (lang === 'ar' ? '✓ صحيح' : '✓ Correct') : (lang === 'ar' ? '✗ خطأ' : '✗ Wrong')}
                                              </Badge>
                                            </div>
                                            <div className="mt-1 text-xs">
                                              <span className="text-muted-foreground">
                                                {lang === 'ar' ? 'الإجابة:' : 'Answer:'}
                                              </span>
                                              <span className="ml-1 font-medium">{answer.answer || '—'}</span>
                                              {answer.mark && (
                                                <span className="ml-2 text-green-600">
                                                  ({answer.mark} / {question?.mark || 0} {lang === 'ar' ? 'درجة' : 'marks'})
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </details>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState icon={FileQuestion} message={lang === 'ar' ? 'لا توجد بيانات' : 'No data available'} />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* ==================== Assignment Details Modal ==================== */}
        <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                {selectedAssignment?.title || (lang === 'ar' ? 'تفاصيل الواجب' : 'Assignment Details')}
              </DialogTitle>
              <DialogDescription>
                {selectedAssignment?.description}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[calc(80vh-120px)] pr-4">
              {assignmentLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : selectedAssignment ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/30">
                    <div className="text-center">
                      <Award className="h-5 w-5 text-primary mx-auto mb-1" />
                      <p className="text-xl font-bold">{selectedAssignment.total_marks}</p>
                      <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الدرجة الكلية' : 'Total Marks'}</p>
                    </div>
                    <div className="text-center">
                      <ClockIcon className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                      <p className="text-xl font-bold">{selectedAssignment.duration_minutes}</p>
                      <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المدة (دقائق)' : 'Duration (min)'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 p-4 rounded-xl bg-muted/30">
                    <InfoRow icon={CalendarIcon} label={lang === 'ar' ? 'يبدأ' : 'Starts'} value={formatDateTime(selectedAssignment.time_start)} />
                    <InfoRow icon={Clock} label={lang === 'ar' ? 'ينتهي' : 'Ends'} value={formatDateTime(selectedAssignment.time_end)} />
                    <InfoRow icon={Shield} label={lang === 'ar' ? 'درجة النجاح' : 'Pass Mark'} value={selectedAssignment.total_must_pass_marks} />
                    <InfoRow icon={Settings} label={lang === 'ar' ? 'الحالة' : 'Status'} value={selectedAssignment.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')} />
                  </div>
                </div>
              ) : (
                <EmptyState icon={ClipboardList} message={lang === 'ar' ? 'لا توجد بيانات' : 'No data available'} />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>


        {/* ==================== Attendance Modal ==================== */}
<Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
  <DialogContent className="max-w-md rounded-2xl">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
        <User className="h-5 w-5 text-green-500" />
        {lang === 'ar' ? 'تسجيل حضور طالب' : 'Mark Student Attendance'}
      </DialogTitle>
      <DialogDescription>
        {lang === 'ar' 
          ? 'أدخل ID الطالب لتسجيل حضوره في هذا الدرس'
          : 'Enter student ID to mark their attendance for this lesson'}
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-5 py-3">
      {/* درس معلومات */}
      <div className="p-3 rounded-xl bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'الدرس' : 'Lesson'}</p>
        <p className="font-semibold text-base">{title}</p>
      </div>

      {/* ID Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {lang === 'ar' ? 'ID الطالب' : 'Student ID'} *
        </label>
        <Input
          type="number"
          value={studentIdInput}
          onChange={(e) => setStudentIdInput(e.target.value)}
          placeholder={lang === 'ar' ? 'أدخل رقم الطالب...' : 'Enter student ID...'}
          className="rounded-xl text-center text-lg font-mono"
          autoFocus
        />
        <p className="text-xs text-muted-foreground mt-1">
          {lang === 'ar' 
            ? 'يمكنك إيجاد ID الطالب من قائمة الطلاب في الكورس'
            : 'You can find student ID in the students list of the course'}
        </p>
      </div>

      {/* Success Message */}
      {attendanceSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-center"
        >
          <CheckCircle2 className="h-5 w-5 mx-auto mb-1" />
          <p className="font-medium">{attendanceSuccess.studentName}</p>
          <p className="text-sm">{attendanceSuccess.status}</p>
        </motion.div>
      )}

      {/* Student Preview (إذا كان الطالب موجود) */}
      {studentIdInput && !attendanceSuccess && (
        <div className="p-3 rounded-xl bg-muted/20">
          <p className="text-xs text-muted-foreground mb-2">
            {lang === 'ar' ? 'معلومات الطالب' : 'Student Info'}
          </p>
          {(() => {
            const foundStudent = lesson?.students?.find(s => s.id === parseInt(studentIdInput));
            if (foundStudent) {
              return (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-100 dark:bg-green-900/20 text-green-600">
                      {foundStudent.name?.charAt(0)?.toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{foundStudent.name}</p>
                    <p className="text-xs text-muted-foreground">{foundStudent.phone}</p>
                  </div>
                  <Badge variant={foundStudent.active ? "default" : "secondary"} className="text-[10px] ml-auto">
                    {foundStudent.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                  </Badge>
                </div>
              );
            } else if (studentIdInput) {
              return (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    {lang === 'ar' ? 'لم يتم العثور على طالب بهذا ID' : 'No student found with this ID'}
                  </span>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>

    <DialogFooter className="flex gap-3">
      <Button variant="outline" onClick={() => setShowAttendanceModal(false)} className="rounded-xl">
        {lang === 'ar' ? 'إلغاء' : 'Cancel'}
      </Button>
      <Button
        onClick={handleMarkAttendance}
        disabled={attendanceLoading || !studentIdInput.trim()}
        className="gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
      >
        {attendanceLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        <CheckCircle2 className="h-4 w-4" />
        {lang === 'ar' ? 'تسجيل الحضور' : 'Mark Attendance'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      </motion.div>
    </TooltipProvider>
  );
};

// ==================== مكونات مساعدة ====================

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode; color: string }> = ({ 
  icon: Icon, label, value, color 
}) => (
  <motion.div variants={fadeIn} whileHover={{ y: -3 }} className="text-center p-4 rounded-xl bg-gradient-to-br from-card to-muted/30 border">
    <Icon className={`h-6 w-6 text-${color}-500 mx-auto mb-2`} />
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </motion.div>
);

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
    <Icon className="h-4 w-4 text-muted-foreground" />
    <span className="text-sm text-muted-foreground">{label}:</span>
    <span className="text-sm font-medium">{value || '—'}</span>
  </div>
);

const Hash: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
  </svg>
);

const VideoCard: React.FC<{ video: string; index: number; lang: string }> = ({ video, index, lang }) => {
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    return url;
  };

  return (
    <Card className="overflow-hidden rounded-xl hover:shadow-lg transition-all">
      <div className="aspect-video bg-black/5">
        <iframe
          src={getEmbedUrl(video)}
          title={`Video ${index + 1}`}
          className="w-full h-full"
          allowFullScreen
        />
      </div>
      <CardContent className="p-3">
        <a href={video} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
          {lang === 'ar' ? `فيديو ${index + 1}` : `Video ${index + 1}`}
          <ExternalLink className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  );
};

const ExamCard: React.FC<{ exam: Exam; lang: string; onView: () => void }> = ({ exam, lang, onView }) => (
  <Card className="rounded-xl hover:shadow-md transition-all cursor-pointer" onClick={onView}>
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
          <FileQuestion className="h-5 w-5 text-purple-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <h4 className="font-semibold">{exam.title}</h4>
            <Badge variant={exam.active ? "default" : "secondary"} className="text-[10px]">
              {exam.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{exam.description}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {lang === 'ar' ? `الدرجة: ${exam.total_marks}` : `Marks: ${exam.total_marks}`}
            </span>
            <span className="flex items-center gap-1">
              <Hourglass className="h-3 w-3" />
              {lang === 'ar' ? `المدة: ${exam.duration_minutes} دقيقة` : `Duration: ${exam.duration_minutes} min`}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {lang === 'ar' ? `درجة النجاح: ${exam.total_must_pass_marks}` : `Pass mark: ${exam.total_must_pass_marks}`}
            </span>
          </div>
        </div>
        <Button size="sm" variant="ghost" className="shrink-0">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const AssignmentCard: React.FC<{ assignment: Assignment; lang: string; onView: () => void }> = ({ assignment, lang, onView }) => (
  <Card className="rounded-xl hover:shadow-md transition-all cursor-pointer" onClick={onView}>
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
          <ClipboardList className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <h4 className="font-semibold">{assignment.title}</h4>
            <Badge variant={assignment.active ? "default" : "secondary"} className="text-[10px]">
              {assignment.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{assignment.description}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {lang === 'ar' ? `الدرجة: ${assignment.total_marks}` : `Marks: ${assignment.total_marks}`}
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {lang === 'ar' ? `ينتهي: ${new Date(assignment.time_end).toLocaleDateString()}` : `Ends: ${new Date(assignment.time_end).toLocaleDateString()}`}
            </span>
          </div>
        </div>
        <Button size="sm" variant="ghost" className="shrink-0">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const StudentCard: React.FC<{ student: Student; idx: number; lang: string; formatDate: (date: string) => string }> = ({ 
  student, idx, lang, formatDate 
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: idx * 0.05 }}
    whileHover={{ y: -3 }}
    className="p-4 rounded-xl bg-gradient-to-r from-card to-muted/20 border shadow-sm"
  >
    <div className="flex items-start gap-3">
      <Avatar className="h-12 w-12 border-2 border-primary/20">
        {student.imageUrl ? (
          <AvatarImage src={student.imageUrl} alt={student.name} />
        ) : null}
        <AvatarFallback className="bg-gradient-to-r from-primary/20 to-secondary/20 text-lg font-bold">
          {student.name?.charAt(0)?.toUpperCase() || 'S'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold">{student.name}</p>
            <p className="text-xs text-muted-foreground">ID: {student.id}</p>
          </div>
          <Badge variant={student.active ? "default" : "secondary"} className="text-[10px]">
            {student.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
          </Badge>
        </div>
        
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{student.phone}</span>
          </div>
          {student.phone_parent && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{lang === 'ar' ? 'ولي الأمر:' : 'Parent:'} {student.phone_parent}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {student.type_of_attendance === 'online' ? (
              <Globe className="h-3 w-3 text-blue-500" />
            ) : (
              <MapPin className="h-3 w-3 text-green-500" />
            )}
            <span>
              {student.type_of_attendance === 'online' 
                ? (lang === 'ar' ? 'أونلاين' : 'Online')
                : (lang === 'ar' ? 'سنتر' : 'Center')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            <span>{lang === 'ar' ? 'تاريخ التسجيل:' : 'Joined:'} {formatDate(student.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const SummaryCard: React.FC<{ icon: React.ElementType; label: string; value: number; color: string }> = ({ 
  icon: Icon, label, value, color 
}) => (
  <div className="text-center p-3 rounded-xl bg-muted/30 border">
    <Icon className={`h-5 w-5 text-${color}-500 mx-auto mb-1`} />
    <p className="text-xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const EmptyState: React.FC<{ icon: React.ElementType; message: string }> = ({ icon: Icon, message }) => (
  <div className="text-center py-12 bg-muted/30 rounded-xl">
    <Icon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-3" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);