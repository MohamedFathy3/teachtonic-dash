/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/SemesterDetailsPage.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  BookOpen,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  School,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  Image as ImageIcon,
  Gift,
  Percent,
  Clock,
  Star,
  TrendingUp,
  Award,
  Info,
  Download,
  Filter,
  Search,
  Grid3x3,
  List,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { semesterService } from '@/services/semester.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ExportExcel } from '@/components/common/ExportExcel';

interface SemesterDetails {
  id: number;
  name: string;
  name_ar: string;
  active: boolean;
  original_price: string;
  price: number;
  discount: number;
  offer_discount: number;
  offer_start_date: string | null;
  offer_end_date: string | null;
  teacher_id: number;
  subject_id: number;
  offer_id: number | null;
  imageUrl: string;
  image: any;
  subject: {
    id: number;
    name: string;
    name_ar: string;
    stage: {
      id: number;
      name: string;
      name_ar: string;
    };
  };
  courses: any[];
  students: Student[];
  createdAt: string;
}

interface Student {
  id: number;
  name: string;
  phone: string;
  phone_parent: string;
  code_parent: string;
  device_id: string;
  fingerprint: string;
  last_ip: string;
  user_agent: string;
  device_blocked: boolean;
  device_blocked_at: string | null;
  barcode: string;
  region: string;
  type_of_attendance: string;
  gender: string;
  active: boolean;
  balance: string;
  governorate: string;
  school_name: string;
  type_of_study: string;
  imageUrl: string;
  image: any;
  teacher_id: number;
  stage_id: number;
  stage: {
    id: number;
    name: string;
    name_ar: string;
  };
  center_hour_id: number | null;
  joined_at: string | null;
  created_at: string;
}

export const SemesterDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useApp();
  const isRTL = lang === 'ar';

  const [semester, setSemester] = useState<SemesterDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'center'>('all');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch semester details
  useEffect(() => {
    const fetchSemesterDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await semesterService.getSemester(parseInt(id));
        if (response && typeof response === 'object') {
          setSemester(response);
          setStudents(response.students || []);
        } else {
          setError('Invalid data received');
        }
      } catch (err: any) {
        console.error('❌ Error:', err);
        setError(err.message || 'Failed to fetch semester details');
        toast.error(err.message || 'Failed to fetch semester details');
      } finally {
        setLoading(false);
      }
    };
    fetchSemesterDetails();
  }, [id]);

  // ✅ Filter students
  const filteredStudents = useMemo(() => {
    let result = students;

    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(search) ||
          student.phone.includes(search) ||
          student.barcode.includes(search) ||
          (student.school_name && student.school_name.toLowerCase().includes(search))
      );
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter((s) => s.type_of_attendance === filterType);
    }

    // Gender filter
    if (filterGender !== 'all') {
      result = result.filter((s) => s.gender === filterGender);
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter((s) => s.active === (filterStatus === 'active'));
    }

    return result;
  }, [students, searchQuery, filterType, filterGender, filterStatus]);

  // ✅ Stats
  const stats = useMemo(() => ({
    totalStudents: students.length,
    activeStudents: students.filter(s => s.active).length,
    inactiveStudents: students.filter(s => !s.active).length,
    onlineStudents: students.filter(s => s.type_of_attendance === 'online').length,
    centerStudents: students.filter(s => s.type_of_attendance === 'center').length,
    maleStudents: students.filter(s => s.gender === 'male').length,
    femaleStudents: students.filter(s => s.gender === 'female').length,
  }), [students]);

  // ✅ Prepare data for export
  const exportData = useMemo(() => {
    return filteredStudents.map((student) => ({
      [isRTL ? 'الاسم' : 'Name']: student.name,
      [isRTL ? 'رقم الهاتف' : 'Phone']: student.phone,
      [isRTL ? 'رقم ولي الأمر' : 'Parent Phone']: student.phone_parent || '-',
      [isRTL ? 'الباركود' : 'Barcode']: student.barcode || '-',
      [isRTL ? 'المحافظة' : 'Governorate']: student.governorate || '-',
      [isRTL ? 'المنطقة' : 'Region']: student.region || '-',
      [isRTL ? 'المدرسة' : 'School']: student.school_name || '-',
      [isRTL ? 'نوع الحضور' : 'Attendance Type']: student.type_of_attendance === 'online' ? 'Online' : 'Center',
      [isRTL ? 'الجنس' : 'Gender']: student.gender === 'male' ? 'Male' : 'Female',
      [isRTL ? 'نوع الدراسة' : 'Study Type']: student.type_of_study === 'general' ? 'General' : 'Special',
      [isRTL ? 'الحالة' : 'Status']: student.active ? 'Active' : 'Inactive',
      [isRTL ? 'الرصيد' : 'Balance']: student.balance || '0',
      [isRTL ? 'تاريخ الانضمام' : 'Joined At']: student.joined_at || student.created_at || '-',
    }));
  }, [filteredStudents, isRTL]);

  // ✅ Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterGender('all');
    setFilterStatus('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto" />
          <p className="text-muted-foreground mt-4">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error || !semester) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {isRTL ? 'حدث خطأ' : 'Something went wrong'}
          </h2>
          <p className="text-muted-foreground mt-2">{error || 'Semester not found'}</p>
          <Button onClick={() => navigate('/instructor/semesters')} className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {isRTL ? 'العودة للترمات' : 'Back to Semesters'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* ✅ Header with Export */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/instructor/semesters')}
              className="rounded-full h-10 w-10 hover:bg-purple-500/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {isRTL ? semester.name_ar : semester.name}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <BookOpen className="h-4 w-4" />
                {isRTL ? semester.subject?.name_ar : semester.subject?.name}
                <span className="mx-1">•</span>
                <GraduationCap className="h-4 w-4" />
                {isRTL ? semester.subject?.stage?.name_ar : semester.subject?.stage?.name}
              </p>
            </div>
            <Badge
              variant={semester.active ? 'default' : 'destructive'}
              className="text-sm px-4 py-1.5"
            >
              {semester.active 
                ? (isRTL ? 'نشط' : 'Active')
                : (isRTL ? 'غير نشط' : 'Inactive')}
            </Badge>
          </div>

          <div className="flex gap-2">
            <ExportExcel
              data={exportData}
              fileName={`${semester.name}_students`}
              label={isRTL ? 'تصدير الطلاب' : 'Export Students'}
              disabled={students.length === 0}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.print()}
              className="rounded-xl"
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: isRTL ? 'إجمالي الطلاب' : 'Total', value: stats.totalStudents, icon: Users, color: 'blue' },
            { label: isRTL ? 'نشطين' : 'Active', value: stats.activeStudents, icon: CheckCircle, color: 'green' },
            { label: isRTL ? 'غير نشطين' : 'Inactive', value: stats.inactiveStudents, icon: XCircle, color: 'red' },
            { label: isRTL ? 'أونلاين' : 'Online', value: stats.onlineStudents, icon: Users, color: 'cyan' },
            { label: isRTL ? 'سنتر' : 'Center', value: stats.centerStudents, icon: School, color: 'orange' },
            { label: isRTL ? 'ذكور' : 'Male', value: stats.maleStudents, icon: User, color: 'blue' },
            { label: isRTL ? 'إناث' : 'Female', value: stats.femaleStudents, icon: User, color: 'pink' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/5 rounded-xl p-3 border border-${stat.color}-500/20`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  <p className={`text-xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                </div>
                <stat.icon className={`h-6 w-6 text-${stat.color}-500/50`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ✅ Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Semester Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image Card */}
            <Card className="p-4 rounded-2xl shadow-lg border-0 overflow-hidden">
              {semester.imageUrl ? (
                <img
                  src={semester.imageUrl}
                  alt={semester.name}
                  className="w-full h-48 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </Card>

            {/* Info Card */}
            <Card className="p-4 rounded-2xl shadow-lg border-0 space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-purple-500" />
                {isRTL ? 'معلومات الترم' : 'Semester Info'}
              </h3>
              
              <div className="space-y-2 text-sm">
                <InfoRow 
                  label={isRTL ? 'المادة' : 'Subject'}
                  value={isRTL ? semester.subject?.name_ar : semester.subject?.name}
                />
                <InfoRow 
                  label={isRTL ? 'المرحلة' : 'Stage'}
                  value={isRTL ? semester.subject?.stage?.name_ar : semester.subject?.stage?.name}
                />
                <InfoRow 
                  label={isRTL ? 'السعر الأصلي' : 'Original Price'}
                  value={`${semester.original_price} EGP`}
                />
                <InfoRow 
                  label={isRTL ? 'الخصم' : 'Discount'}
                  value={`${semester.discount}%`}
                  valueClassName="text-green-600"
                />
                <InfoRow 
                  label={isRTL ? 'السعر النهائي' : 'Final Price'}
                  value={`${semester.price} EGP`}
                  valueClassName="text-purple-600 font-bold"
                />
                {semester.offer_id && (
                  <InfoRow 
                    label={isRTL ? 'العرض' : 'Offer'}
                    value={
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600">
                        {semester.offer_discount}% OFF
                      </Badge>
                    }
                  />
                )}
                <InfoRow 
                  label={isRTL ? 'تاريخ الإنشاء' : 'Created At'}
                  value={semester.createdAt}
                />
              </div>
            </Card>
          </div>

          {/* Right Column - Students List */}
          <div className="lg:col-span-2">
            <Card className="p-4 rounded-2xl shadow-lg border-0">
              {/* Header with Search & Filters */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold text-lg">
                      {isRTL ? 'الطلاب المسجلين' : 'Enrolled Students'}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({filteredStudents.length} / {students.length})
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View Mode */}
                    <div className="flex bg-muted/50 rounded-xl p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 px-3 rounded-lg transition-all duration-300 ${
                          viewMode === 'grid'
                            ? 'bg-white dark:bg-gray-800 text-purple-500 shadow-md'
                            : 'hover:bg-white/50'
                        }`}
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 px-3 rounded-lg transition-all duration-300 ${
                          viewMode === 'table'
                            ? 'bg-white dark:bg-gray-800 text-purple-500 shadow-md'
                            : 'hover:bg-white/50'
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`rounded-xl ${showFilters ? 'bg-purple-500/10 text-purple-500' : ''}`}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={isRTL ? 'بحث بالاسم أو التليفون أو الباركود...' : 'Search by name, phone or barcode...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl"
                  />
                </div>

                {/* Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value as any)}
                          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                        >
                          <option value="all">{isRTL ? 'جميع الأنواع' : 'All Types'}</option>
                          <option value="online">{isRTL ? 'أونلاين' : 'Online'}</option>
                          <option value="center">{isRTL ? 'سنتر' : 'Center'}</option>
                        </select>

                        <select
                          value={filterGender}
                          onChange={(e) => setFilterGender(e.target.value as any)}
                          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                        >
                          <option value="all">{isRTL ? 'جميع الجنسين' : 'All Genders'}</option>
                          <option value="male">{isRTL ? 'ذكور' : 'Male'}</option>
                          <option value="female">{isRTL ? 'إناث' : 'Female'}</option>
                        </select>

                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as any)}
                          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                        >
                          <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                          <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                          <option value="inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
                        </select>

                        <Button variant="outline" onClick={clearFilters} className="gap-2">
                          <RefreshCw className="h-4 w-4" />
                          {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Students Grid */}
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isRTL ? 'لا يوجد طلاب مسجلين' : 'No students enrolled'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2">
                  <AnimatePresence mode="popLayout">
                    {filteredStudents.map((student, idx) => (
                      <StudentCard key={student.id} student={student} isRTL={isRTL} idx={idx} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-3 py-2 text-left">{isRTL ? 'الاسم' : 'Name'}</th>
                        <th className="px-3 py-2 text-left">{isRTL ? 'الهاتف' : 'Phone'}</th>
                        <th className="px-3 py-2 text-left">{isRTL ? 'النوع' : 'Type'}</th>
                        <th className="px-3 py-2 text-left">{isRTL ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="px-3 py-2 font-medium">{student.name}</td>
                          <td className="px-3 py-2">{student.phone}</td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-[10px]">
                              {student.type_of_attendance === 'online' ? 'Online' : 'Center'}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant={student.active ? 'default' : 'destructive'} className="text-[10px]">
                              {student.active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* ✅ Courses Section */}
        {semester.courses && semester.courses.length > 0 && (
          <Card className="p-4 rounded-2xl shadow-lg border-0">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-purple-500" />
              {isRTL ? 'الكورسات المرتبطة' : 'Related Courses'}
              <Badge variant="outline">{semester.courses.length}</Badge>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {semester.courses.map((course) => (
                <CourseCard key={course.id} course={course} isRTL={isRTL} />
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

// ✅ Student Card Component
const StudentCard: React.FC<{ student: Student; isRTL: boolean; idx: number }> = ({ 
  student, 
  isRTL, 
  idx 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: idx * 0.03 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white dark:bg-gray-800/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 border-2 border-purple-500/20">
          <AvatarImage src={student.imageUrl} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            {student.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold truncate">{student.name}</h4>
            <Badge
              variant={student.active ? 'default' : 'destructive'}
              className="text-xs px-2 py-0.5"
            >
              {student.active 
                ? (isRTL ? 'نشط' : 'Active')
                : (isRTL ? 'غير نشط' : 'Inactive')}
            </Badge>
          </div>
          <div className="flex flex-col gap-1 mt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{student.phone}</span>
            </div>
            {student.school_name && (
              <div className="flex items-center gap-1">
                <School className="h-3 w-3" />
                <span className="truncate">{student.school_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {student.type_of_attendance === 'online' 
                  ? (isRTL ? 'أونلاين' : 'Online')
                  : (isRTL ? 'سنتر' : 'Center')}
              </Badge>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                student.gender === 'male' ? 'text-blue-600' : 'text-pink-600'
              }`}>
                {student.gender === 'male' 
                  ? (isRTL ? 'ذكر' : 'Male')
                  : (isRTL ? 'أنثى' : 'Female')}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {student.type_of_study === 'general' 
                  ? (isRTL ? 'عام' : 'General')
                  : (isRTL ? 'خاص' : 'Special')}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ✅ Info Row Component
const InfoRow: React.FC<{ label: string; value: string | React.ReactNode; valueClassName?: string }> = ({ 
  label, 
  value, 
  valueClassName = 'font-medium' 
}) => (
  <div className="flex justify-between py-2 border-b last:border-0">
    <span className="text-muted-foreground text-sm">{label}</span>
    <span className={`text-sm ${valueClassName}`}>{value}</span>
  </div>
);

// ✅ Course Card Component
const CourseCard: React.FC<{ course: any; isRTL: boolean }> = ({ course, isRTL }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => navigate(`/admin/courses/${course.id}`)}
      className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-14 h-14 rounded-lg object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-purple-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {isRTL ? course.title_ar : course.title}
          </h4>
          <p className="text-xs text-muted-foreground">
            {course.type === 'online' 
              ? (isRTL ? 'أونلاين' : 'Online')
              : (isRTL ? 'سنتر' : 'Center')}
          </p>
          <p className="text-xs font-semibold text-green-600">
            {course.price} EGP
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SemesterDetailsPage;