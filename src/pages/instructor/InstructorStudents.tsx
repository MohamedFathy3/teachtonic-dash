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
  ChevronLeft, ChevronRight, Award, Sparkles, Eye, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import api from '@/lib/api';

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

  // ✅ State
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStageId, setFilterStageId] = useState<number | null>(null);
  const [filterAttendance, setFilterAttendance] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterId, setFilterId] = useState<string>('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterCodeParent, setFilterCodeParent] = useState('');
  const [filterCenterHourId, setFilterCenterHourId] = useState<string>('');
  
  // ✅ State for Center Hours list
  const [centerHours, setCenterHours] = useState<CenterHour[]>([]);
  const [loadingCenterHours, setLoadingCenterHours] = useState(false);

  // ✅ Selected student for learning page
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [showLearningPage, setShowLearningPage] = useState(false);

  // ✅ Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // ✅ Fetch Center Hours for filter
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchCenterHours = useCallback(async () => {
    setLoadingCenterHours(true);
    try {
      const response = await api.post('/center-hour/index', {
        
      });
      if (response.data?.data) {
        setCenterHours(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch center hours:', error);
    } finally {
      setLoadingCenterHours(false);
    }
  }, [user?.id]);

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

    // 🔥 فلتر center_hour_id
    if (filterCenterHourId) {
      result = result.filter(s => String(s.center_hour_id) === filterCenterHourId);
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
      if (filterId.trim()) {
        const idNum = Number(filterId);
        if (!Number.isNaN(idNum)) filters.id = idNum;
      }
      if (filterPhone) filters.phone = filterPhone;
      if (filterCodeParent) filters.code_parent = filterCodeParent;
      if (filterCenterHourId) filters.center_hour_id = Number(filterCenterHourId);

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
    user?.id
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
    setShowFilters(false);
  };

  const applyFilters = () => {
    fetchStudents(1);
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
          <ExportExcelButton
            data={students}
            fileName="students-list"
            label={lang === 'ar' ? 'تصدير' : 'Export'}
            disabled={loading || students.length === 0}
          />
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
            {(filterStageId || filterAttendance || filterStatus || filterCenterHourId) && (
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
          </div>
        </motion.div>

        {/* ✅ Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden"
            >
              <Card className="p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-xl rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  
                  {/* 🔥 Center Hour Filter - NEW */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {lang === 'ar' ? 'الساعة المركزية' : 'Center Hour'}
                    </Label>
                    <select
                      value={filterCenterHourId}
                      onChange={(e) => setFilterCenterHourId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border bg-background"
                      disabled={loadingCenterHours}
                    >
                      <option value="">
                        {lang === 'ar' ? 'جميع الساعات المركزية' : 'All Center Hours'}
                      </option>
                      {centerHours.map((hour) => (
                        <option key={hour.id} value={String(hour.id)}>
                          {getCenterHourDisplay(hour)}
                        </option>
                      ))}
                    </select>
                    {loadingCenterHours && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {lang === 'ar' ? 'جاري تحميل الساعات...' : 'Loading hours...'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{lang === 'ar' ? 'الهاتف' : 'Phone'}</Label>
                    <Input
                      value={filterPhone}
                      onChange={(e) => setFilterPhone(e.target.value)}
                      placeholder={lang === 'ar' ? 'اكتب رقم الهاتف' : 'Enter phone'}
                      className="w-full px-3 py-2 rounded-xl border bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{lang === 'ar' ? 'كود ولي الأمر' : 'Parent Code'}</Label>
                    <Input
                      value={filterCodeParent}
                      onChange={(e) => setFilterCodeParent(e.target.value)}
                      placeholder={lang === 'ar' ? 'اكتب كود ولي الأمر' : 'Enter parent code'}
                      className="w-full px-3 py-2 rounded-xl border bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('stage') || 'المرحلة'}</Label>
                    <select
                      value={filterStageId || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFilterStageId(value ? Number(value) : null);
                      }}
                      className="w-full px-3 py-2 rounded-xl border bg-background"
                    >
                      <option value="">
                        {lang === 'ar' ? 'جميع المراحل' : 'All Stages'}
                      </option>
                      {stages.map((stage: any) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('attendanceType') || 'نوع الحضور'}</Label>
                    <select
                      value={filterAttendance}
                      onChange={(e) => setFilterAttendance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border bg-background"
                    >
                      <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                      <option value="online">🖥️ {lang === 'ar' ? 'أونلاين' : 'Online'}</option>
                      <option value="center">🏢 {lang === 'ar' ? 'سنتر' : 'Center'}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('status') || 'الحالة'}</Label>
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
                    <Label className="text-sm font-medium">{t('studentId') || 'رقم الطالب'}</Label>
                    <Input
                      type="number"
                      value={filterId}
                      onChange={(e) => setFilterId(e.target.value)}
                      placeholder={lang === 'ar' ? 'رقم الطالب' : 'Student ID'}
                      className="w-full px-3 py-2 rounded-xl border bg-background"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-5 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    {t('reset') || 'إعادة تعيين'}
                  </Button>
                  <Button size="sm" onClick={applyFilters} className="gap-2">
                    <Search className="h-4 w-4" />
                    {t('applyFilters') || 'تطبيق'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Students Grid - باقي الكود كما هو */}
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
                  <Card className="relative overflow-hidden rounded-2xl border hover:shadow-xl transition-all duration-300">
                    {/* Card Header with Gradient */}
                    <div className={`relative h-24 bg-gradient-to-r from-blue-500 to-cyan-500 ${!student.active ? 'opacity-50' : ''}`}>
                      <div className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800">
                          <span className="text-xl font-bold text-primary">
                            {student.name?.charAt(0)?.toUpperCase() || 'S'}
                          </span>
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
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{student.stage?.name || `Stage ${student.stage_id}`}</p>
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
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t flex justify-end gap-2">
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
    </motion.div>
  );
};

export default InstructorStudents;