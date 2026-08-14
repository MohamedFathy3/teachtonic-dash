/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/AttendancePage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import api from '@/lib/api';
import { useTeacherMeta } from '@/hooks/useTeacherMeta';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import {
  Loader2,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  QrCode,
  User,
  Phone,
  BookOpen,
  GraduationCap,
  Sparkles,
  RefreshCw,
  AlertCircle,
  UserCheck,
  UserX,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Types
interface AttendanceRecord {
  id: number;
  name: string;
  phone: string;
  barcode: string;
  type_of_attendance: 'online' | 'center' | null;
  stage_id: number | null;
  teacher_id: number;
  created_at: string;
  attended: boolean;
  attended_at: string | null;
  stage?: {
    id: number;
    name: string;
    name_ar: string;
  };
  course_detail?: {
    id: number;
    title: string;
    title_ar: string;
    course_id: number;
    course?: {
      id: number;
      title: string;
      title_ar: string;
      type: 'online' | 'center';
      subject?: {
        id: number;
        name: string;
        name_ar: string;
      };
      stage?: {
        id: number;
        name: string;
        name_ar: string;
      };
    };
  };
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from: number;
  to: number;
}

interface Filters {
  name: string;
  phone: string;
  barcode: string;
  stage_id: number | null;
  course_id: number | null;
  course_detail_id: number | null;
  type_of_attendance: 'online' | 'center' | null;
  teacher_id: number | null;
}

interface Course {
  id: number;
  title: string;
  title_ar: string;
  type: 'online' | 'center';
  stage_id: number | null;
  subject_id: number | null;
}

interface CourseDetail {
  id: number;
  title: string;
  title_ar: string;
  course_id: number;
}

// Student interface for marking attendance
interface Student {
  id: number;
  name: string;
  phone: string;
  barcode: string;
  attended: boolean;
  attendance_id?: number;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
};

export const AttendancePage: React.FC = () => {
  const { t, lang, user } = useApp();
  const isRTL = lang === 'ar';

  // Get teacher meta data (stages, subjects, etc.)
  const { stages, loading: metaLoading } = useTeacherMeta(user?.id);

  // State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    name: '',
    phone: '',
    barcode: '',
    stage_id: null,
    course_id: null,
    course_detail_id: null,
    type_of_attendance: null,
    teacher_id: user?.id || null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
    from: 0,
    to: 0,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseDetails, setCourseDetails] = useState<CourseDetail[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [deletingAttendance, setDeletingAttendance] = useState<AttendanceRecord | null>(null);

  // New state for marking attendance
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [markingAttendance, setMarkingAttendance] = useState<number | null>(null);

  // Fetch attendance records
  const fetchAttendance = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const filterParams: any = {
          teacher_id: user?.id,
        };

        if (filters.name) filterParams.name = filters.name;
        if (filters.phone) filterParams.phone = filters.phone;
        if (filters.barcode) filterParams.barcode = filters.barcode;
        if (filters.stage_id) filterParams.stage_id = filters.stage_id;
        if (filters.course_detail_id)
          filterParams.course_detail_id = filters.course_detail_id;
        if (filters.type_of_attendance)
          filterParams.type_of_attendance = filters.type_of_attendance;

        console.log('📡 Fetching attendance with filters:', filterParams);

        const response = await api.post('/all/attendance-index', {
          filters: filterParams,
          orderBy: 'id',
          orderByDirection: 'desc',
          perPage: pagination.per_page,
          paginate: true,
          delete: false,
          page,
        });

        console.log('📥 Attendance response:', response.data);

        const data = response.data?.data || [];
        const meta = response.data?.meta || response.data?.pagination || {};

        setAttendanceRecords(data);
        setPagination({
          current_page: meta.current_page || 1,
          last_page: meta.last_page || 1,
          total: meta.total || 0,
          per_page: meta.per_page || 10,
          from: meta.from || 0,
          to: meta.to || 0,
        });
      } catch (err: any) {
        console.error('❌ Error fetching attendance:', err);
        setError(err.message || 'Failed to fetch attendance records');
        toast.error(
          lang === 'ar' ? 'حدث خطأ في جلب بيانات الحضور' : 'Failed to fetch attendance'
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.per_page, user?.id, lang]
  );

  // Fetch courses for filter - based on attendance type
  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    setLoadingCourses(true);

    try {
      const filterParams: any = {
        teacher_id: user.id,
      };

      if (filters.type_of_attendance) {
        filterParams.type = filters.type_of_attendance;
      }

      console.log('📡 Fetching courses with filters:', filterParams);

      const response = await api.post('/course/index', {
        filters: filterParams,
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage: 100,
        paginate: false,
        delete: false,
      });

      console.log('📥 Courses response:', response.data);

      const courseData = response.data?.data || [];
      setCourses(courseData);

      if (filters.course_id) {
        const courseExists = courseData.some((c: Course) => c.id === filters.course_id);
        if (!courseExists) {
          handleFilterChange('course_id', null);
        }
      }

      if (filters.course_id) {
        await fetchCourseDetails(filters.course_id);
      } else {
        setCourseDetails([]);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  }, [user?.id, filters.type_of_attendance, filters.course_id]);

  // Fetch course details for a specific course
  const fetchCourseDetails = useCallback(async (courseId: number) => {
    if (!courseId) return;

    try {
      console.log('📡 Fetching course details for course_id:', courseId);

      const response = await api.post('/course-detail/index', {
        filters: {
          course_id: courseId,
        },
        orderBy: 'id',
        orderByDirection: 'desc',
        perPage: 100,
        paginate: false,
        delete: false,
      });

      console.log('📥 Course details response:', response.data);

      const details = response.data?.data || [];
      setCourseDetails(details);
    } catch (error) {
      console.error('❌ Error fetching course details:', error);
      setCourseDetails([]);
    }
  }, []);

  // Fetch students for a course detail (to mark attendance)
  const fetchStudentsForCourseDetail = useCallback(async (courseDetailId: number) => {
    if (!courseDetailId) return;

    setLoadingStudents(true);
    try {
      console.log('📡 Fetching students for course_detail_id:', courseDetailId);

      // Fetch students enrolled in this course detail
      const response = await api.post('/course-detail/students', {
        course_detail_id: courseDetailId,
        teacher_id: user?.id,
      });

      console.log('📥 Students response:', response.data);

      const studentData = response.data?.data || [];
      setStudents(studentData);
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      toast.error(
        lang === 'ar' ? 'حدث خطأ في جلب الطلاب' : 'Failed to fetch students'
      );
    } finally {
      setLoadingStudents(false);
    }
  }, [user?.id, lang]);

  // Toggle attendance for a student
  const toggleStudentAttendance = useCallback(async (studentId: number, attended: boolean) => {
    if (!selectedCourseDetail) return;

    setMarkingAttendance(studentId);
    try {
      const payload = {
        student_id: studentId,
        course_detail_id: selectedCourseDetail,
        teacher_id: user?.id,
        attended: attended,
      };

      console.log('📡 Marking attendance:', payload);

      const response = await api.post('/attendance/mark', payload);
      console.log('📥 Mark attendance response:', response.data);

      // Update local state
      setStudents(prev =>
        prev.map(s =>
          s.id === studentId
            ? { ...s, attended, attendance_id: response.data?.data?.id }
            : s
        )
      );

      toast.success(
        attended
          ? (lang === 'ar' ? 'تم تسجيل الحضور بنجاح' : 'Attendance marked successfully')
          : (lang === 'ar' ? 'تم إلغاء الحضور بنجاح' : 'Attendance unmarked successfully')
      );

      // Refresh the main attendance list
      fetchAttendance(pagination.current_page);
    } catch (error: any) {
      console.error('❌ Error marking attendance:', error);
      toast.error(
        lang === 'ar' ? 'حدث خطأ في تسجيل الحضور' : 'Failed to mark attendance'
      );
    } finally {
      setMarkingAttendance(null);
    }
  }, [selectedCourseDetail, user?.id, lang, fetchAttendance, pagination.current_page]);

  // Fetch course details when course_id changes
  useEffect(() => {
    if (filters.course_id) {
      fetchCourseDetails(filters.course_id);
    } else {
      setCourseDetails([]);
    }
  }, [filters.course_id, fetchCourseDetails]);

  // Fetch courses when type_of_attendance changes
  useEffect(() => {
    fetchCourses();
  }, [filters.type_of_attendance]);

  // Initial data fetch
  useEffect(() => {
    fetchAttendance(1);
    fetchCourses();
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchAttendance(1);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      
      if (key === 'type_of_attendance') {
        newFilters.course_id = null;
        newFilters.course_detail_id = null;
      }
      
      if (key === 'course_id') {
        newFilters.course_detail_id = null;
      }
      
      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      name: '',
      phone: '',
      barcode: '',
      stage_id: null,
      course_id: null,
      course_detail_id: null,
      type_of_attendance: null,
      teacher_id: user?.id || null,
    });
    setSearchQuery('');
    setShowFilters(false);
    setCourseDetails([]);
    fetchAttendance(1);
  };

  // Handle pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      fetchAttendance(page);
    }
  };

// Handle delete attendance - التعديل المطلوب
const handleDeleteAttendance = async (attendance: AttendanceRecord) => {
  try {
    // ✅ التعديل هنا: استخدم course_detail_id و student_id بدلاً من attendance.id
    const courseDetailId = attendance.course_detail?.id;
    const studentId = attendance.id; // أو attendance.student_id حسب الـ API بتاعك
    
    if (!courseDetailId) {
      toast.error(
        lang === 'ar' ? 'لا يوجد درس مرتبط بهذا الحضور' : 'No course detail associated with this attendance'
      );
      return;
    }

    // ✅ الـ endpoint الصحيح: attendance/{courseDetail}/{student}
    await api.delete(`/attendance/${courseDetailId}/${studentId}`);
    
    toast.success(
      lang === 'ar' ? 'تم حذف سجل الحضور بنجاح' : 'Attendance record deleted successfully'
    );
    fetchAttendance(pagination.current_page);
    setDeletingAttendance(null);
  } catch (err: any) {
    console.error('❌ Error deleting attendance:', err);
    toast.error(
      lang === 'ar' ? 'حدث خطأ في حذف سجل الحضور' : 'Failed to delete attendance record'
    );
  }
};

  // Handle marking attendance modal
  const handleMarkAttendance = (courseDetailId: number) => {
    setSelectedCourseDetail(courseDetailId);
    setShowMarkAttendance(true);
    fetchStudentsForCourseDetail(courseDetailId);
  };

  // Get attendance type badge
  const getAttendanceTypeBadge = (type: string | null) => {
    if (!type) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600">
          {lang === 'ar' ? 'غير محدد' : 'Unknown'}
        </Badge>
      );
    }

    if (type === 'online') {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          <UserCheck className="h-3 w-3 mr-1" />
          {lang === 'ar' ? 'أونلاين' : 'Online'}
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-500 hover:bg-green-600 text-white">
        <Users className="h-3 w-3 mr-1" />
        {lang === 'ar' ? 'سنتر' : 'Center'}
      </Badge>
    );
  };

  // Get attendance status badge
  const getAttendanceStatusBadge = (attended: boolean) => {
    if (attended) {
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {lang === 'ar' ? 'حاضر' : 'Present'}
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        {lang === 'ar' ? 'غائب' : 'Absent'}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get stage name
  const getStageName = (record: AttendanceRecord) => {
    if (record.stage) {
      return isRTL ? record.stage.name_ar || record.stage.name : record.stage.name || record.stage.name_ar;
    }
    if (record.course_detail?.course?.stage) {
      const stage = record.course_detail.course.stage;
      return isRTL ? stage.name_ar || stage.name : stage.name || stage.name_ar;
    }
    return '-';
  };

  // Get course title
  const getCourseTitle = (record: AttendanceRecord) => {
    if (record.course_detail?.course) {
      return isRTL
        ? record.course_detail.course.title_ar || record.course_detail.course.title
        : record.course_detail.course.title || record.course_detail.course.title_ar;
    }
    return '-';
  };

  // Get course detail title
  const getCourseDetailTitle = (record: AttendanceRecord) => {
    if (record.course_detail) {
      return isRTL
        ? record.course_detail.title_ar || record.course_detail.title
        : record.course_detail.title || record.course_detail.title_ar;
    }
    return '-';
  };

  // Stats
  const stats = useMemo(() => {
    const total = pagination.total || 0;
    const online = attendanceRecords.filter((r) => r.type_of_attendance === 'online').length;
    const center = attendanceRecords.filter((r) => r.type_of_attendance === 'center').length;
    const present = attendanceRecords.filter((r) => r.attended).length;
    const absent = attendanceRecords.filter((r) => !r.attended).length;
    return { total, online, center, present, absent };
  }, [attendanceRecords, pagination.total]);

  // Available stages from teacher meta or from attendance
  const availableStages = useMemo(() => {
    if (stages && stages.length > 0) {
      return stages;
    }
    const stageMap = new Map();
    attendanceRecords.forEach((record) => {
      if (record.stage_id) {
        stageMap.set(record.stage_id, {
          id: record.stage_id,
          name: record.stage?.name || `Stage ${record.stage_id}`,
          name_ar: record.stage?.name_ar || `مرحلة ${record.stage_id}`,
        });
      }
    });
    return Array.from(stageMap.values());
  }, [stages, attendanceRecords]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Header */}
        <motion.div variants={headerVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-xl opacity-60" />
                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {lang === 'ar' ? 'إدارة الحضور' : 'Attendance Management'}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Sparkles className="h-3 w-3" />
                  {pagination.total} {lang === 'ar' ? 'سجل حضور' : 'attendance records'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => fetchAttendance(pagination.current_page)}
              disabled={loading}
              variant="outline"
              className="gap-2 rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {lang === 'ar' ? 'تحديث' : 'Refresh'}
            </Button>

            <ExportExcelButton
              data={attendanceRecords.map((record) => ({
                'ID': record.id,
                'Name': record.name,
                'Phone': record.phone,
                'Barcode': record.barcode,
                'Type': record.type_of_attendance || 'N/A',
                'Status': record.attended ? 'Present' : 'Absent',
                'Date': formatDate(record.created_at),
              }))}
              fileName="attendance-records"
              label={lang === 'ar' ? 'تصدير' : 'Export'}
              disabled={loading || attendanceRecords.length === 0}
            />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              label: lang === 'ar' ? 'إجمالي' : 'Total',
              value: stats.total,
              icon: Users,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              label: lang === 'ar' ? 'أونلاين' : 'Online',
              value: stats.online,
              icon: UserCheck,
              color: 'from-purple-500 to-pink-500',
            },
            {
              label: lang === 'ar' ? 'سنتر' : 'Center',
              value: stats.center,
              icon: Users,
              color: 'from-green-500 to-emerald-500',
            },
            {
              label: lang === 'ar' ? 'حاضر' : 'Present',
              value: stats.present,
              icon: CheckCircle2,
              color: 'from-emerald-500 to-teal-500',
            },
            {
              label: lang === 'ar' ? 'غائب' : 'Absent',
              value: stats.absent,
              icon: XCircle,
              color: 'from-red-500 to-rose-500',
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r p-4 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${stat.color.split(' ')[1]}20, ${stat.color.split(' ')[3]}10)` }}
            >
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            </motion.div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={lang === 'ar' ? 'بحث بالاسم أو التليفون أو الباركود' : 'Search by name, phone, or barcode'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 pr-4 rounded-xl bg-white dark:bg-gray-800"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              >
                <Search className="h-4 w-4 mr-2" />
                {lang === 'ar' ? 'بحث' : 'Search'}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-xl transition-all duration-300 ${
                  showFilters ? 'border-primary bg-primary/10' : ''
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                {lang === 'ar' ? 'فلتر' : 'Filter'}
                {Object.values(filters).some(
                  (v) => v !== null && v !== '' && v !== user?.id
                ) && (
                  <Badge variant="secondary" className="ml-2">
                    {lang === 'ar' ? 'مفعل' : 'Active'}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-xl rounded-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Name Filter */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm font-medium">
                        <User className="h-4 w-4 text-purple-500" />
                        {lang === 'ar' ? 'الاسم' : 'Name'}
                      </Label>
                      <Input
                        placeholder={lang === 'ar' ? 'اسم الطالب' : 'Student name'}
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    {/* Phone Filter */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm font-medium">
                        <Phone className="h-4 w-4 text-blue-500" />
                        {lang === 'ar' ? 'التليفون' : 'Phone'}
                      </Label>
                      <Input
                        placeholder={lang === 'ar' ? 'رقم التليفون' : 'Phone number'}
                        value={filters.phone}
                        onChange={(e) => handleFilterChange('phone', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    {/* Barcode Filter */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm font-medium">
                        <QrCode className="h-4 w-4 text-orange-500" />
                        {lang === 'ar' ? 'الباركود' : 'Barcode'}
                      </Label>
                      <Input
                        placeholder={lang === 'ar' ? 'رمز الباركود' : 'Barcode'}
                        value={filters.barcode}
                        onChange={(e) => handleFilterChange('barcode', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    {/* Stage Filter */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm font-medium">
                        <GraduationCap className="h-4 w-4 text-green-500" />
                        {lang === 'ar' ? 'المرحلة' : 'Stage'}
                      </Label>
                      <Select
                        value={filters.stage_id?.toString() || 'all'}
                        onValueChange={(val) =>
                          handleFilterChange('stage_id', val === 'all' ? null : Number(val))
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue
                            placeholder={lang === 'ar' ? 'جميع المراحل' : 'All Stages'}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {lang === 'ar' ? 'الكل' : 'All'}
                          </SelectItem>
                          {availableStages.map((stage: any) => (
                            <SelectItem key={stage.id} value={stage.id.toString()}>
                              {isRTL ? stage.name_ar || stage.name : stage.name || stage.name_ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Attendance Type = Course Type */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm font-medium">
                        <UserCheck className="h-4 w-4 text-cyan-500" />
                        {lang === 'ar' ? 'نوع الحضور' : 'Attendance Type'}
                      </Label>
                      <Select
                        value={filters.type_of_attendance || 'all'}
                        onValueChange={(val) =>
                          handleFilterChange(
                            'type_of_attendance',
                            val === 'all' ? null : (val as 'online' | 'center')
                          )
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue
                            placeholder={lang === 'ar' ? 'جميع الأنواع' : 'All Types'}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {lang === 'ar' ? 'الكل' : 'All'}
                          </SelectItem>
                          <SelectItem value="online">
                            {lang === 'ar' ? 'أونلاين' : 'Online'}
                          </SelectItem>
                          <SelectItem value="center">
                            {lang === 'ar' ? 'سنتر' : 'Center'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Course Filter - based on attendance type */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm font-medium">
                        <BookOpen className="h-4 w-4 text-indigo-500" />
                        {lang === 'ar' ? 'الكورس' : 'Course'}
                      </Label>
                      <Select
                        value={filters.course_id?.toString() || 'all'}
                        onValueChange={(val) =>
                          handleFilterChange('course_id', val === 'all' ? null : Number(val))
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue
                            placeholder={
                              courses.length === 0 && filters.type_of_attendance
                                ? (lang === 'ar' ? 'لا توجد كورسات' : 'No courses found')
                                : (lang === 'ar' ? 'جميع الكورسات' : 'All Courses')
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {lang === 'ar' ? 'الكل' : 'All'}
                          </SelectItem>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {isRTL ? course.title_ar || course.title : course.title || course.title_ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {courses.length === 0 && filters.type_of_attendance && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {lang === 'ar' 
                            ? `لا توجد كورسات ${filters.type_of_attendance === 'online' ? 'أونلاين' : 'سنتر'}`
                            : `No ${filters.type_of_attendance} courses found`}
                        </p>
                      )}
                    </div>

                    {/* Course Detail (Lesson) Filter - based on selected course */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm font-medium">
                        <BookOpen className="h-4 w-4 text-rose-500" />
                        {lang === 'ar' ? 'الدرس' : 'Lesson'}
                      </Label>
                      <Select
                        value={filters.course_detail_id?.toString() || 'all'}
                        onValueChange={(val) =>
                          handleFilterChange(
                            'course_detail_id',
                            val === 'all' ? null : Number(val)
                          )
                        }
                        disabled={!filters.course_id}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue
                            placeholder={
                              !filters.course_id
                                ? (lang === 'ar' ? 'اختر الكورس أولاً' : 'Select course first')
                                : courseDetails.length === 0
                                ? (lang === 'ar' ? 'لا توجد دروس' : 'No lessons found')
                                : (lang === 'ar' ? 'جميع الدروس' : 'All Lessons')
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {lang === 'ar' ? 'الكل' : 'All'}
                          </SelectItem>
                          {courseDetails.map((detail) => (
                            <SelectItem key={detail.id} value={detail.id.toString()}>
                              {isRTL
                                ? detail.titles_ar || detail.titles || `درس ${detail.id}`
                                : detail.titles_ar || detail.titles || `Lesson ${detail.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex items-end gap-2 col-span-full md:col-span-1">
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="rounded-xl flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowFilters(false);
                          fetchAttendance(1);
                        }}
                        className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white flex-1"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {lang === 'ar' ? 'تطبيق' : 'Apply'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attendance Table with Mark Attendance Button */}
          <Tabs defaultValue="all" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg">
                  {lang === 'ar' ? 'الكل' : 'All'} ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="online" className="rounded-lg">
                  {lang === 'ar' ? 'أونلاين' : 'Online'} ({stats.online})
                </TabsTrigger>
                <TabsTrigger value="center" className="rounded-lg">
                  {lang === 'ar' ? 'سنتر' : 'Center'} ({stats.center})
                </TabsTrigger>
                <TabsTrigger value="present" className="rounded-lg">
                  {lang === 'ar' ? 'حاضر' : 'Present'} ({stats.present})
                </TabsTrigger>
                <TabsTrigger value="absent" className="rounded-lg">
                  {lang === 'ar' ? 'غائب' : 'Absent'} ({stats.absent})
                </TabsTrigger>
              </TabsList>

              {/* Mark Attendance Button */}
              <Button
                onClick={() => {
                  // Show course detail selection for marking attendance
                  if (courses.length === 0) {
                    toast.error(
                      lang === 'ar' ? 'لا توجد كورسات متاحة' : 'No courses available'
                    );
                    return;
                  }
                  // Open a dialog to select course detail
                  setShowMarkAttendance(true);
                  setSelectedCourseDetail(null);
                  setStudents([]);
                }}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                {lang === 'ar' ? 'تسجيل حضور' : 'Mark Attendance'}
              </Button>
            </div>

            <TabsContent value="all" className="mt-4">
              <AttendanceTable
                records={attendanceRecords}
                loading={loading}
                error={error}
                getAttendanceTypeBadge={getAttendanceTypeBadge}
                getAttendanceStatusBadge={getAttendanceStatusBadge}
                getStageName={getStageName}
                getCourseTitle={getCourseTitle}
                getCourseDetailTitle={getCourseDetailTitle}
                formatDate={formatDate}
                isRTL={isRTL}
                lang={lang}
                onDelete={(record) => setDeletingAttendance(record)}
                onMarkAttendance={handleMarkAttendance}
              />
            </TabsContent>

            <TabsContent value="online" className="mt-4">
              <AttendanceTable
                records={attendanceRecords.filter((r) => r.type_of_attendance === 'online')}
                loading={loading}
                error={error}
                getAttendanceTypeBadge={getAttendanceTypeBadge}
                getAttendanceStatusBadge={getAttendanceStatusBadge}
                getStageName={getStageName}
                getCourseTitle={getCourseTitle}
                getCourseDetailTitle={getCourseDetailTitle}
                formatDate={formatDate}
                isRTL={isRTL}
                lang={lang}
                onDelete={(record) => setDeletingAttendance(record)}
                onMarkAttendance={handleMarkAttendance}
              />
            </TabsContent>

            <TabsContent value="center" className="mt-4">
              <AttendanceTable
                records={attendanceRecords.filter((r) => r.type_of_attendance === 'center')}
                loading={loading}
                error={error}
                getAttendanceTypeBadge={getAttendanceTypeBadge}
                getAttendanceStatusBadge={getAttendanceStatusBadge}
                getStageName={getStageName}
                getCourseTitle={getCourseTitle}
                getCourseDetailTitle={getCourseDetailTitle}
                formatDate={formatDate}
                isRTL={isRTL}
                lang={lang}
                onDelete={(record) => setDeletingAttendance(record)}
                onMarkAttendance={handleMarkAttendance}
              />
            </TabsContent>

            <TabsContent value="present" className="mt-4">
              <AttendanceTable
                records={attendanceRecords.filter((r) => r.attended)}
                loading={loading}
                error={error}
                getAttendanceTypeBadge={getAttendanceTypeBadge}
                getAttendanceStatusBadge={getAttendanceStatusBadge}
                getStageName={getStageName}
                getCourseTitle={getCourseTitle}
                getCourseDetailTitle={getCourseDetailTitle}
                formatDate={formatDate}
                isRTL={isRTL}
                lang={lang}
                onDelete={(record) => setDeletingAttendance(record)}
                onMarkAttendance={handleMarkAttendance}
              />
            </TabsContent>

            <TabsContent value="absent" className="mt-4">
              <AttendanceTable
                records={attendanceRecords.filter((r) => !r.attended)}
                loading={loading}
                error={error}
                getAttendanceTypeBadge={getAttendanceTypeBadge}
                getAttendanceStatusBadge={getAttendanceStatusBadge}
                getStageName={getStageName}
                getCourseTitle={getCourseTitle}
                getCourseDetailTitle={getCourseDetailTitle}
                formatDate={formatDate}
                isRTL={isRTL}
                lang={lang}
                onDelete={(record) => setDeletingAttendance(record)}
                onMarkAttendance={handleMarkAttendance}
              />
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {pagination.total > pagination.per_page && (
            <div className="flex items-center justify-between flex-wrap gap-4 pt-4">
              <p className="text-sm text-muted-foreground">
                {lang === 'ar'
                  ? `عرض ${pagination.from} - ${pagination.to} من ${pagination.total}`
                  : `Showing ${pagination.from} - ${pagination.to} of ${pagination.total}`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-10 h-10"
                  onClick={() => goToPage(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                >
                  <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
                <div className="flex gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.last_page) },
                    (_, i) => {
                      let pageNum = pagination.current_page;
                      if (pagination.last_page <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.current_page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.current_page >= pagination.last_page - 2) {
                        pageNum = pagination.last_page - 4 + i;
                      } else {
                        pageNum = pagination.current_page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.current_page === pageNum ? 'default' : 'outline'}
                          size="icon"
                          className="rounded-full w-10 h-10"
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-10 h-10"
                  onClick={() => goToPage(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                >
                  <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Mark Attendance Modal */}
      <AnimatePresence>
        {showMarkAttendance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowMarkAttendance(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  {lang === 'ar' ? 'تسجيل حضور الطلاب' : 'Mark Student Attendance'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => setShowMarkAttendance(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Course Detail Selection */}
              <div className="mb-6">
                <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <BookOpen className="h-4 w-4 text-rose-500" />
                  {lang === 'ar' ? 'اختر الدرس' : 'Select Lesson'}
                </Label>
                <Select
                  value={selectedCourseDetail?.toString() || ''}
                  onValueChange={(val) => {
                    const id = Number(val);
                    setSelectedCourseDetail(id);
                    fetchStudentsForCourseDetail(id);
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue
                      placeholder={lang === 'ar' ? 'اختر درس...' : 'Select a lesson...'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {courseDetails.map((detail) => (
                      <SelectItem key={detail.id} value={detail.id.toString()}>
                        {isRTL
                          ? detail.title_ar || detail.title || `درس ${detail.id}`
                          : detail.title || detail.title_ar || `Lesson ${detail.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Students List */}
              {loadingStudents ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {selectedCourseDetail
                      ? (lang === 'ar' ? 'لا يوجد طلاب في هذا الدرس' : 'No students in this lesson')
                      : (lang === 'ar' ? 'اختر درس لعرض الطلاب' : 'Select a lesson to view students')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm text-muted-foreground">
                      {lang === 'ar' ? `عدد الطلاب: ${students.length}` : `Students: ${students.length}`}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => {
                          students.forEach(s => {
                            if (!s.attended) {
                              toggleStudentAttendance(s.id, true);
                            }
                          });
                        }}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {lang === 'ar' ? 'تسجيل الكل' : 'Mark All'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => {
                          students.forEach(s => {
                            if (s.attended) {
                              toggleStudentAttendance(s.id, false);
                            }
                          });
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {lang === 'ar' ? 'إلغاء الكل' : 'Unmark All'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {students.map((student) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                          student.attended
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                            {student.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.phone}</p>
                          </div>
                        </div>
                        <Button
                          variant={student.attended ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-xl transition-all ${
                            student.attended
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                          }`}
                          onClick={() => toggleStudentAttendance(student.id, !student.attended)}
                          disabled={markingAttendance === student.id}
                        >
                          {markingAttendance === student.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : student.attended ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              {lang === 'ar' ? 'حاضر' : 'Present'}
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              {lang === 'ar' ? 'تسجيل' : 'Mark'}
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowMarkAttendance(false)}>
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deletingAttendance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setDeletingAttendance(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-2">
                {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {lang === 'ar'
                  ? `هل أنت متأكد من حذف سجل حضور "${deletingAttendance.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                  : `Are you sure you want to delete attendance record for "${deletingAttendance.name}"? This action cannot be undone.`}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeletingAttendance(null)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteAttendance(deletingAttendance)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {lang === 'ar' ? 'حذف' : 'Delete'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Attendance Table Component
interface AttendanceTableProps {
  records: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  getAttendanceTypeBadge: (type: string | null) => React.ReactNode;
  getAttendanceStatusBadge: (attended: boolean) => React.ReactNode;
  getStageName: (record: AttendanceRecord) => string;
  getCourseTitle: (record: AttendanceRecord) => string;
  getCourseDetailTitle: (record: AttendanceRecord) => string;
  formatDate: (date: string) => string;
  isRTL: boolean;
  lang: string;
  onDelete: (record: AttendanceRecord) => void;
  onMarkAttendance?: (courseDetailId: number) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  loading,
  error,
  getAttendanceTypeBadge,
  getAttendanceStatusBadge,
  getStageName,
  getCourseTitle,
  getCourseDetailTitle,
  formatDate,
  isRTL,
  lang,
  onDelete,
  onMarkAttendance,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="rounded-xl border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg">
            {lang === 'ar' ? 'لا توجد سجلات حضور' : 'No attendance records found'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl overflow-hidden border bg-background/80 backdrop-blur-md shadow-2xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5">
            <TableRow>
              <TableHead className="text-right font-bold">
                {lang === 'ar' ? 'الطالب' : 'Student'}
              </TableHead>
              <TableHead className="text-right font-bold hidden md:table-cell">
                {lang === 'ar' ? 'الباركود' : 'Barcode'}
              </TableHead>
              <TableHead className="text-center font-bold hidden sm:table-cell">
                {lang === 'ar' ? 'النوع' : 'Type'}
              </TableHead>
              <TableHead className="text-center font-bold">
                {lang === 'ar' ? 'الحالة' : 'Status'}
              </TableHead>
              <TableHead className="text-right font-bold hidden md:table-cell">
                {lang === 'ar' ? 'التاريخ' : 'Date'}
              </TableHead>
              <TableHead className="text-center font-bold">
                {lang === 'ar' ? 'إجراء' : 'Action'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record, idx) => (
              <motion.tr
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group transition-all duration-300 hover:bg-primary/5"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                      {record.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{record.name || '-'}</p>
                      <p className="text-xs text-muted-foreground">{record.phone || '-'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {record.barcode ? (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {record.barcode}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell">
                  {getAttendanceTypeBadge(record.type_of_attendance)}
                </TableCell>
                <TableCell className="text-center">
                  {getAttendanceStatusBadge(record.attended)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(record.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {record.course_detail?.id && onMarkAttendance && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/20"
                        onClick={() => onMarkAttendance(record.course_detail!.id)}
                        title={lang === 'ar' ? 'تسجيل حضور' : 'Mark attendance'}
                      >
                        <Check className="h-4 w-4 text-emerald-500" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20"
                      onClick={() => onDelete(record)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default AttendancePage;