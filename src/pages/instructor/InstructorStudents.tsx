/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/InstructorStudents.tsx

import { useMemo } from 'react';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import { useTeacherMeta } from '@/hooks/useTeacherMeta';
import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { studentService, Student } from '@/services/student.service';
import { StudentLearningPage } from './StudentLearningPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Loader2, Search, Users, User, Phone, Calendar,
  Monitor, Building2, CheckCircle, XCircle, Filter, X,
  ChevronLeft, ChevronRight, Award, Sparkles, Eye, Clock,
  Key, Lock, Save, AlertCircle,
  GraduationCap,
  EyeOff,
  MapPin,
  RotateCcw,
  Edit,
  Trash2,
  UserPlus,
  MessageCircle, // ✅ أيقونة واتساب
  Send, // ✅ أيقونة الإرسال
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import api from '@/lib/api';
import { toast } from "@/hooks/use-toast";
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
import { RichTextEditor } from '@/components/ui/RichTextEditor'; // ✅ المستورد بتاعنا

// ✅ Animations
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
    transition: { type: 'spring', stiffness: 300, damping: 24 } as any,
  },
} as any;

// ✅ Interface for Center Hour
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

export const InstructorStudents: React.FC = () => {
  const { t, lang, user } = useApp();
  const { stages } = useTeacherMeta(user?.id);
  const isRTL = lang === 'ar';
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // ✅ State
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ✅ فلتر المرحلة - المستوى الأول
  const [filterStageId, setFilterStageId] = useState<number | null>(null);
  
  // ✅ فلتر المنطقة - جديد (Select)
  const [filterRegion, setFilterRegion] = useState<string>('');
  
  // ✅ خيارات الساعات المركزية حسب المرحلة
  const [filteredCenterHours, setFilteredCenterHours] = useState<CenterHour[]>([]);
  const [filterAttendance, setFilterAttendance] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterId, setFilterId] = useState<string>('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterCodeParent, setFilterCodeParent] = useState('');
  const [filterCenterHourId, setFilterCenterHourId] = useState<string>('');

  // ✅ State for Center Hours list (all)
  const [allCenterHours, setAllCenterHours] = useState<CenterHour[]>([]);
  const [loadingCenterHours, setLoadingCenterHours] = useState(false);

  // ✅ Selected student for learning page
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showLearningPage, setShowLearningPage] = useState(false);

  // ✅ State for Change Password Modal
  const [changePasswordStudent, setChangePasswordStudent] = useState<Student | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ✅ State for Toggle Active Alert
  const [toggleActiveStudent, setToggleActiveStudent] = useState<Student | null>(null);
  const [togglingActive, setTogglingActive] = useState(false);
  const [filterTypeOfStudy, setFilterTypeOfStudy] = useState<string>('');

  // ✅ State for Reset Device
  const [resetDeviceStudent, setResetDeviceStudent] = useState<Student | null>(null);
  const [resettingDevice, setResettingDevice] = useState(false);

  // ✅ State for Edit Student
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // ✅ State for Delete Student
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState(false);
  
  // ✅ State for WhatsApp Modal
  const [whatsappStudent, setWhatsappStudent] = useState<Student | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

  // ✅ Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // ✅ استخراج المناطق الفريدة من الطلاب (لـ Select)
  const uniqueRegions = useMemo(() => {
    const regions = students
      .map(s => s.region)
      .filter((r): r is string => r !== null && r !== undefined && r.trim() !== '');
    return [...new Set(regions)].sort();
  }, [students]);

  // ✅ فلترة الساعات المركزية حسب المرحلة
  useEffect(() => {
    if (filterStageId) {
      const filtered = allCenterHours.filter(hour => {
        return true;
      });
      setFilteredCenterHours(filtered);
    } else {
      setFilteredCenterHours(allCenterHours);
    }
    setFilterCenterHourId('');
  }, [filterStageId, allCenterHours]);

  // ✅ Fetch Center Hours for filter
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

  // ✅ Load center hours when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchCenterHours();
    }
  }, [user?.id, fetchCenterHours]);

  // ✅ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredStudents = useMemo(() => {
    let result = [...students];

    const q = debouncedSearch.trim().toLowerCase();

    if (q) {
      result = result.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        String(s.id).includes(q)
      );
    }

    if (filterStageId) {
      result = result.filter(s => s.stage_id === filterStageId);
    }

    if (filterAttendance) {
      result = result.filter(s => s.type_of_attendance === filterAttendance);
    }

    if (filterStatus !== '') {
      result = result.filter(s => s.active === (filterStatus === 'active'));
    }

    if (filterId.trim()) {
      const idNum = Number(filterId);
      if (!Number.isNaN(idNum)) {
        result = result.filter(s => s.id === idNum);
      }
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

    if (filterTypeOfStudy) {
      result = result.filter(s => s.type_of_study === filterTypeOfStudy);
    }

    if (filterRegion) {
      result = result.filter(s => s.region === filterRegion);
    }

    return result;
  }, [
    students,
    debouncedSearch,
    filterStageId,
    filterAttendance,
    filterStatus,
    filterId,
    filterPhone,
    filterCodeParent,
    filterCenterHourId,
    filterTypeOfStudy,
    filterRegion, 
  ]);

  // ✅ Fetch students
  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (filterStageId) filters.stage_id = filterStageId;
      if (filterAttendance) filters.type_of_attendance = filterAttendance;
      if (filterStatus !== '') filters.active = filterStatus === 'active';
      if (filterTypeOfStudy) filters.type_of_study = filterTypeOfStudy;
      if (filterId.trim()) {
        const idNum = Number(filterId);
        if (!Number.isNaN(idNum)) filters.id = idNum;
      }
      if (filterPhone) filters.phone = filterPhone;
      if (filterCodeParent) filters.code_parent = filterCodeParent;
      if (filterCenterHourId) filters.center_hour_id = Number(filterCenterHourId);
      if (filterRegion) filters.region = filterRegion;

      const response = await studentService.getTeacherStudents(
        user?.id || undefined,
        filters,
        pagination.perPage,
        page,
        debouncedSearch
      );
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
    filterRegion,
  ]);

  useEffect(() => {
    if (!user?.id) return;
    fetchStudents(1);
  }, [fetchStudents, user?.id]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchStudents(page);
    }
  };

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
    setFilterRegion('');
    setShowFilters(false);
  };

  const applyFilters = () => {
    fetchStudents(1);
  };

  // ✅ Change Password Function
  const handleChangePassword = async () => {
    if (!changePasswordStudent) return;

    if (!newPassword || newPassword.length < 6) {
      setPasswordError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
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
        toast.success(lang === 'ar'
          ? `تم تغيير كلمة مرور الطالب ${changePasswordStudent.name} بنجاح`
          : `Password changed successfully for ${changePasswordStudent.name}`
        );
        setChangePasswordStudent(null);
        setNewPassword('');
        setConfirmPassword('');
        fetchStudents(pagination.currentPage);
      } else {
        throw new Error(response.data?.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      toast.error(error?.response?.data?.message || (lang === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password'));
      setPasswordError(error?.response?.data?.message || (lang === 'ar' ? 'حدث خطأ أثناء تغيير كلمة المرور' : 'An error occurred'));
    } finally {
      setChangingPassword(false);
    }
  };

  // ✅ Toggle Active/Inactive Function
  const handleToggleActive = async () => {
    if (!toggleActiveStudent) return;

    setTogglingActive(true);

    try {
      const newStatus = !toggleActiveStudent.active;
      const response = await api.put(`/student/${toggleActiveStudent.id}/active`, {
        active: newStatus
      });

      if (response.data?.status === true || response.status === 200) {
        toast.success(lang === 'ar'
          ? `${toggleActiveStudent.name} ${newStatus ? 'تم تفعيله' : 'تم إلغاء تفعيله'} بنجاح`
          : `${toggleActiveStudent.name} has been ${newStatus ? 'activated' : 'deactivated'} successfully`
        );
        fetchStudents(pagination.currentPage);
        setToggleActiveStudent(null);
      } else {
        throw new Error(response.data?.message || 'Failed to toggle status');
      }
    } catch (error: any) {
      console.error('Toggle active error:', error);
      toast.error(error?.response?.data?.message || (lang === 'ar' ? 'فشل تغيير حالة الطالب' : 'Failed to change student status'));
    } finally {
      setTogglingActive(false);
    }
  };

  // ✅ Reset Device Function
  const handleResetDevice = async () => {
    if (!resetDeviceStudent) return;

    setResettingDevice(true);

    try {
      const response = await api.post(`/students/${resetDeviceStudent.id}/reset-device`, {});

      if (response.data?.status === true || response.status === 200) {
        toast.success(
          lang === 'ar'
            ? `✅ تم إعادة تعيين جهاز الطالب ${resetDeviceStudent.name} بنجاح`
            : `✅ Device reset successfully for ${resetDeviceStudent.name}`
        );
        fetchStudents(pagination.currentPage);
        setResetDeviceStudent(null);
      } else {
        throw new Error(response.data?.message || 'Failed to reset device');
      }
    } catch (error: any) {
      console.error('Reset device error:', error);
      toast.error(
        error?.response?.data?.message ||
        (lang === 'ar' ? '❌ فشل إعادة تعيين الجهاز' : '❌ Failed to reset device')
      );
    } finally {
      setResettingDevice(false);
    }
  };

  // ✅ Edit Student - Open Modal
  const handleEditStudent = (student: Student) => {
    setEditStudent(student);
    setEditFormData({
      name: student.name || '',
      phone: student.phone || '',
      phone_parent: student.phone_parent || '',
      birth_date: student.birth_date || '',
      type_of_attendance: student.type_of_attendance || 'online',
      stage_id: student.stage_id || '',
      type_of_study: student.type_of_study || 'general',
      gender: student.gender || 'male',
      region: student.region || '',
      governorate: student.governorate || '',
      school_name: student.school_name || '',
    });
    setEditPassword('');
    setShowEditPassword(false);
  };

  // ✅ Edit Student - Save
  const handleSaveEditStudent = async () => {
    if (!editStudent) return;

    // ✅ التحقق من البيانات
    if (!editFormData.name || editFormData.name.trim().length < 4) {
      toast.error(lang === 'ar' ? 'الاسم يجب أن يكون 4 كلمات على الأقل' : 'Name must be at least 4 words');
      return;
    }

    if (!editFormData.phone) {
      toast.error(lang === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required');
      return;
    }

    if (!editFormData.stage_id) {
      toast.error(lang === 'ar' ? 'المرحلة الدراسية مطلوبة' : 'Stage is required');
      return;
    }

    setEditingStudent(true);

    try {
      const payload: any = {
        student_id: editStudent.id,
        name: editFormData.name.trim(),
        phone: editFormData.phone,
        phone_parent: editFormData.phone_parent || undefined,
        birth_date: editFormData.birth_date || undefined,
        type_of_attendance: editFormData.type_of_attendance,
        stage_id: Number(editFormData.stage_id),
        type_of_study: editFormData.type_of_study || 'general',
        gender: editFormData.gender || 'male',
        region: editFormData.region || undefined,
        governorate: editFormData.governorate || undefined,
        school_name: editFormData.school_name || undefined,
      };

      // ✅ لو في كلمة مرور جديدة
      if (editPassword && editPassword.length >= 6) {
        payload.password = editPassword;
      }

      const response = await api.post(`student/change-password`, payload);

      if (response.data?.status === true || response.status === 200) {
        toast.success(lang === 'ar'
          ? `تم تحديث بيانات الطالب ${editFormData.name} بنجاح`
          : `Student ${editFormData.name} updated successfully`
        );
        setEditStudent(null);
        setEditFormData({});
        setEditPassword('');
        fetchStudents(pagination.currentPage);
      } else {
        throw new Error(response.data?.message || 'Failed to update student');
      }
    } catch (error: any) {
      console.error('Update student error:', error);
      toast.error(error?.response?.data?.message || (lang === 'ar' ? 'فشل تحديث بيانات الطالب' : 'Failed to update student'));
    } finally {
      setEditingStudent(false);
    }
  };

  // ✅ Delete Student
  const handleDeleteStudent = async () => {
    if (!deleteStudent) return;

    setDeletingStudent(true);

    try {
      const response = await api.delete(`/student/delete`, {
        data: { items: [deleteStudent.id] }
      });

      if (response.data?.status === true || response.status === 200) {
        toast.success(lang === 'ar'
          ? `تم حذف الطالب ${deleteStudent.name} بنجاح`
          : `Student ${deleteStudent.name} deleted successfully`
        );
        setDeleteStudent(null);
        fetchStudents(pagination.currentPage);
      } else {
        throw new Error(response.data?.message || 'Failed to delete student');
      }
    } catch (error: any) {
      console.error('Delete student error:', error);
      toast.error(error?.response?.data?.message || (lang === 'ar' ? 'فشل حذف الطالب' : 'Failed to delete student'));
    } finally {
      setDeletingStudent(false);
    }
  };

  // ✅ Send WhatsApp Message
  const handleSendWhatsApp = async () => {
    if (!whatsappStudent) return;

    // استخراج رقم الهاتف بدون علامات +
    const phoneNumber = whatsappStudent.phone?.replace(/[^0-9]/g, '') || '';

    if (!phoneNumber) {
      toast.error(lang === 'ar' ? 'رقم الهاتف غير صالح' : 'Invalid phone number');
      return;
    }

    if (!whatsappMessage || whatsappMessage.trim() === '') {
      toast.error(lang === 'ar' ? 'الرجاء كتابة رسالة' : 'Please write a message');
      return;
    }

    setSendingWhatsapp(true);

    try {
      const response = await api.post('/whatsapp/send', {
        phone: phoneNumber,
        message: whatsappMessage,
      });

      if (response.data?.status === true || response.status === 200) {
        toast.success(lang === 'ar'
          ? `✅ تم إرسال رسالة واتساب إلى ${whatsappStudent.name} بنجاح`
          : `✅ WhatsApp message sent to ${whatsappStudent.name} successfully`
        );
        setWhatsappStudent(null);
        setWhatsappMessage('');
      } else {
        throw new Error(response.data?.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('WhatsApp send error:', error);
      toast.error(error?.response?.data?.message || (lang === 'ar' ? '❌ فشل إرسال رسالة واتساب' : '❌ Failed to send WhatsApp message'));
    } finally {
      setSendingWhatsapp(false);
    }
  };

  // ✅ Show learning page if a student is selected
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

  // ✅ Stats
  const stats = {
    total: pagination.total,
    active: students.filter(s => s.active).length,
    online: students.filter(s => s.type_of_attendance === 'online').length,
    center: students.filter(s => s.type_of_attendance === 'center').length,
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ✅ Get center hour display text
  const getCenterHourDisplay = (hour: CenterHour) => {
    return `${hour.title} - ${hour.date} (${hour.hours_start} to ${hour.hours_end})`;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* ✅ Header */}
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

          <ExportExcelButton
            data={students}
            fileName="students-list"
            label={lang === 'ar' ? 'تصدير' : 'Export'}
            disabled={loading || students.length === 0}
          />
        </motion.div>

        {/* ✅ Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('totalStudents') || 'إجمالي الطلاب', value: stats.total, icon: Users, color: 'from-blue-500 to-cyan-500' },
            { label: t('activeStudents') || 'الطلاب النشطون', value: stats.active, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
            { label: t('onlineStudents') || 'أونلاين', value: stats.online, icon: Monitor, color: 'from-purple-500 to-pink-500' },
            { label: t('centerStudents') || 'سنتر', value: stats.center, icon: Building2, color: 'from-orange-500 to-red-500' },
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

        {/* ✅ Search & Filters */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {t('filters') || 'فلاتر'}
            </Button>
            {(filterStageId || filterAttendance || filterStatus || filterCenterHourId || filterRegion) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1 text-red-500"
              >
                <X className="h-4 w-4" />
                {t('clearFilters') || 'مسح'}
              </Button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={lang === 'ar' ? 'بحث بالاسم' : 'Search by name'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </motion.div>

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

                  {/* Stage */}
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

                  {/* Study Type */}
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

                  {/* Region */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {lang === 'ar' ? 'المنطقة' : 'Region'}
                    </Label>
                    <select
                      value={filterRegion}
                      onChange={(e) => setFilterRegion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border bg-background"
                    >
                      <option value="">
                        {lang === 'ar' ? 'جميع المناطق' : 'All Regions'}
                      </option>
                      {uniqueRegions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                    {uniqueRegions.length === 0 && (
                      <p className="text-xs text-amber-500 mt-1">
                        {lang === 'ar' ? '⚠️ لا توجد مناطق متاحة' : '⚠️ No regions available'}
                      </p>
                    )}
                  </div>

                  {/* Attendance Type */}
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

                  {/* Center Hour */}
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
                          {lang === 'ar' ? 'جميع موعيد السناتر' : 'All Center Hours'}
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

                  {/* Status */}
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

                  {/* Phone */}
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

                  {/* Parent Code */}
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

                  {/* Student ID */}
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

                {/* Actions */}
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

                {/* Active Filters */}
                {(filterStageId || filterAttendance || filterStatus || filterCenterHourId || filterPhone || filterCodeParent || filterId || filterRegion) && (
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
                    {filterRegion && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        📍 {filterRegion}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterRegion('')} />
                      </Badge>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Students Grid */}
        <motion.div variants={containerVariants} className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground mt-4">{t('loadingStudents') || 'جاري تحميل الطلاب...'}</p>
            </div>
          ) : error ? (
            <Card className="p-12 text-center">
              <p className="text-red-500">{error}</p>
            </Card>
          ) : students.length === 0 ? (
            <Card className="p-16 text-center">
              <div className="flex flex-col items-center">
                <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg">{t('noStudentsFound') || 'لا يوجد طلاب'}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('noStudentsDesc') || 'لم يتم تسجيل أي طلاب بعد'}</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map((student, idx) => (
                <motion.div
                  key={student.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className={`relative overflow-hidden rounded-2xl border hover:shadow-xl transition-all duration-300 ${!student.active ? 'opacity-75' : ''}`}>
                    {/* Card Header with Gradient */}
                    <div className={`relative h-24 bg-gradient-to-r ${student.active ? 'from-blue-500 to-cyan-500' : 'from-gray-500 to-gray-600'}`}>
                      <div className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden">
                          {(student.imageUrl || student.image) ? (
                            <img
                              src={student.imageUrl || student.image?.file_path || `https://lms.dentin.cloud/storage/${student.image?.file_path}`}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl font-bold text-primary">
                              {student.name?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        {getAttendanceBadge(student.type_of_attendance)}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 pt-10">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{student.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {student.active ? (
                              <Badge className="bg-green-500 gap-1"><CheckCircle className="h-3 w-3" /> {t('active') || 'نشط'}</Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> {t('inactive') || 'غير نشط'}</Badge>
                            )}
                            {student.device_blocked && (
                              <Badge variant="destructive" className="bg-red-500 gap-1">
                                <XCircle className="h-3 w-3" /> 
                                {lang === 'ar' ? 'جهاز محظور' : 'Device Blocked'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{student.stage?.name || `Stage ${student.stage_id}`}</p>
                          <p className="text-xs text-muted-foreground">ID: {student.id}</p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{student.phone}</span>
                        </div>
                        {student.phone_parent && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{t('parentPhone') || 'ولي الأمر'}: {student.phone_parent}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(student.created_at)}</span>
                        </div>
                        {student.code_parent && (
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span>{t('parentCode') || 'كود ولي الأمر'}: {student.code_parent}</span>
                          </div>
                        )}
                        {student.region && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{lang === 'ar' ? 'المنطقة' : 'Region'}: {student.region}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {student.device_blocked 
                              ? (lang === 'ar' ? '🔴 جهاز محظور' : '🔴 Device Blocked')
                              : student.device_id 
                                ? (lang === 'ar' ? '🟢 جهاز مسجل' : '🟢 Device Registered')
                                : (lang === 'ar' ? '🟢 جهاز مسجل' : '🟢 Device Registered')
                            }
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t flex flex-wrap justify-end gap-2">
                        {/* ✅ View Learning Button */}
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
                          {t('viewLearning') || 'عرض التعلم'}
                        </Button>

                        {/* ✅ WhatsApp Button - NEW */}
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
                          onClick={() => {
                            setWhatsappStudent(student);
                            // رسالة افتراضية مع إيموجي
                            const defaultMsg = `السلام عليكم 👋\nمعك الأستاذ/ة ${user?.name || 'المعلم'}.\nهذه رسالة من منصة التعلم.`;
                            setWhatsappMessage(defaultMsg);
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                          {lang === 'ar' ? 'واتساب' : 'WhatsApp'}
                        </Button>

                        {/* ✅ Change Password Button */}
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
                          {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                        </Button>

                        {/* ✅ Edit Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 rounded-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Edit className="h-3 w-3" />
                          {lang === 'ar' ? 'تعديل' : 'Edit'}
                        </Button>

                        {/* ✅ Delete Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 rounded-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setDeleteStudent(student)}
                        >
                          <Trash2 className="h-3 w-3" />
                          {lang === 'ar' ? 'حذف' : 'Delete'}
                        </Button>

                        {/* ✅ Toggle Active Button */}
                        <Button
                          size="sm"
                          variant={student.active ? "destructive" : "default"}
                          className={`gap-1 rounded-full ${student.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}`}
                          onClick={() => setToggleActiveStudent(student)}
                        >
                          {student.active ? (
                            <>
                              <XCircle className="h-3 w-3" />
                              {lang === 'ar' ? 'إلغاء التفعيل' : 'Deactivate'}
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              {lang === 'ar' ? 'تفعيل' : 'Activate'}
                            </>
                          )}
                        </Button>

                        {/* ✅ Reset Device Button */}
                        {student.device_blocked && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 rounded-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setResetDeviceStudent(student)}
                          >
                            <RotateCcw className="h-3 w-3" />
                            {lang === 'ar' ? 'إعادة تعيين الجهاز' : 'Reset Device'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Animated Border on Hover */}
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

        {/* ✅ Pagination */}
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

      {/* ✅ Change Password Modal */}
      <Dialog open={!!changePasswordStudent} onOpenChange={(open) => !open && setChangePasswordStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-500" />
              {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar'
                ? `تغيير كلمة المرور للطالب: ${changePasswordStudent?.name}`
                : `Change password for student: ${changePasswordStudent?.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
              </Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {lang === 'ar' ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters'}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {passwordError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setChangePasswordStudent(null)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleChangePassword} disabled={changingPassword} className="gap-2">
              {changingPassword ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{lang === 'ar' ? 'جاري التغيير...' : 'Changing...'}</>
              ) : (
                <><Save className="h-4 w-4" />{lang === 'ar' ? 'تغيير' : 'Change'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Edit Student Modal */}
      <Dialog open={!!editStudent} onOpenChange={(open) => !open && setEditStudent(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              {lang === 'ar' ? 'تعديل بيانات الطالب' : 'Edit Student'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar'
                ? `تعديل بيانات الطالب: ${editStudent?.name}`
                : `Edit student data: ${editStudent?.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  placeholder={lang === 'ar' ? 'الاسم الرباعي' : 'Full name'}
                  className="rounded-xl"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {lang === 'ar' ? 'رقم الهاتف' : 'Phone'} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                  className="rounded-xl"
                />
              </div>

              {/* Parent Phone */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {lang === 'ar' ? 'هاتف ولي الأمر' : 'Parent Phone'}
                </Label>
                <Input
                  value={editFormData.phone_parent || ''}
                  onChange={(e) => setEditFormData({...editFormData, phone_parent: e.target.value})}
                  placeholder={lang === 'ar' ? 'رقم ولي الأمر' : 'Parent phone'}
                  className="rounded-xl"
                />
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {lang === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}
                </Label>
                <Input
                  type="date"
                  value={editFormData.birth_date || ''}
                  onChange={(e) => setEditFormData({...editFormData, birth_date: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              {/* Stage */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {lang === 'ar' ? 'المرحلة الدراسية' : 'Stage'} <span className="text-red-500">*</span>
                </Label>
                <select
                  value={editFormData.stage_id || ''}
                  onChange={(e) => setEditFormData({...editFormData, stage_id: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border bg-background"
                >
                  <option value="">{lang === 'ar' ? 'اختر المرحلة' : 'Select stage'}</option>
                  {stages.map((stage: any) => (
                    <option key={stage.id} value={stage.id}>
                      {isRTL ? stage.name_ar : stage.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendance Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  {lang === 'ar' ? 'نوع الحضور' : 'Attendance Type'} <span className="text-red-500">*</span>
                </Label>
                <select
                  value={editFormData.type_of_attendance || 'online'}
                  onChange={(e) => setEditFormData({...editFormData, type_of_attendance: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border bg-background"
                >
                  <option value="online">🖥️ {lang === 'ar' ? 'أونلاين' : 'Online'}</option>
                  <option value="center">🏢 {lang === 'ar' ? 'سنتر' : 'Center'}</option>
                </select>
              </div>

              {/* Study Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {lang === 'ar' ? 'نوع الدراسة' : 'Study Type'}
                </Label>
                <select
                  value={editFormData.type_of_study || 'general'}
                  onChange={(e) => setEditFormData({...editFormData, type_of_study: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border bg-background"
                >
                  <option value="general">📚 {lang === 'ar' ? 'عام' : 'General'}</option>
                  <option value="azhar">🕌 {lang === 'ar' ? 'أزهر' : 'Azhar'}</option>
                </select>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  {lang === 'ar' ? 'النوع' : 'Gender'}
                </Label>
                <select
                  value={editFormData.gender || 'male'}
                  onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border bg-background"
                >
                  <option value="male">👨 {lang === 'ar' ? 'ذكر' : 'Male'}</option>
                  <option value="female">👩 {lang === 'ar' ? 'أنثى' : 'Female'}</option>
                </select>
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {lang === 'ar' ? 'المنطقة' : 'Region'}
                </Label>
                <Input
                  value={editFormData.region || ''}
                  onChange={(e) => setEditFormData({...editFormData, region: e.target.value})}
                  placeholder={lang === 'ar' ? 'المنطقة' : 'Region'}
                  className="rounded-xl"
                />
              </div>

              {/* Governorate */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {lang === 'ar' ? 'المحافظة' : 'Governorate'}
                </Label>
                <Input
                  value={editFormData.governorate || ''}
                  onChange={(e) => setEditFormData({...editFormData, governorate: e.target.value})}
                  placeholder={lang === 'ar' ? 'المحافظة' : 'Governorate'}
                  className="rounded-xl"
                />
              </div>

              {/* School Name */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {lang === 'ar' ? 'اسم المدرسة' : 'School Name'}
                </Label>
                <Input
                  value={editFormData.school_name || ''}
                  onChange={(e) => setEditFormData({...editFormData, school_name: e.target.value})}
                  placeholder={lang === 'ar' ? 'اسم المدرسة' : 'School name'}
                  className="rounded-xl"
                />
              </div>

              {/* New Password (optional) */}
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-amber-500" />
                  {lang === 'ar' ? 'كلمة مرور جديدة (اختياري)' : 'New Password (Optional)'}
                </Label>
                <div className="relative">
                  <Input
                    type={showEditPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder={lang === 'ar' ? 'اترك فارغاً إذا لم ترغب في التغيير' : 'Leave empty if no change'}
                    className="rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {lang === 'ar' ? 'يجب أن تكون 6 أحرف على الأقل إذا تم إدخالها' : 'Must be at least 6 characters if entered'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditStudent(null)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveEditStudent} disabled={editingStudent} className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              {editingStudent ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</>
              ) : (
                <><Save className="h-4 w-4" />{lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Toggle Active Confirmation Dialog */}
      <AlertDialog open={!!toggleActiveStudent} onOpenChange={(open) => !open && setToggleActiveStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
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
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleActive}
              className={toggleActiveStudent?.active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}
              disabled={togglingActive}
            >
              {togglingActive ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />{lang === 'ar' ? 'جاري...' : 'Loading...'}</>
              ) : (
                toggleActiveStudent?.active
                  ? (lang === 'ar' ? 'إلغاء التفعيل' : 'Deactivate')
                  : (lang === 'ar' ? 'تفعيل' : 'Activate')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ Reset Device Confirmation Dialog */}
      <AlertDialog open={!!resetDeviceStudent} onOpenChange={(open) => !open && setResetDeviceStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-red-500" />
              {lang === 'ar' ? 'إعادة تعيين الجهاز' : 'Reset Device'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === 'ar'
                ? `هل أنت متأكد من إعادة تعيين جهاز الطالب "${resetDeviceStudent?.name}"؟`
                : `Are you sure you want to reset the device for "${resetDeviceStudent?.name}"?`}
              <br />
              <br />
              <span className="text-red-500 font-bold">
                {lang === 'ar'
                  ? '⚠️ سيتم فك حظر الجهاز ومسح بياناته، وسيتمكن الطالب من تسجيل الدخول من أي جهاز جديد.'
                  : '⚠️ Device will be unblocked and data cleared. Student will be able to login from any new device.'}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetDevice}
              className="bg-red-500 hover:bg-red-600"
              disabled={resettingDevice}
            >
              {resettingDevice ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />{lang === 'ar' ? 'جاري...' : 'Resetting...'}</>
              ) : (
                lang === 'ar' ? 'تأكيد' : 'Confirm'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ Delete Student Confirmation Dialog */}
      <AlertDialog open={!!deleteStudent} onOpenChange={(open) => !open && setDeleteStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <Trash2 className="h-5 w-5" />
              {lang === 'ar' ? 'حذف الطالب' : 'Delete Student'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === 'ar'
                ? `هل أنت متأكد من حذف الطالب "${deleteStudent?.name}"؟`
                : `Are you sure you want to delete student "${deleteStudent?.name}"?`}
              <br />
              <br />
              <span className="text-red-500 font-bold">
                {lang === 'ar'
                  ? '⚠️ سيتم حذف جميع بيانات الطالب بشكل نهائي ولا يمكن استعادتها!'
                  : '⚠️ All student data will be permanently deleted and cannot be recovered!'}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              className="bg-red-500 hover:bg-red-600"
              disabled={deletingStudent}
            >
              {deletingStudent ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />{lang === 'ar' ? 'جاري الحذف...' : 'Deleting...'}</>
              ) : (
                lang === 'ar' ? 'حذف' : 'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ WhatsApp Modal - NEW */}
      <Dialog open={!!whatsappStudent} onOpenChange={(open) => !open && setWhatsappStudent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              {lang === 'ar' ? 'إرسال رسالة واتساب' : 'Send WhatsApp Message'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar'
                ? `إرسال رسالة إلى ${whatsappStudent?.name} (${whatsappStudent?.phone})`
                : `Send message to ${whatsappStudent?.name} (${whatsappStudent?.phone})`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* رقم الطالب */}
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Phone className="h-4 w-4 text-green-500" />
              <span className="font-mono text-sm">{whatsappStudent?.phone}</span>
            </div>

            {/* Rich Text Editor للرسالة */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                {lang === 'ar' ? 'نص الرسالة' : 'Message'}
                <span className="text-red-500">*</span>
              </Label>
              <RichTextEditor
                content={whatsappMessage}
                onChange={setWhatsappMessage}
                placeholder={lang === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message...'}
              />
              <p className="text-xs text-muted-foreground">
                💡 {lang === 'ar' ? 'يمكنك استخدام الإيموجي والتنسيق' : 'You can use emojis and formatting'}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setWhatsappStudent(null)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSendWhatsApp}
              disabled={sendingWhatsapp || !whatsappMessage.trim()}
              className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              {sendingWhatsapp ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</>
              ) : (
                <><Send className="h-4 w-4" />{lang === 'ar' ? 'إرسال' : 'Send'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default InstructorStudents;