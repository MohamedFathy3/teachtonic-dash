/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/TeacherDashboard.tsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import teachersService from '@/services/teachers.service';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AvatarBadge } from '@/components/lms/AvatarBadge';
import { StatusBadge } from '@/components/lms/StatusBadge';
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard';
import api from '@/lib/api';
import { 
  BookOpen, Users, FileText, TrendingUp,
  Calendar, CheckCircle, BarChart3,
  Eye, Search, Building, Loader2, DollarSign, 
  Ticket, FileQuestion, Layers, Mail, BookMarked,
  X, ChevronRight, Sparkles, Target, Activity, GraduationCap,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast  } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';

// استيراد الـ Components المنفصلة
import { CourseLessons } from './CourseLessons';
import { CourseExams } from './CourseExams';
import { CourseAssignments } from './CourseAssignments';
import { CourseBooks } from './CourseBooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeCustomizer } from './ThemeCustomizer';
import { StudentsFilters } from './StudentsFilters';
import { StudentsTable } from './StudentsTable';
import { useTeacherMeta } from '@/hooks/useTeacherMeta';

interface TeacherDashboardProps {
  teacherId: number;
  teacherName: string;
}

interface TeacherReport {
  teachers_count: number;
  online_courses: number;
  center_courses: number;
  students_count: number;
  profits: number;
  used_coupons: number;
  exams_count: number;
  assignments_count: number;
  semesters_count: number;
  requests_count: number;
  books_count: number;
}

// ===================== COMPONENTS =====================

// Badge Component
const Badge = ({ children, variant, className }: any) => {
  const baseClass = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variantClass = variant === 'secondary' 
    ? "bg-secondary text-secondary-foreground" 
    : "bg-primary text-primary-foreground";
  return <span className={`${baseClass} ${variantClass} ${className}`}>{children}</span>;
};

// Stats Card Component
const StatsCard = ({ stat, index, gradient }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500`} />
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {stat.change} from last month
            </p>
          </div>
          <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <stat.icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

// Secondary Stats Card
const SecondaryStatsCard = ({ stat, index }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.2 + index * 0.05 }}
  >
    <Card className="p-4 text-center group hover:shadow-md transition-all">
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-2 shadow-md`}>
        <stat.icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-2xl font-bold">{stat.value}</p>
      <p className="text-xs text-muted-foreground">{stat.label}</p>
    </Card>
  </motion.div>
);

// Course Card Component
const CourseCard = ({ course, onView, onViewStudents, idx }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.1 }}
  >
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => onView(course)}>
        <img
          src={course.image || '/placeholder-course.png'}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-3 right-3">
          <StatusBadge status={course.status as any} />
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-black">
              ${course.price}
            </span>
            {course.discount > 0 && (
              <span className="px-2 py-1 rounded-lg bg-red-500 text-xs text-white">
                -{course.discount}%
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{course.semesterName ?? course.category}</p>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{course.students}</p>
            <p className="text-[10px] text-muted-foreground">Students</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{course.lessonsCount}</p>
            <p className="text-[10px] text-muted-foreground">Lessons</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{course.examsCount}</p>
            <p className="text-[10px] text-muted-foreground">Exams</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button 
            variant="outline" 
            className="flex-1 gap-2 group-hover:bg-primary group-hover:text-white transition-all"
            onClick={() => onView(course)}
          >
            <Eye className="h-4 w-4" />
            View Details
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onViewStudents(course);
            }}
            className="shrink-0"
            title="View Students"
          >
            <Users className="h-4 w-4" />
            <span className="ml-1 text-xs">{course.students}</span>
          </Button>
        </div>
      </div>
    </Card>
  </motion.div>
);

// Semester Card Component
const SemesterCard = ({ semester, dashboardCourses, onViewCourse, onViewStudents, idx }: any) => (
  <motion.div
    key={semester.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.1 }}
  >
    <Card className="overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-primary/10 to-transparent border-b">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold">{semester.name}</h3>
            <p className="text-sm text-muted-foreground">{semester.name_ar}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={semester.active ? 'default' : 'secondary'}>
              {semester.active ? 'Active' : 'Inactive'}
            </Badge>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium">${semester.price}</span>
              {semester.discount > 0 && (
                <span className="text-xs line-through text-muted-foreground">
                  ${(parseFloat(semester.price) + parseFloat(semester.discount)).toFixed(2)}
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onViewStudents(semester)}
              className="gap-1"
            >
              <Users className="h-4 w-4" />
              {semester.studentsCount || 0}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-5">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Courses in this semester ({semester.courses?.length || 0})
        </h4>
        {semester.courses && semester.courses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {semester.courses.map((course: any) => {
              const matchedCourse = dashboardCourses.find((c: any) => c.id === course.id);
              return (
                <Card 
                  key={course.id} 
                  className="group cursor-pointer hover:shadow-md transition-all overflow-hidden"
                  onClick={() => onViewCourse(course)}
                >
                  <div className="relative h-32 overflow-hidden">
                    <img 
                      src={course.imageUrl || '/placeholder-course.png'} 
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        course.type === 'online' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-purple-500 text-white'
                      }`}>
                        {course.type === 'online' ? 'Online' : 'Center'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h5 className="font-semibold line-clamp-1">{course.title}</h5>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-muted-foreground">
                        👥 {matchedCourse?.students || course.count_student || 0} students
                      </span>
                      <span className="text-green-600 font-medium">
                        ${matchedCourse?.price || course.price || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>📚 {matchedCourse?.lessonsCount || 0} lessons</span>
                      <span>📝 {matchedCourse?.examsCount || 0} exams</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/20 rounded-lg">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No courses in this semester</p>
          </div>
        )}
      </div>
    </Card>
  </motion.div>
);

// Book Card Component
const BookCard = ({ book, idx }: any) => (
  <motion.div
    key={book.id}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: idx * 0.05 }}
  >
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        <img src={book.imageUrl || '/placeholder-book.png'} alt={book.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <StatusBadge status={book.active ? 'published' : 'draft'} />
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-black">
            ${book.price}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold line-clamp-1">{book.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">By {book.writer}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-lg font-bold">{book.pagesCount}</p>
            <p className="text-[10px] text-muted-foreground">Pages</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{new Date(book.createdAt).toLocaleDateString()}</p>
            <p className="text-[10px] text-muted-foreground">Published</p>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

// Assignment Row Component
const AssignmentRow = ({ assignment, idx }: any) => (
  <motion.tr 
    key={assignment.id} 
    className="border-t hover:bg-muted/30 transition-colors"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: idx * 0.03 }}
  >
    <td className="p-4">
      <div>
        <p className="font-medium">{assignment.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{assignment.description}</p>
      </div>
    </td>
    <td className="p-4">{assignment.questions?.length || 0}</td>
    <td className="p-4 font-semibold">{assignment.total_marks}</td>
    <td className="p-4">{assignment.duration_minutes} min</td>
    <td className="p-4"><StatusBadge status={assignment.active ? 'published' : 'draft'} /></td>
    <td className="p-4 text-sm text-muted-foreground">
      {new Date(assignment.created_at).toLocaleDateString()}
    </td>
  </motion.tr>
);

// Exam Row Component
const ExamRow = ({ exam, idx }: any) => (
  <motion.tr 
    key={exam.id} 
    className="border-t hover:bg-muted/30 transition-colors"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: idx * 0.03 }}
  >
    <td className="p-4">
      <div>
        <p className="font-medium">{exam.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{exam.description}</p>
      </div>
    </td>
    <td className="p-4">{exam.questions?.length ?? 0}</td>
    <td className="p-4 font-semibold">{exam.total_marks}</td>
    <td className="p-4">{exam.duration_minutes} min</td>
    <td className="p-4">
      {exam.show_result ? (
        <span className="text-green-600 text-sm font-medium">Visible</span>
      ) : (
        <span className="text-red-500 text-sm font-medium">Hidden</span>
      )}
    </td>
    <td className="p-4"><StatusBadge status={exam.active ? 'published' : 'draft'} /></td>
  </motion.tr>
);

// Students Modal Component
const StudentsModal = ({ open, onOpenChange, title, subtitle, students, loading, type }: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    return students.filter((student: any) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                {title}
              </DialogTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6 pt-3 flex-1 overflow-hidden flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 overflow-y-auto pr-2">
              {filteredStudents.map((student: any) => (
                <div key={student.id} className="flex items-start gap-3 p-3 rounded-xl border bg-card">
                  <AvatarBadge initials={student.name?.charAt(0) || 'S'} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{student.name || 'Unknown'}</p>
                    {student.email && (
                      <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                    )}
                    {student.phone && (
                      <p className="text-xs text-muted-foreground truncate">{student.phone}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={student.active ? 'active' : 'inactive'} />
                      {type === 'lesson' && student.attended && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          ✓ Attended
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No students found</p>
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ===================== MAIN COMPONENT =====================

export function TeacherDashboard({ teacherId, teacherName }: TeacherDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [activeCourseTab, setActiveCourseTab] = useState<'online' | 'center' | 'semester'>('online');
  const [courseDetails, setCourseDetails] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('lessons');
  const [teacherReport, setTeacherReport] = useState<TeacherReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const { stages } = useTeacherMeta(teacherId);

  // Students Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filterStageId, setFilterStageId] = useState<number | null>(null);
  const [filterAttendance, setFilterAttendance] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterTypeOfStudy, setFilterTypeOfStudy] = useState<string>('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterCodeParent, setFilterCodeParent] = useState('');
  const [filterCenterHourId, setFilterCenterHourId] = useState<string>('');
  const [allCenterHours, setAllCenterHours] = useState<any[]>([]);
  const [loadingCenterHours, setLoadingCenterHours] = useState(false);
  
  // Students Modal State
  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
  const [studentsModalTitle, setStudentsModalTitle] = useState('');
  const [studentsModalSubtitle, setStudentsModalSubtitle] = useState('');
  const [modalStudents, setModalStudents] = useState<any[]>([]);
  const [modalStudentsLoading, setModalStudentsLoading] = useState(false);
  const [studentsModalType, setStudentsModalType] = useState<'semester' | 'course' | 'lesson'>('semester');
  
  // Course Details State
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [openDetails, setOpenDetails] = useState(false);
  
  const {
    loading,
    dashboardCourses,
    dashboardStudents,
    dashboardAssignments,
    dashboardExams,
    dashboardBooks,
    dashboardSemesters,
    getCourseDetails,
    refreshData,
    fetchSemesterWithStudents,
    fetchCourseWithStudents,
    fetchLessonWithStudents,
  } = useTeacherDashboard(teacherId);

  // جلب تقرير المعلم
  const fetchTeacherReport = useCallback(async () => {
    try {
      setReportLoading(true);
      const response = await api.get(`/teachers/${teacherId}/report`);
      setTeacherReport(response.data?.data);
    } catch (error: any) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load teacher report");
    } finally {
      setReportLoading(false);
    }
  }, [teacherId]);

  // جلب الساعات المركزية
  const fetchCenterHours = useCallback(async () => {
    setLoadingCenterHours(true);
    try {
      const response = await api.post('/center-hour/index', {});
      if (response.data?.data) {
        setAllCenterHours(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch center hours:', error);
    } finally {
      setLoadingCenterHours(false);
    }
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetchCenterHours();
      fetchTeacherReport();
    }
  }, [teacherId, fetchCenterHours, fetchTeacherReport]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    let result = [...dashboardStudents];

    if (filterStageId) {
      result = result.filter(s => s.stage_id === filterStageId);
    }
    if (filterAttendance) {
      result = result.filter(s => s.type_of_attendance === filterAttendance);
    }
    if (filterStatus !== '') {
      result = result.filter(s => s.active === (filterStatus === 'active'));
    }
    if (filterTypeOfStudy) {
      result = result.filter(s => s.type_of_study === filterTypeOfStudy);
    }
    if (filterPhone) {
      result = result.filter(s => s.phone?.includes(filterPhone));
    }
    if (filterCodeParent) {
      result = result.filter(s => s.code_parent?.includes(filterCodeParent));
    }
    if (filterCenterHourId) {
      result = result.filter(s => String(s.center_hour_id) === filterCenterHourId);
    }

    return result;
  }, [
    dashboardStudents, 
    filterStageId, 
    filterAttendance, 
    filterStatus,
    filterTypeOfStudy,
    filterPhone,
    filterCodeParent,
    filterCenterHourId
  ]);

  const clearFilters = () => {
    setFilterStageId(null);
    setFilterAttendance('');
    setFilterStatus('');
    setFilterTypeOfStudy('');
    setFilterPhone('');
    setFilterCodeParent('');
    setFilterCenterHourId('');
    setShowFilters(false);
  };

  const hasActiveFilters = !!(filterStageId || filterAttendance || filterStatus || 
    filterTypeOfStudy || filterPhone || filterCodeParent || filterCenterHourId);

  const getCenterHourDisplay = (hour: any) => {
    return `${hour.title} - ${hour.date} (${hour.hours_start} to ${hour.hours_end})`;
  };

  const handleRefresh = async () => {
    await refreshData();
    await fetchTeacherReport();
    toast.success("Data refreshed successfully");
  };

  const handleViewSemesterStudents = useCallback(async (semester: any) => {
    setStudentsModalTitle(`Students in ${semester.name}`);
    setStudentsModalSubtitle(semester.name_ar);
    setStudentsModalType('semester');
    setStudentsModalOpen(true);
    setModalStudentsLoading(true);
    const result = await fetchSemesterWithStudents(semester.id);
    setModalStudents(result?.students || []);
    setModalStudentsLoading(false);
  }, [fetchSemesterWithStudents]);

  const handleViewCourseStudents = useCallback(async (course: any) => {
    setStudentsModalTitle(`Students in ${course.title}`);
    setStudentsModalSubtitle(course.type === 'online' ? 'Online Course' : 'Center Course');
    setStudentsModalType('course');
    setStudentsModalOpen(true);
    setModalStudentsLoading(true);
    const result = await fetchCourseWithStudents(course.id);
    setModalStudents(result?.students || []);
    setModalStudentsLoading(false);
  }, [fetchCourseWithStudents]);

  const handleViewLessonStudents = useCallback(async (lesson: any, courseTitle: string) => {
    setStudentsModalTitle(`Students in ${lesson.title}`);
    setStudentsModalSubtitle(`Course: ${courseTitle}`);
    setStudentsModalType('lesson');
    setStudentsModalOpen(true);
    setModalStudentsLoading(true);
    const result = await fetchLessonWithStudents(lesson.id);
    setModalStudents(result?.students || []);
    setModalStudentsLoading(false);
  }, [fetchLessonWithStudents]);

  const handleViewCourseDetails = async (course: any) => {
    try {
      setDetailsLoading(true);
      const courseDetailsData = getCourseDetails(course.id);
      setSelectedCourse({ ...course, details: courseDetailsData });
      setOpenDetails(true);
    } catch (error) {
      toast.error("Failed to load course details");
    } finally {
      setDetailsLoading(false);
    }
  };

  // إحصائيات الديناميكية من التقرير
  const dynamicStats = useMemo(() => {
    if (!teacherReport) {
      return [
        { label: 'Online Courses', value: '0', icon: BookOpen, gradient: 'from-blue-500 to-blue-600', change: '+0%' },
        { label: 'Center Courses', value: '0', icon: Building, gradient: 'from-purple-500 to-purple-600', change: '+0%' },
        { label: 'Total Students', value: '0', icon: Users, gradient: 'from-emerald-500 to-emerald-600', change: '+0%' },
        { label: 'Total Profits', value: '$0', icon: DollarSign, gradient: 'from-amber-500 to-amber-600', change: '+0%' },
      ];
    }
    return [
      { label: 'Online Courses', value: teacherReport.online_courses.toString(), icon: BookOpen, gradient: 'from-blue-500 to-blue-600', change: '+12%' },
      { label: 'Center Courses', value: teacherReport.center_courses.toString(), icon: Building, gradient: 'from-purple-500 to-purple-600', change: '+8%' },
      { label: 'Total Students', value: teacherReport.students_count.toString(), icon: Users, gradient: 'from-emerald-500 to-emerald-600', change: '+23%' },
      { label: 'Total Profits', value: `$${teacherReport.profits}`, icon: DollarSign, gradient: 'from-amber-500 to-amber-600', change: '+15%' },
    ];
  }, [teacherReport]);

  const secondaryStatsData = useMemo(() => [
    { label: 'Exams', value: teacherReport?.exams_count || 0, icon: FileQuestion, color: 'from-red-500 to-red-600' },
    { label: 'Assignments', value: teacherReport?.assignments_count || 0, icon: FileText, color: 'from-orange-500 to-orange-600' },
    { label: 'Semesters', value: teacherReport?.semesters_count || 0, icon: Layers, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Coupons', value: teacherReport?.used_coupons || 0, icon: Ticket, color: 'from-amber-500 to-amber-600' },
    { label: 'Books', value: teacherReport?.books_count || 0, icon: BookMarked, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Requests', value: teacherReport?.requests_count || 0, icon: Mail, color: 'from-pink-500 to-pink-600' },
  ], [teacherReport]);

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'exams', label: 'Exams', icon: CheckCircle },
    { id: 'books', label: 'Resources', icon: BookMarked },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
    { id: 'theme', label: 'Appearance', icon: Sparkles },
  ];

  // إعداد بيانات الـ components
  const lessons = courseDetails;
  const courseExams = useMemo(() => {
    return dashboardExams.filter(exam => exam.courseId === selectedCourse?.id);
  }, [dashboardExams, selectedCourse]);

  const courseAssignments = useMemo(() => {
    return dashboardAssignments.filter(assignment => assignment.courseId === selectedCourse?.id);
  }, [dashboardAssignments, selectedCourse]);
  
  const books = courseDetails.flatMap(x => x?.books ?? []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ================= RENDER FUNCTIONS =================

  const renderOverview = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-2xl font-bold">Welcome back, {teacherName}! 👋</h3>
            <p className="text-muted-foreground mt-1">Here's what's happening with your teaching journey today.</p>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm">Completion rate: 78%</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map((stat, index) => (
          <StatsCard key={stat.label} stat={stat} index={index} gradient={stat.gradient} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {secondaryStatsData.map((stat, index) => (
          <SecondaryStatsCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>

      <Card className="rounded-2xl overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-muted/50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Top Performing Courses</h3>
              <p className="text-sm text-muted-foreground">Your best-selling courses this month</p>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left p-4 text-sm font-medium">Course Name</th>
                <th className="text-left p-4 text-sm font-medium">Type</th>
                <th className="text-left p-4 text-sm font-medium">Students</th>
                <th className="text-left p-4 text-sm font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {dashboardCourses.slice(0, 5).map((course, idx) => (
                <motion.tr 
                  key={course.id} 
                  className="border-t hover:bg-muted/30 transition-colors group"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${course.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {course.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{course.students}</td>
                  <td className="p-4 font-medium text-green-600">${course.price}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );

  const renderCourses = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3 p-1 bg-muted/50 rounded-xl w-fit flex-wrap">
        <button
          onClick={() => setActiveCourseTab('online')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeCourseTab === 'online' 
              ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Online Courses
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {teacherReport?.online_courses || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveCourseTab('center')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeCourseTab === 'center' 
              ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building className="h-4 w-4" />
          Center Courses
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {teacherReport?.center_courses || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveCourseTab('semester')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeCourseTab === 'semester' 
              ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          Semesters
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {dashboardSemesters?.length || 0}
          </span>
        </button>
      </div>

      {activeCourseTab === 'online' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboardCourses.filter(course => course.type === 'online').map((course, idx) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onView={handleViewCourseDetails} 
              onViewStudents={handleViewCourseStudents}
              idx={idx} 
            />
          ))}
          {dashboardCourses.filter(c => c.type === 'online').length === 0 && (
            <div className="text-center py-12 col-span-full">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No online courses found</p>
            </div>
          )}
        </div>
      )}

      {activeCourseTab === 'center' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboardCourses.filter(course => course.type === 'center').map((course, idx) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onView={handleViewCourseDetails} 
              onViewStudents={handleViewCourseStudents}
              idx={idx} 
            />
          ))}
          {dashboardCourses.filter(c => c.type === 'center').length === 0 && (
            <div className="text-center py-12 col-span-full">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No center courses found</p>
            </div>
          )}
        </div>
      )}

      {activeCourseTab === 'semester' && (
        <div className="space-y-6">
          {dashboardSemesters?.map((semester, idx) => (
            <SemesterCard 
              key={semester.id} 
              semester={semester} 
              dashboardCourses={dashboardCourses} 
              onViewCourse={handleViewCourseDetails} 
              onViewStudents={handleViewSemesterStudents}
              idx={idx} 
            />
          ))}
          {(!dashboardSemesters || dashboardSemesters.length === 0) && (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No semesters found</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );

  const renderStudents = () => (
    <div className="space-y-4">
      <StudentsFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterStageId={filterStageId}
        setFilterStageId={setFilterStageId}
        filterAttendance={filterAttendance}
        setFilterAttendance={setFilterAttendance}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterTypeOfStudy={filterTypeOfStudy}
        setFilterTypeOfStudy={setFilterTypeOfStudy}
        filterPhone={filterPhone}
        setFilterPhone={setFilterPhone}
        filterCodeParent={filterCodeParent}
        setFilterCodeParent={setFilterCodeParent}
        filterCenterHourId={filterCenterHourId}
        setFilterCenterHourId={setFilterCenterHourId}
        stages={stages}
        allCenterHours={allCenterHours}
        loadingCenterHours={loadingCenterHours}
        clearFilters={clearFilters}
        getCenterHourDisplay={getCenterHourDisplay}
        hasActiveFilters={hasActiveFilters}
      />
      <StudentsTable students={filteredStudents} />
    </div>
  );

  const renderAssignmentsTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="rounded-2xl overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-muted/50 to-transparent">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-semibold text-lg">All Assignments</h3>
              <p className="text-sm text-muted-foreground">Review and grade student submissions</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left p-4 text-sm font-medium">Assignment</th>
                <th className="text-left p-4 text-sm font-medium">Questions</th>
                <th className="text-left p-4 text-sm font-medium">Marks</th>
                <th className="text-left p-4 text-sm font-medium">Duration</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {dashboardAssignments.map((assignment, idx) => (
                <AssignmentRow key={assignment.id} assignment={assignment} idx={idx} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );

  const renderExamsTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="rounded-2xl overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-muted/50 to-transparent">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-semibold text-lg">All Exams</h3>
              <p className="text-sm text-muted-foreground">Create and manage examinations</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left p-4 text-sm font-medium">Exam</th>
                <th className="text-left p-4 text-sm font-medium">Questions</th>
                <th className="text-left p-4 text-sm font-medium">Total Marks</th>
                <th className="text-left p-4 text-sm font-medium">Duration</th>
                <th className="text-left p-4 text-sm font-medium">Result</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardExams.map((exam: any, idx) => (
                <ExamRow key={exam.id} exam={exam} idx={idx} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );

  const renderBooksTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {dashboardBooks.map((book, idx) => (
        <BookCard key={book.id} book={book} idx={idx} />
      ))}
      {dashboardBooks.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No books found</p>
        </div>
      )}
    </motion.div>
  );

  const renderReportsTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {reportLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : teacherReport ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold text-blue-600">{teacherReport.students_count}</p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">${teacherReport.profits}</p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100">
              <p className="text-sm text-muted-foreground">Active Courses</p>
              <p className="text-3xl font-bold text-purple-600">{teacherReport.online_courses + teacherReport.center_courses}</p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100">
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-3xl font-bold text-amber-600">68%</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Course Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Online Courses</span>
                    <span className="font-medium">{teacherReport.online_courses}</span>
                  </div>
                  <Progress value={(teacherReport.online_courses / (teacherReport.online_courses + teacherReport.center_courses)) * 100} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Center Courses</span>
                    <span className="font-medium">{teacherReport.center_courses}</span>
                  </div>
                  <Progress value={(teacherReport.center_courses / (teacherReport.online_courses + teacherReport.center_courses)) * 100} className="h-3" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Activity Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <FileQuestion className="h-6 w-6 mx-auto text-red-500 mb-2" />
                  <p className="text-2xl font-bold">{teacherReport.exams_count}</p>
                  <p className="text-xs text-muted-foreground">Total Exams</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <FileText className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                  <p className="text-2xl font-bold">{teacherReport.assignments_count}</p>
                  <p className="text-xs text-muted-foreground">Assignments</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <BookMarked className="h-6 w-6 mx-auto text-cyan-500 mb-2" />
                  <p className="text-2xl font-bold">{teacherReport.books_count}</p>
                  <p className="text-xs text-muted-foreground">Books</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <Ticket className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                  <p className="text-2xl font-bold">{teacherReport.used_coupons}</p>
                  <p className="text-xs text-muted-foreground">Coupons Used</p>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No report data available</p>
        </div>
      )}
    </motion.div>
  );

  const renderThemeTab = () => (
    <ThemeCustomizer 
      teacherId={teacherId}
      teacherName={teacherName}
    />
  );

  const renderCourseDetailsDialog = () => (
    <Dialog open={openDetails} onOpenChange={setOpenDetails}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        <AnimatePresence>
          {detailsLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedCourse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-0"
            >
              <div className="relative h-80 w-full">
                <img src={selectedCourse.image || '/placeholder-course.png'} alt={selectedCourse.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setOpenDetails(false)}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white z-10 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h2 className="text-4xl font-bold">{selectedCourse.title}</h2>
                  <p className="text-white/80 mt-2 max-w-2xl">{selectedCourse.description}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm">
                      {selectedCourse.type === 'online' ? '📺 Online Course' : '🏛️ Center Course'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm">
                      👥 {selectedCourse.students} Students
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab} className="space-y-6">
                  <TabsList className="bg-muted/50 rounded-xl p-1 h-auto inline-flex flex-wrap gap-1">
                    <TabsTrigger value="lessons" className="rounded-lg px-4 py-2 gap-2">
                      <BookOpen className="h-4 w-4" /> Lessons
                      <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{lessons.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="exams" className="rounded-lg px-4 py-2 gap-2">
                      <FileQuestion className="h-4 w-4" /> Exams
                      <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{courseExams.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="rounded-lg px-4 py-2 gap-2">
                      <FileText className="h-4 w-4" /> Assignments
                      <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{courseAssignments.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="books" className="rounded-lg px-4 py-2 gap-2">
                      <BookMarked className="h-4 w-4" /> Resources
                      <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{books.length}</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="lessons" className="mt-6">
                    <CourseLessons 
                      lessons={lessons} 
                      onViewStudents={handleViewLessonStudents}
                      courseTitle={selectedCourse?.title}
                    />
                  </TabsContent>
                  <TabsContent value="exams" className="mt-6">
                    <CourseExams exams={courseExams} />
                  </TabsContent>
                  <TabsContent value="assignments" className="mt-6">
                    <CourseAssignments assignments={courseAssignments} />
                  </TabsContent>
                  <TabsContent value="books" className="mt-6">
                    <CourseBooks books={books} />
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );

  // ================= MAIN RETURN =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {teacherName}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-2xl">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`group relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeSubTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <tab.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${activeSubTab === tab.id ? 'text-primary' : ''}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeSubTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-slate-800 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeSubTab === 'overview' && renderOverview()}
          {activeSubTab === 'courses' && renderCourses()}
          {activeSubTab === 'students' && renderStudents()}
          {activeSubTab === 'assignments' && renderAssignmentsTab()}
          {activeSubTab === 'exams' && renderExamsTab()}
          {activeSubTab === 'books' && renderBooksTab()}
          {activeSubTab === 'reports' && renderReportsTab()}
          {activeSubTab === 'theme' && renderThemeTab()}
        </AnimatePresence>

        {/* Course Details Dialog */}
        {renderCourseDetailsDialog()}

        {/* Students Modal */}
        <StudentsModal
          open={studentsModalOpen}
          onOpenChange={setStudentsModalOpen}
          title={studentsModalTitle}
          subtitle={studentsModalSubtitle}
          students={modalStudents}
          loading={modalStudentsLoading}
          type={studentsModalType}
        />
      </div>
    </div>
  );
}