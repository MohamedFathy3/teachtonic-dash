/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/InstructorStudents.tsx

import { useMemo, useCallback, useEffect, useState } from 'react';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import { useTeacherMeta } from '@/hooks/useTeacherMeta';
import { useApp } from '@/contexts/AppContext';
import { studentService, Student } from '@/services/student.service';
import { StudentLearningPage } from './StudentLearningPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AdvancedFilters } from '@/components/common/AdvancedFilters';
import {
  Loader2, Search, Users, User, Phone, Calendar,
  Monitor, Building2, CheckCircle, XCircle, ChevronLeft, ChevronRight, 
  Award, Sparkles, Eye, Clock, Key, Lock, Save, AlertCircle,
  GraduationCap, EyeOff, School,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

interface CenterHour {
  id: number;
  title: string;
  date: string;
  hours_start: string;
  hours_end: string;
  address: string;
  phone: string;
  note: string;
  teacher_id: number;
  createdAt: string;
}

// نوع unified للفلاتر
interface FilterState {
  stageId: number | null;
  attendance: string;
  status: string;
  studentId: string;
  phone: string;
  parentCode: string;
  centerHourId: string;
  studentType: string;
  search: string;
}

export const InstructorStudents: React.FC = () => {
  const { t, lang, user } = useApp();
  const { stages } = useTeacherMeta(user?.id);
  const isRTL = lang === 'ar';
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
<<<<<<< HEAD
  
  // ✅ State موحد للفلاتر
  const [filters, setFilters] = useState<FilterState>({
    stageId: null,
    attendance: '',
    status: '',
    studentId: '',
    phone: '',
    parentCode: '',
    centerHourId: '',
    studentType: '',
    search: '',
  });
  
=======
  // ✅ State
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]); // للفلترة المحلية
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
<<<<<<< HEAD
  
=======
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ✅ فلتر المرحلة - المستوى الأول
  const [filterStageId, setFilterStageId] = useState<number | null>(null);
  // ✅ خيارات الساعات المركزية حسب المرحلة
  const [filteredCenterHours, setFilteredCenterHours] = useState<CenterHour[]>([]);
  const [filterAttendance, setFilterAttendance] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterId, setFilterId] = useState<string>('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterCodeParent, setFilterCodeParent] = useState('');
  const [filterCenterHourId, setFilterCenterHourId] = useState<string>('');

  // ✅ State for Center Hours list (all)
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
  const [allCenterHours, setAllCenterHours] = useState<CenterHour[]>([]);
  const [filteredCenterHours, setFilteredCenterHours] = useState<CenterHour[]>([]);
  const [loadingCenterHours, setLoadingCenterHours] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showLearningPage, setShowLearningPage] = useState(false);

  const [changePasswordStudent, setChangePasswordStudent] = useState<Student | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [toggleActiveStudent, setToggleActiveStudent] = useState<Student | null>(null);
  const [togglingActive, setTogglingActive] = useState(false);
<<<<<<< HEAD

=======
  const [filterTypeOfStudy, setFilterTypeOfStudy] = useState<string>('');
  // ✅ Pagination
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // Center Hours filtering
  useEffect(() => {
    if (filters.stageId) {
      const filtered = allCenterHours.filter(() => true);
      setFilteredCenterHours(filtered);
    } else {
      setFilteredCenterHours(allCenterHours);
    }
    setFilters(prev => ({ ...prev, centerHourId: '' }));
  }, [filters.stageId, allCenterHours]);

  const fetchCenterHours = useCallback(async () => {
    setLoadingCenterHours(true);
    try {
      const response = await api.post('/center-hour/index', {});
      if (response.data?.data) {
        setAllCenterHours(response.data.data);
        setFilteredCenterHours(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch center hours:', error);
    } finally {
      setLoadingCenterHours(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) fetchCenterHours();
  }, [user?.id, fetchCenterHours]);

  // ✅ الفلترة المحلية (لما البيانات كلها موجودة)
  const filteredStudents = useMemo(() => {
    let result = [...allStudents];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        String(s.id).includes(q)
      );
    }

    if (filters.stageId) {
      result = result.filter(s => s.stage_id === filters.stageId);
    }

    if (filters.attendance) {
      result = result.filter(s => s.type_of_attendance === filters.attendance);
    }

    if (filters.status !== '') {
      result = result.filter(s => s.active === (filters.status === 'active'));
    }

    if (filters.studentId.trim()) {
      const idNum = Number(filters.studentId);
      if (!Number.isNaN(idNum)) {
        result = result.filter(s => s.id === idNum);
      }
    }

    if (filters.phone) {
      result = result.filter(s => s.phone?.includes(filters.phone));
    }

    if (filters.parentCode) {
      result = result.filter(s => s.code_parent?.includes(filters.parentCode));
    }

    if (filters.centerHourId) {
      result = result.filter(s => String(s.center_hour_id) === filters.centerHourId);
    }

    if (filters.studentType) {
      result = result.filter(s => s.type_of_study === filters.studentType);
    }
    if (filterTypeOfStudy) {
      result = result.filter(s => s.type_of_study === filterTypeOfStudy);
    }

    return result;
  }, [allStudents, filters]);

  // ✅ دالة تجمع كل الفلاتر وتبعتها في Request واحد
  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
<<<<<<< HEAD
      const apiFilters: any = {};
      
      if (filters.stageId) apiFilters.stage_id = filters.stageId;
      if (filters.attendance) apiFilters.type_of_attendance = filters.attendance;
      if (filters.status !== '') apiFilters.active = filters.status === 'active';
      if (filters.studentId.trim()) {
        const idNum = Number(filters.studentId);
        if (!Number.isNaN(idNum)) apiFilters.id = idNum;
=======
      const filters: any = {};
      if (filterStageId) filters.stage_id = filterStageId;
      if (filterAttendance) filters.type_of_attendance = filterAttendance;
      if (filterStatus !== '') filters.active = filterStatus === 'active';
      if (filterTypeOfStudy) filters.type_of_study = filterTypeOfStudy;
      if (filterId.trim()) {
        const idNum = Number(filterId);
        if (!Number.isNaN(idNum)) filters.id = idNum;
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
      }
      if (filters.phone) apiFilters.phone = filters.phone;
      if (filters.parentCode) apiFilters.code_parent = filters.parentCode;
      if (filters.centerHourId) apiFilters.center_hour_id = Number(filters.centerHourId);
      if (filters.studentType) apiFilters.type_of_study = filters.studentType;
      if (filters.search) apiFilters.search = filters.search;

      const response = await studentService.getTeacherStudents(
        user?.id || undefined,
        apiFilters,
        pagination.perPage,
        page
      );
      
      setAllStudents(response.data);
      setStudents(response.data);
      setPagination({
        currentPage: response.meta.current_page,
        lastPage: response.meta.last_page,
        total: response.meta.total,
        perPage: response.meta.per_page,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  }, [filters, pagination.perPage, user?.id]);
=======
  }, [
    debouncedSearch,
    filterStageId,
    filterAttendance,
    filterStatus,
    filterId,
    filterPhone,
    filterCodeParent,
    filterCenterHourId,
    pagination.perPage,
    user?.id,
    filterTypeOfStudy,
  ]);
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6

  // الـ debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // جلب البيانات الأولية
  useEffect(() => {
    if (user?.id) fetchStudents(1);
  }, [user?.id]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchStudents(page);
    }
  };

<<<<<<< HEAD
  const clearAllFilters = () => {
    setFilters({
      stageId: null,
      attendance: '',
      status: '',
      studentId: '',
      phone: '',
      parentCode: '',
      centerHourId: '',
      studentType: '',
      search: '',
    });
=======
  const clearFilters = () => {
    setFilterStageId(null);
    setFilterAttendance('');
    setFilterStatus('');
    setFilterId('');
    setFilterPhone('');
    setFilterCodeParent('');
    setFilterCenterHourId('');
    setSearchQuery('');
    setDebouncedSearch('');
    setFilterTypeOfStudy('');
    setShowFilters(false);
  };

  const applyFilters = () => {
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
    fetchStudents(1);
  };

  const getCenterHourDisplay = (hour: CenterHour) => {
    return `${hour.title} - ${hour.date} (${hour.hours_start} to ${hour.hours_end})`;
  };

  const handleChangePassword = async () => {
    if (!changePasswordStudent) return;

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }

    setChangingPassword(true);
    setPasswordError(null);

    try {
      const response = await api.post('/student/change-password', {
        student_id: changePasswordStudent.id,
        password: newPassword,
      });

      if (response.data?.status === true || response.status === 200) {
<<<<<<< HEAD
        toast.success(`تم تغيير كلمة مرور الطالب ${changePasswordStudent.name} بنجاح`);
=======
        toast.success(lang === 'ar'
          ? `تم تغيير كلمة مرور الطالب ${changePasswordStudent.name} بنجاح`
          : `Password changed successfully for ${changePasswordStudent.name}`
        );
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
        setChangePasswordStudent(null);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(response.data?.message || 'Failed to change password');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تغيير كلمة المرور');
      setPasswordError(error?.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggleActive = async () => {
    if (!toggleActiveStudent) return;

    setTogglingActive(true);

    try {
      const newStatus = !toggleActiveStudent.active;
      const response = await api.put(`/student/${toggleActiveStudent.id}/active`, {
        active: newStatus
      });

      if (response.data?.status === true || response.status === 200) {
<<<<<<< HEAD
        toast.success(`${toggleActiveStudent.name} ${newStatus ? 'تم تفعيله' : 'تم إلغاء تفعيله'} بنجاح`);
=======
        toast.success(lang === 'ar'
          ? `${toggleActiveStudent.name} ${newStatus ? 'تم تفعيله' : 'تم إلغاء تفعيله'} بنجاح`
          : `${toggleActiveStudent.name} has been ${newStatus ? 'activated' : 'deactivated'} successfully`
        );
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
        fetchStudents(pagination.currentPage);
        setToggleActiveStudent(null);
      } else {
        throw new Error(response.data?.message || 'Failed to toggle status');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تغيير حالة الطالب');
    } finally {
      setTogglingActive(false);
    }
  };

  if (showLearningPage && selectedStudentId) {
    return (
      <StudentLearningPage
        studentId={selectedStudentId}
        onBack={() => {
          setShowLearningPage(false);
          setSelectedStudentId(null);
        }}
      />
    );
  }

  const stats = {
    total: pagination.total,
    active: allStudents.filter(s => s.active).length,
    online: allStudents.filter(s => s.type_of_attendance === 'online').length,
    center: allStudents.filter(s => s.type_of_attendance === 'center').length,
    general: allStudents.filter(s => s.type_of_study === 'general').length,
    azhari: allStudents.filter(s => s.type_of_study === 'azhari').length,
  };

  const getAttendanceBadge = (type: string | null) => {
    if (type === 'online') {
      return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 gap-1"><Monitor className="h-3 w-3" /> أونلاين</Badge>;
    }
    if (type === 'center') {
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 gap-1"><Building2 className="h-3 w-3" /> سنتر</Badge>;
    }
    return <Badge variant="outline" className="gap-1">غير محدد</Badge>;
  };

  const getStudentTypeBadge = (student: Student) => {
    if (student.type_of_study === 'azhari') {
      return <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 gap-1"><Building2 className="h-3 w-3" /> أزهري</Badge>;
    }
    return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 gap-1"><School className="h-3 w-3" /> عام</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filterGroups = [
    {
      title: 'معلومات الطالب',
      icon: <Users className="h-4 w-4 text-primary" />,
      columns: 3 as const,
      fields: [
        {
          key: 'studentId',
          label: 'رقم الطالب',
          type: 'number' as const,
          placeholder: 'أدخل رقم الطالب',
          icon: <User className="h-3 w-3" />
        },
        {
          key: 'phone',
          label: 'رقم الهاتف',
          type: 'phone' as const,
          placeholder: 'أدخل رقم الهاتف',
          icon: <Phone className="h-3 w-3" />
        },
        {
          key: 'parentCode',
          label: 'كود ولي الأمر',
          type: 'text' as const,
          placeholder: 'أدخل كود ولي الأمر',
          icon: <Award className="h-3 w-3" />
        }
      ]
    },
    {
      title: 'التصنيف',
      icon: <GraduationCap className="h-4 w-4 text-primary" />,
      columns: 2 as const,
      fields: [
        {
          key: 'stageId',
          label: 'المرحلة',
          type: 'select' as const,
          placeholder: 'اختر المرحلة',
          icon: <GraduationCap className="h-3 w-3" />,
          options: stages.map((stage: any) => ({
            value: stage.id,
            label: isRTL ? stage.name_ar : stage.name
          }))
        },
        {
          key: 'studentType',
          label: 'نوع الطالب',
          type: 'radio' as const,
          icon: <School className="h-3 w-3" />,
          options: [
            { value: 'general', label: 'عام', icon: <School className="h-3 w-3" /> },
            { value: 'azhari', label: 'أزهري', icon: <Building2 className="h-3 w-3" /> }
          ]
        }
      ]
    },
    {
      title: 'حالة الحساب',
      icon: <CheckCircle className="h-4 w-4 text-primary" />,
      columns: 2 as const,
      fields: [
        {
          key: 'status',
          label: 'الحالة',
          type: 'select' as const,
          placeholder: 'اختر الحالة',
          icon: <CheckCircle className="h-3 w-3" />,
          options: [
            { value: 'active', label: '✅ نشط' },
            { value: 'inactive', label: '❌ غير نشط' }
          ]
        }
      ]
    },
    {
      title: 'نوع الحضور',
      icon: <Monitor className="h-4 w-4 text-primary" />,
      columns: 2 as const,
      fields: [
        {
          key: 'attendance',
          label: 'نوع الحضور',
          type: 'select' as const,
          placeholder: 'اختر نوع الحضور',
          icon: <Monitor className="h-3 w-3" />,
          options: [
            { value: 'online', label: '🖥️ أونلاين' },
            { value: 'center', label: '🏢 سنتر' }
          ]
        },
        {
          key: 'centerHourId',
          label: 'الساعة المركزية',
          type: 'select' as const,
          placeholder: 'اختر الساعة المركزية',
          icon: <Clock className="h-3 w-3" />,
          condition: (value: any, allFilters: any) => allFilters.attendance === 'center',
          options: filteredCenterHours.map((hour) => ({
            value: String(hour.id),
            label: getCenterHourDisplay(hour)
          }))
        }
      ]
    }
  ];

  const currentFilters = {
    studentId: filters.studentId,
    phone: filters.phone,
    parentCode: filters.parentCode,
    stageId: filters.stageId || '',
    studentType: filters.studentType,
    status: filters.status,
    attendance: filters.attendance,
    centerHourId: filters.centerHourId,
  };

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(prev => ({
      ...prev,
      stageId: newFilters.stageId ? Number(newFilters.stageId) : null,
      attendance: newFilters.attendance || '',
      status: newFilters.status || '',
      studentId: newFilters.studentId || '',
      phone: newFilters.phone || '',
      parentCode: newFilters.parentCode || '',
      centerHourId: newFilters.centerHourId || '',
      studentType: newFilters.studentType || '',
    }));
  };

  const handleApplyFilters = () => {
    fetchStudents(1);
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-xl opacity-60" />
              <div className="relative h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {t('myStudents') || 'طلابي'}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Sparkles className="h-3 w-3" />
                {stats.total} {t('totalStudents') || 'طالب'} • {stats.active} {t('active') || 'نشط'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <ExportExcelButton
              data={students}
              fileName="students-list"
              label={lang === 'ar' ? 'تصدير' : 'Export'}
              disabled={loading || students.length === 0}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: 'إجمالي الطلاب', value: stats.total, icon: Users, color: 'from-blue-500 to-cyan-500' },
            { label: 'نشط', value: stats.active, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
            { label: 'أونلاين', value: stats.online, icon: Monitor, color: 'from-purple-500 to-pink-500' },
            { label: 'سنتر', value: stats.center, icon: Building2, color: 'from-orange-500 to-red-500' },
            { label: 'عام', value: stats.general, icon: School, color: 'from-blue-500 to-indigo-500' },
            { label: 'أزهري', value: stats.azhari, icon: Building2, color: 'from-emerald-500 to-teal-500' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative overflow-hidden rounded-xl p-4 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${stat.color.split(' ')[1]}20, ${stat.color.split(' ')[3]}10)` }}
            >
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur">
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={lang === 'ar' ? 'بحث بالاسم أو رقم الهاتف' : 'Search by name or phone'}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-xl"
            />
            {filters.search && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <XCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </motion.div>

<<<<<<< HEAD
        <AdvancedFilters
          groups={filterGroups}
          filters={currentFilters}
          onFiltersChange={handleFiltersChange}
          onApply={handleApplyFilters}
          onReset={clearAllFilters}
          loading={loading}
          showResetButton={true}
          showApplyButton={true}
          autoApply={false}
        />

=======
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden"
            >
              <Card className="p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-xl rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                  {/* 🔹 Stage (المرحلة) - المستوى الأول */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      {t('stage') || 'المرحلة'}
                    </Label>
                    <select
                      value={filterStageId || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFilterStageId(value ? Number(value) : null);
                        // إعادة تعيين الساعة المركزية عند تغيير المرحلة
                        setFilterCenterHourId('');
                      }}
                      className="w-full px-3 py-2 rounded-xl border bg-background"
                    >
                      <option value="">
                        {lang === 'ar' ? 'جميع المراحل' : 'All Stages'}
                      </option>
                      {stages.map((stage: any) => (
                        <option key={stage.id} value={stage.id}>
                          {isRTL ? stage.name_ar : stage.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* 🔹 نوع الدراسة */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {lang === 'ar' ? 'نوع الدراسة' : 'Study Type'}
                    </Label>
                    <select
                      value={filterTypeOfStudy}
                      onChange={(e) => setFilterTypeOfStudy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border bg-background"
                    >
                      <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                      <option value="general">📚 {lang === 'ar' ? 'عام' : 'General'}</option>
                      <option value="azhar">🕌 {lang === 'ar' ? 'أزهر' : 'Azhar'}</option>
                    </select>
                  </div>
                  {/* 🔹 نوع الحضور - المستوى الثاني */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Monitor className="h-4 w-4" />
                      {t('attendanceType') || 'نوع الحضور'}
                    </Label>
                    <select
                      value={filterAttendance}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setFilterAttendance(newValue);
                        // إعادة تعيين الساعة المركزية عند تغيير نوع الحضور
                        if (newValue !== 'center') {
                          setFilterCenterHourId('');
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border bg-background"
                    >
                      <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                      <option value="online">🖥️ {lang === 'ar' ? 'أونلاين' : 'Online'}</option>
                      <option value="center">🏢 {lang === 'ar' ? 'سنتر' : 'Center'}</option>
                    </select>
                  </div>

                  {/* 🔹 الساعة المركزية - يظهر فقط لو اختار سنتر */}
                  {filterAttendance === 'center' && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm font-medium">
                        <Clock className="h-4 w-4 text-primary" />
                        {lang === 'ar' ? ' مواعيد السناتر' : 'Center Hour'}
                      </Label>
                      <select
                        value={filterCenterHourId}
                        onChange={(e) => setFilterCenterHourId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border bg-background"
                        disabled={loadingCenterHours}
                      >
                        <option value="">
                          {lang === 'ar' ? 'جميع  موعيد السناتر' : 'All Center Hours'}
                        </option>
                        {filteredCenterHours.map((hour) => (
                          <option key={hour.id} value={String(hour.id)}>
                            {getCenterHourDisplay(hour)}
                          </option>
                        ))}
                      </select>
                      {filteredCenterHours.length === 0 && (
                        <p className="text-xs text-amber-500 mt-1">
                          {lang === 'ar' ? '⚠️ لا توجد ساعات مركزية لهذه المرحلة' : '⚠️ No center hours for this stage'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 🔹 باقي الفلاتر */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {t('status') || 'الحالة'}
                    </Label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border bg-background"
                    >
                      <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                      <option value="active">✅ {lang === 'ar' ? 'نشط' : 'Active'}</option>
                      <option value="inactive">❌ {lang === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {lang === 'ar' ? 'الهاتف' : 'Phone'}
                    </Label>
                    <Input
                      value={filterPhone}
                      onChange={(e) => setFilterPhone(e.target.value)}
                      placeholder={lang === 'ar' ? 'اكتب رقم الهاتف' : 'Enter phone'}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {lang === 'ar' ? 'كود ولي الأمر' : 'Parent Code'}
                    </Label>
                    <Input
                      value={filterCodeParent}
                      onChange={(e) => setFilterCodeParent(e.target.value)}
                      placeholder={lang === 'ar' ? 'اكتب الكود' : 'Enter code'}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {t('studentId') || 'رقم الطالب'}
                    </Label>
                    <Input
                      type="number"
                      value={filterId}
                      onChange={(e) => setFilterId(e.target.value)}
                      placeholder={lang === 'ar' ? 'رقم الطالب' : 'Student ID'}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* 🔹 Actions */}
                <div className="flex justify-end gap-3 mt-5 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    {t('reset') || 'إعادة تعيين'}
                  </Button>
                  <Button size="sm" onClick={applyFilters} className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <Search className="h-4 w-4" />
                    {t('applyFilters') || 'تطبيق'}
                  </Button>
                </div>

                {/* عرض الفلاتر النشطة */}
                {(filterStageId || filterAttendance || filterStatus || filterCenterHourId || filterPhone || filterCodeParent || filterId) && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'الفلاتر النشطة:' : 'Active Filters:'}</span>
                    {filterStageId && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {stages.find(s => s.id === filterStageId)?.name || filterStageId}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStageId(null)} />
                      </Badge>
                    )}
                    {filterAttendance && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        {filterAttendance === 'online' ? '🖥️ أونلاين' : '🏢 سنتر'}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterAttendance('')} />
                      </Badge>
                    )}
                    {filterCenterHourId && filterAttendance === 'center' && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Clock className="h-3 w-3" />
                        {allCenterHours.find(h => h.id === Number(filterCenterHourId))?.title || filterCenterHourId}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterCenterHourId('')} />
                      </Badge>
                    )}
                    {filterStatus && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        {filterStatus === 'active' ? '✅ نشط' : '❌ غير نشط'}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStatus('')} />
                      </Badge>
                    )}
                    {filterPhone && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        📞 {filterPhone}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterPhone('')} />
                      </Badge>
                    )}
                    {filterCodeParent && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        🎫 {filterCodeParent}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterCodeParent('')} />
                      </Badge>
                    )}
                    {filterId && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        🆔 {filterId}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterId('')} />
                      </Badge>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Students Grid */}
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
        <motion.div variants={containerVariants} className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground mt-4">جاري تحميل الطلاب...</p>
            </div>
          ) : error ? (
            <Card className="p-12 text-center">
              <p className="text-red-500">{error}</p>
            </Card>
          ) : filteredStudents.length === 0 ? (
            <Card className="p-16 text-center">
              <div className="flex flex-col items-center">
                <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg">لا يوجد طلاب</p>
                <p className="text-sm text-muted-foreground mt-1">لم يتم تسجيل أي طلاب بعد</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map((student) => (
                <motion.div
                  key={student.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className={`relative overflow-hidden rounded-2xl border hover:shadow-xl transition-all duration-300 ${!student.active ? 'opacity-75' : ''}`}>
                    <div className={`relative h-24 bg-gradient-to-r ${student.active ? 'from-blue-500 to-cyan-500' : 'from-gray-500 to-gray-600'}`}>
                      <div className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden">
<<<<<<< HEAD
                          {student.imageUrl ? (
                            <img 
                              src={student.imageUrl}
=======
                          {(student.imageUrl || student.image) ? (
                            <img
                              src={student.imageUrl || student.image?.file_path || `https://lms.dentin.cloud/storage/${student.image?.file_path}`}
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
                              alt={student.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-xl font-bold text-primary">
                              {student.name?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1">
                        {getAttendanceBadge(student.type_of_attendance)}
                      </div>
                    </div>

                    <div className="p-6 pt-10">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{student.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {student.active ? (
                              <Badge className="bg-green-500 gap-1"><CheckCircle className="h-3 w-3" /> نشط</Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> غير نشط</Badge>
                            )}
                            {getStudentTypeBadge(student)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{student.stage?.name || `Stage ${student.stage_id}`}</p>
                          <p className="text-xs text-muted-foreground">ID: {student.id}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{student.phone}</span>
                        </div>
                        {student.phone_parent && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>ولي الأمر: {student.phone_parent}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(student.created_at)}</span>
                        </div>
                        {student.code_parent && (
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span>كود ولي الأمر: {student.code_parent}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 rounded-full"
                          onClick={() => {
                            setSelectedStudentId(student.id);
                            setShowLearningPage(true);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                          عرض التعلم
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 rounded-full"
                          onClick={() => {
                            setChangePasswordStudent(student);
                            setNewPassword('');
                            setConfirmPassword('');
                            setPasswordError(null);
                          }}
                        >
                          <Key className="h-3 w-3" />
                          تغيير كلمة المرور
                        </Button>

                        <Button
                          size="sm"
                          variant={student.active ? "destructive" : "default"}
                          className={`gap-1 rounded-full ${student.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}`}
                          onClick={() => setToggleActiveStudent(student)}
                        >
                          {student.active ? (
                            <>
                              <XCircle className="h-3 w-3" />
                              إلغاء التفعيل
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              تفعيل
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <motion.div
                      className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        boxShadow: '0 0 0 2px rgba(59,130,246,0.3), 0 0 0 6px rgba(59,130,246,0.1)'
                      }}
                    />
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {pagination.lastPage > 1 && (
          <div className="flex items-center justify-center gap-3 py-6">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={() => goToPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                let pageNum = pagination.currentPage;
                if (pagination.lastPage <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.lastPage - 2) {
                  pageNum = pagination.lastPage - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.currentPage === pageNum ? 'default' : 'outline'}
                    size="icon"
                    className="rounded-full w-10 h-10"
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={() => goToPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.lastPage}
            >
              <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        )}
      </div>

<<<<<<< HEAD
=======
      {/* ✅ Change Password Modal */}
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
      <Dialog open={!!changePasswordStudent} onOpenChange={(open) => !open && setChangePasswordStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-500" />
<<<<<<< HEAD
              تغيير كلمة المرور
            </DialogTitle>
            <DialogDescription>
              تغيير كلمة المرور للطالب: {changePasswordStudent?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                كلمة المرور الجديدة
=======
              {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar'
                ? `تغيير كلمة المرور للطالب: ${changePasswordStudent?.name}`
                : `Change password for student: ${changePasswordStudent?.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* كلمة المرور الجديدة مع عين */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
              </Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
<<<<<<< HEAD
                  placeholder="أدخل كلمة المرور الجديدة"
=======
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
<<<<<<< HEAD
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">يجب أن تكون كلمة المرور 6 أحرف على الأقل</p>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                تأكيد كلمة المرور
=======
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {lang === 'ar' ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters'}
              </p>
            </div>

            {/* تأكيد كلمة المرور مع عين */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
<<<<<<< HEAD
                  placeholder="أعد إدخال كلمة المرور"
=======
                  placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
<<<<<<< HEAD
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
=======
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
            {passwordError && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {passwordError}
              </div>
            )}
          </div>
<<<<<<< HEAD
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setChangePasswordStudent(null)}>
              إلغاء
            </Button>
            <Button onClick={handleChangePassword} disabled={changingPassword} className="gap-2">
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري التغيير...
=======

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setChangePasswordStudent(null)}
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="gap-2"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {lang === 'ar' ? 'جاري التغيير...' : 'Changing...'}
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
<<<<<<< HEAD
                  تغيير
=======
                  {lang === 'ar' ? 'تغيير' : 'Change'}
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toggleActiveStudent} onOpenChange={(open) => !open && setToggleActiveStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
<<<<<<< HEAD
              {toggleActiveStudent?.active ? 'إلغاء تفعيل الطالب' : 'تفعيل الطالب'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleActiveStudent?.active
                ? `هل أنت متأكد من إلغاء تفعيل الطالب "${toggleActiveStudent?.name}"؟ لن يتمكن الطالب من تسجيل الدخول.`
                : `هل أنت متأكد من تفعيل الطالب "${toggleActiveStudent?.name}"؟`}
=======
              {toggleActiveStudent?.active
                ? (lang === 'ar' ? 'إلغاء تفعيل الطالب' : 'Deactivate Student')
                : (lang === 'ar' ? 'تفعيل الطالب' : 'Activate Student')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleActiveStudent?.active
                ? (lang === 'ar'
                  ? `هل أنت متأكد من إلغاء تفعيل الطالب "${toggleActiveStudent?.name}"؟ لن يتمكن الطالب من تسجيل الدخول.`
                  : `Are you sure you want to deactivate "${toggleActiveStudent?.name}"? The student will not be able to login.`)
                : (lang === 'ar'
                  ? `هل أنت متأكد من تفعيل الطالب "${toggleActiveStudent?.name}"؟`
                  : `Are you sure you want to activate "${toggleActiveStudent?.name}"?`)}
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleActive}
              className={toggleActiveStudent?.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}
              disabled={togglingActive}
            >
              {togglingActive ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري...
                </>
              ) : (
                toggleActiveStudent?.active ? 'إلغاء التفعيل' : 'تفعيل'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default InstructorStudents;