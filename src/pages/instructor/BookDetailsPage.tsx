/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/books/BookDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, BookOpen, User, DollarSign, FileText, Calendar,
  Users, Phone, Mail, MapPin, GraduationCap, Star, Eye,
  Download, Share2, Heart, Edit, Trash2, Power, Loader2,
  CheckCircle, XCircle, AlertCircle, Image as ImageIcon,
  UserCheck, UserX, Globe, Clock, Award, TrendingUp, Filter, X,
  Monitor, Building2, FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { toast  } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import api from '@/lib/api';
import * as XLSX from 'xlsx';

interface BookDetail {
  id: number;
  title: string;
  writer: string;
  active: number;
  teacher_id: number;
  price: string;
  discount: string;
  pages_count: number;
  imageUrl: string;
  image: { id: number; fullUrl: string; } | null;
  createdAt: string;
  stage_id: number | null;
  stage?: { id: number; name: string; name_ar: string; };
  students: Array<{
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
    stage?: { id: number; name: string; name_ar: string; };
    type_of_study?: string;
  }>;
}

// أنيميشن
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang, isRTL } = useApp();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // State للفلاتر
  const [showFilters, setShowFilters] = useState(false);
  const [filterStageId, setFilterStageId] = useState<number | null>(null);
  const [filterAttendance, setFilterAttendance] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterTypeOfStudy, setFilterTypeOfStudy] = useState<string>('');
  const [filterPhone, setFilterPhone] = useState<string>('');
  const [filterCodeParent, setFilterCodeParent] = useState<string>('');
  const [filterCenterHourId, setFilterCenterHourId] = useState<string>('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterGovernorate, setFilterGovernorate] = useState<string>('');
  const [filterSchoolName, setFilterSchoolName] = useState<string>('');

  // جلب تفاصيل الكتاب
  const fetchBook = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(`/book/${id}`);
      console.log('📚 Book details:', response.data);
      setBook(response.data.data);
    } catch (error) {
      console.error('Error fetching book:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل الكتاب' : 'Error loading book');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  // دوال مساعدة
  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPriceAfterDiscount = () => {
    if (!book) return 0;
    const price = parseFloat(book.price);
    const discount = parseFloat(book.discount || '0');
    return price - discount;
  };

  // دالة تصفية الطلاب
  const getFilteredStudents = () => {
    if (!book?.students) return [];
    
    return book.students.filter(student => {
      // فلتر المرحلة
      
      // فلتر نوع الحضور
      if (filterAttendance && student.type_of_attendance !== filterAttendance) return false;
      
      // فلتر الحالة
      if (filterStatus && (filterStatus === 'active' ? !student.active : student.active)) return false;
      
      // فلتر نوع الدراسة
      if (filterTypeOfStudy && student.type_of_study !== filterTypeOfStudy) return false;
      
      // فلتر التليفون
      if (filterPhone && !student.phone.includes(filterPhone)) return false;
      
      // فلتر كود ولي الأمر
      if (filterCodeParent && student.code_parent !== filterCodeParent) return false;
      
      // فلتر النوع (ذكر/أنثى)
      if (filterGender && student.gender !== filterGender) return false;
      
      // فلتر المحافظة
      if (filterGovernorate && student.governorate !== filterGovernorate) return false;
      
      // فلتر اسم المدرسة
      if (filterSchoolName && student.school_name !== filterSchoolName) return false;
      
      return true;
    });
  };

  // دالة تصدير إلى Excel
  const exportToExcel = () => {
    const filteredStudents = getFilteredStudents();
    
    if (filteredStudents.length === 0) {
      toast.error(lang === 'ar' ? 'لا يوجد بيانات لتصديرها' : 'No data to export');
      return;
    }

    const exportData = filteredStudents.map(student => ({
      'ID': student.id,
      [lang === 'ar' ? 'الاسم' : 'Name']: student.name,
      [lang === 'ar' ? 'رقم الهاتف' : 'Phone']: student.phone,
      [lang === 'ar' ? 'هاتف ولي الأمر' : 'Parent Phone']: student.phone_parent || '—',
      [lang === 'ar' ? 'كود ولي الأمر' : 'Parent Code']: student.code_parent || '—',
      [lang === 'ar' ? 'نوع الحضور' : 'Attendance Type']: student.type_of_attendance === 'online' ? (lang === 'ar' ? 'أونلاين' : 'Online') : (lang === 'ar' ? 'سنتر' : 'Center'),
      [lang === 'ar' ? 'الحالة' : 'Status']: student.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive'),
      [lang === 'ar' ? 'الرصيد' : 'Balance']: student.balance || '0',
      [lang === 'ar' ? 'المحافظة' : 'Governorate']: student.governorate || '—',
      [lang === 'ar' ? 'اسم المدرسة' : 'School Name']: student.school_name || '—',
      [lang === 'ar' ? 'نوع الدراسة' : 'Study Type']: student.type_of_study === 'general' ? (lang === 'ar' ? 'عام' : 'General') : (lang === 'ar' ? 'أزهر' : 'Azhar'),
      [lang === 'ar' ? 'النوع' : 'Gender']: student.gender === 'male' ? (lang === 'ar' ? 'ذكر' : 'Male') : (lang === 'ar' ? 'أنثى' : 'Female'),
      [lang === 'ar' ? 'المرحلة' : 'Stage']: student.stage?.name || '—',
      [lang === 'ar' ? 'تاريخ التسجيل' : 'Registered Date']: formatDate(student.created_at),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, book?.title || 'Students');
    
    // تعديل عرض الأعمدة
    const colWidths = Object.keys(exportData[0]).map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `${book?.title}_students_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success(lang === 'ar' ? 'تم التصدير بنجاح' : 'Exported successfully');
  };

  // دوال مساعدة للفلاتر
  const clearFilters = () => {
    setFilterStageId(null);
    setFilterAttendance('');
    setFilterStatus('');
    setFilterTypeOfStudy('');
    setFilterPhone('');
    setFilterCodeParent('');
    setFilterCenterHourId('');
    setFilterGender('');
    setFilterGovernorate('');
    setFilterSchoolName('');
    toast.success(lang === 'ar' ? 'تم مسح جميع الفلاتر' : 'All filters cleared');
  };

  const hasActiveFilters = () => {
    return filterStageId !== null ||
      filterAttendance !== '' ||
      filterStatus !== '' ||
      filterTypeOfStudy !== '' ||
      filterPhone !== '' ||
      filterCodeParent !== '' ||
      filterCenterHourId !== '' ||
      filterGender !== '' ||
      filterGovernorate !== '' ||
      filterSchoolName !== '';
  };

  // قوائم للفلاتر
  const governorates = [
    'القاهرة', 'الإسكندرية', 'الجيزة', 'الشرقية', 'الدقهلية', 'البحيرة', 
    'المنوفية', 'القليوبية', 'الغربية', 'كفر الشيخ', 'المنيا', 'أسيوط', 
    'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'بورسعيد', 'السويس', 'دمياط', 
    'الإسماعيلية', 'شمال سيناء', 'جنوب سيناء', 'مطروح', 'الوادي الجديد', 'البحر الأحمر'
  ];

  const filteredStudents = getFilteredStudents();
  const stats = {
    students: book?.students?.length || 0,
    filteredCount: filteredStudents.length,
    activeStudents: book?.students?.filter(s => s.active).length || 0,
    onlineStudents: book?.students?.filter(s => s.type_of_attendance === 'online').length || 0,
    centerStudents: book?.students?.filter(s => s.type_of_attendance === 'center').length || 0,
    totalRevenue: book?.students?.reduce((sum, s) => sum + parseFloat(s.balance || '0'), 0) || 0,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{lang === 'ar' ? 'جاري تحميل الكتاب...' : 'Loading book...'}</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{lang === 'ar' ? 'الكتاب غير موجود' : 'Book not found'}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            {lang === 'ar' ? 'رجوع' : 'Back'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6 max-w-7xl mx-auto px-4 pb-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ x: -5 }}>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
              <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              {lang === 'ar' ? 'رجوع' : 'Back'}
            </Button>
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              {book.title}
            </motion.h1>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                ID: {book.id}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                {book.writer}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            {lang === 'ar' ? 'مشاركة' : 'Share'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Heart className="h-4 w-4" />
            {lang === 'ar' ? 'إعجاب' : 'Like'}
          </Button>
          <Button size="sm" className="gap-1 bg-gradient-to-r from-blue-600 to-indigo-600">
            <Edit className="h-4 w-4" />
            {lang === 'ar' ? 'تعديل' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Hero Section with Book Cover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
        onClick={() => setSelectedImage(book.image?.fullUrl || book.imageUrl || null)}
      >
        {book.image?.fullUrl ? (
          <img
            src={book.image.fullUrl}
            alt={book.title}
            className="w-full h-64 md:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-64 md:h-96 flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-indigo-500/20">
            <BookOpen className="h-24 w-24 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex flex-wrap gap-2">
            <Badge variant={book.active === 1 ? "default" : "secondary"} className="backdrop-blur-sm">
              {book.active === 1 ? (
                <><CheckCircle className="h-3 w-3 mr-1" /> {lang === 'ar' ? 'نشط' : 'Active'}</>
              ) : (
                <><XCircle className="h-3 w-3 mr-1" /> {lang === 'ar' ? 'غير نشط' : 'Inactive'}</>
              )}
            </Badge>
            {book.stage && (
              <Badge variant="outline" className="bg-black/50 text-white backdrop-blur-sm">
                <GraduationCap className="h-3 w-3 mr-1" />
                {isRTL ? book.stage.name_ar : book.stage.name}
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={BookOpen} label={lang === 'ar' ? 'الصفحات' : 'Pages'} value={book.pages_count} color="blue" />
        <StatCard icon={DollarSign} label={lang === 'ar' ? 'السعر' : 'Price'} value={`EGP ${book.price}`} color="green" />
        {parseFloat(book.discount) > 0 && (
          <StatCard icon={Award} label={lang === 'ar' ? 'السعر بعد الخصم' : 'After Discount'} value={`EGP ${getPriceAfterDiscount()}`} color="orange" />
        )}
        <StatCard icon={Users} label={lang === 'ar' ? 'الطلاب' : 'Students'} value={stats.students} color="purple" />
        <StatCard icon={Calendar} label={lang === 'ar' ? 'تاريخ الإضافة' : 'Added'} value={formatDate(book.createdAt)} color="indigo" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg gap-2">
            <BookOpen className="h-4 w-4" />
            {lang === 'ar' ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg gap-2">
            <Users className="h-4 w-4" />
            {lang === 'ar' ? 'الطلاب' : 'Students'}
            {stats.students > 0 && <Badge variant="secondary" className="ml-1">{stats.students}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Book Info Card */}
            <Card className="rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {lang === 'ar' ? 'معلومات الكتاب' : 'Book Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={User} label={lang === 'ar' ? 'المؤلف' : 'Writer'} value={book.writer} />
                <InfoRow icon={FileText} label={lang === 'ar' ? 'عدد الصفحات' : 'Pages'} value={book.pages_count} />
                <InfoRow icon={DollarSign} label={lang === 'ar' ? 'السعر' : 'Price'} value={`EGP ${book.price}`} />
                {parseFloat(book.discount) > 0 && (
                  <InfoRow icon={Award} label={lang === 'ar' ? 'الخصم' : 'Discount'} value={`EGP ${book.discount}`} />
                )}
                {parseFloat(book.discount) > 0 && (
                  <InfoRow icon={TrendingUp} label={lang === 'ar' ? 'السعر بعد الخصم' : 'Final Price'} value={`EGP ${getPriceAfterDiscount()}`} />
                )}
                <InfoRow icon={Calendar} label={lang === 'ar' ? 'تاريخ الإضافة' : 'Created At'} value={formatDate(book.createdAt)} />
                <InfoRow icon={Power} label={lang === 'ar' ? 'الحالة' : 'Status'} value={book.active === 1 ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')} />
              </CardContent>
            </Card>

         
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-4 space-y-4">
          {/* Header with Filters and Export */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {lang === 'ar' ? 'فلاتر' : 'Filters'}
                {hasActiveFilters() && (
                  <Badge variant="secondary" className="ml-1 px-1 text-xs">
                    {filteredStudents.length}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-1 text-red-500"
                >
                  <X className="h-4 w-4" />
                  {lang === 'ar' ? 'مسح' : 'Clear'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                className="gap-2 bg-green-50 dark:bg-green-950/20 border-green-200 hover:bg-green-100"
              >
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                {lang === 'ar' ? 'تصدير Excel' : 'Export to Excel'}
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                className="overflow-hidden"
              >
                <Card className="p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Stage Filter
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm font-medium">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        {lang === 'ar' ? 'المرحلة' : 'Stage'}
                      </Label>
                      <select
                        value={filterStageId || ''}
                        onChange={(e) => setFilterStageId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-3 py-2 rounded-xl border bg-background"
                      >
                        <option value="">{lang === 'ar' ? 'كل المراحل' : 'All Stages'}</option>
                        {book.stage && (
                          <option value={book.stage.id}>
                            {isRTL ? book.stage.name_ar : book.stage.name}
                          </option>
                        )}
                      </select>
                    </div> */}

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

                    {/* Attendance Type */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <Monitor className="h-4 w-4" />
                        {lang === 'ar' ? 'نوع الحضور' : 'Attendance Type'}
                      </Label>
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

                    {/* Gender */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {lang === 'ar' ? 'النوع' : 'Gender'}
                      </Label>
                      <select
                        value={filterGender}
                        onChange={(e) => setFilterGender(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border bg-background"
                      >
                        <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                        <option value="male">{lang === 'ar' ? 'ذكر' : 'Male'}</option>
                        <option value="female">{lang === 'ar' ? 'أنثى' : 'Female'}</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {lang === 'ar' ? 'الحالة' : 'Status'}
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

                    {/* Governorate */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {lang === 'ar' ? 'المحافظة' : 'Governorate'}
                      </Label>
                      <select
                        value={filterGovernorate}
                        onChange={(e) => setFilterGovernorate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border bg-background"
                      >
                        <option value="">{lang === 'ar' ? 'كل المحافظات' : 'All Governorates'}</option>
                        {governorates.map(gov => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {lang === 'ar' ? 'رقم الهاتف' : 'Phone'}
                      </Label>
                      <Input
                        value={filterPhone}
                        onChange={(e) => setFilterPhone(e.target.value)}
                        placeholder={lang === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
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
                        placeholder={lang === 'ar' ? 'أدخل كود ولي الأمر' : 'Enter parent code'}
                        className="rounded-xl"
                      />
                    </div>

                    {/* School Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {lang === 'ar' ? 'اسم المدرسة' : 'School Name'}
                      </Label>
                      <Input
                        value={filterSchoolName}
                        onChange={(e) => setFilterSchoolName(e.target.value)}
                        placeholder={lang === 'ar' ? 'أدخل اسم المدرسة' : 'Enter school name'}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {hasActiveFilters() && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'الفلاتر النشطة:' : 'Active Filters:'}</span>
                      {filterStageId && book.stage && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {isRTL ? book.stage.name_ar : book.stage.name}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStageId(null)} />
                        </Badge>
                      )}
                      {filterTypeOfStudy && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          {filterTypeOfStudy === 'general' ? '📚 عام' : '🕌 أزهر'}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterTypeOfStudy('')} />
                        </Badge>
                      )}
                      {filterAttendance && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          {filterAttendance === 'online' ? '🖥️ أونلاين' : '🏢 سنتر'}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterAttendance('')} />
                        </Badge>
                      )}
                      {filterGender && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <User className="h-3 w-3" />
                          {filterGender === 'male' ? (lang === 'ar' ? 'ذكر' : 'Male') : (lang === 'ar' ? 'أنثى' : 'Female')}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterGender('')} />
                        </Badge>
                      )}
                      {filterStatus && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          {filterStatus === 'active' ? '✅ نشط' : '❌ غير نشط'}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStatus('')} />
                        </Badge>
                      )}
                      {filterGovernorate && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <MapPin className="h-3 w-3" />
                          {filterGovernorate}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterGovernorate('')} />
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
                      {filterSchoolName && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Building2 className="h-3 w-3" />
                          {filterSchoolName}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterSchoolName('')} />
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-5 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                      <X className="h-4 w-4" />
                      {lang === 'ar' ? 'مسح الكل' : 'Reset All'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Stats */}
          {hasActiveFilters() && (
            <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
              <span>
                {lang === 'ar' ? 'النتائج:' : 'Results:'} {filteredStudents.length} / {stats.students}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-red-500"
              >
                {lang === 'ar' ? 'إلغاء الفلاتر' : 'Clear filters'}
              </Button>
            </div>
          )}

          {/* Students List */}
          {filteredStudents.length > 0 ? (
            <>
              {/* Student Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <SummaryCard icon={Users} label={lang === 'ar' ? 'إجمالي الطلاب' : 'Total'} value={filteredStudents.length} color="blue" />
                <SummaryCard icon={UserCheck} label={lang === 'ar' ? 'نشط' : 'Active'} value={filteredStudents.filter(s => s.active).length} color="green" />
                <SummaryCard icon={Globe} label={lang === 'ar' ? 'أونلاين' : 'Online'} value={filteredStudents.filter(s => s.type_of_attendance === 'online').length} color="purple" />
                <SummaryCard icon={MapPin} label={lang === 'ar' ? 'سنتر' : 'Center'} value={filteredStudents.filter(s => s.type_of_attendance === 'center').length} color="orange" />
                <SummaryCard icon={DollarSign} label={lang === 'ar' ? 'إجمالي الرصيد' : 'Total Balance'} value={`EGP ${filteredStudents.reduce((sum, s) => sum + parseFloat(s.balance || '0'), 0)}`} color="green" />
              </div>

              <div className="space-y-3">
                {filteredStudents.map((student, idx) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    idx={idx}
                    lang={lang}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState 
              icon={Users} 
              message={lang === 'ar' 
                ? hasActiveFilters() 
                  ? 'لا توجد نتائج تطابق الفلاتر المحددة' 
                  : 'لا يوجد طلاب اشتروا هذا الكتاب'
                : hasActiveFilters()
                  ? 'No results match the selected filters'
                  : 'No students bought this book'
              } 
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Image Modal */}
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
            <XCircle className="h-6 w-6 text-white" />
          </button>
        </motion.div>
      )}
    </motion.div>
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
  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
    <Icon className="h-4 w-4 text-muted-foreground" />
    <span className="text-sm text-muted-foreground">{label}:</span>
    <span className="text-sm font-medium">{value || '—'}</span>
  </div>
);

const StudentCard: React.FC<{ student: any; idx: number; lang: string; formatDate: (date: string) => string }> = ({
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
        <div className="flex items-start justify-between flex-wrap gap-2">
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
          {student.code_parent && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Award className="h-3 w-3" />
              <span>{lang === 'ar' ? 'الكود:' : 'Code:'} {student.code_parent}</span>
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
            <Calendar className="h-3 w-3" />
            <span>{lang === 'ar' ? 'تاريخ التسجيل:' : 'Joined:'} {formatDate(student.created_at)}</span>
          </div>
          {student.balance !== '0.00' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3 text-green-500" />
              <span>{lang === 'ar' ? 'الرصيد:' : 'Balance:'} EGP {student.balance}</span>
            </div>
          )}
          {student.stage && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <GraduationCap className="h-3 w-3" />
              <span>{lang === 'ar' ? 'المرحلة:' : 'Stage:'} {student.stage.name}</span>
            </div>
          )}
          {student.type_of_study && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>📖</span>
              <span>
                {student.type_of_study === 'general'
                  ? (lang === 'ar' ? 'عام' : 'General')
                  : (lang === 'ar' ? 'أزهر' : 'Azhar')}
              </span>
            </div>
          )}
          {student.gender && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{lang === 'ar' ? 'النوع:' : 'Gender:'} {student.gender === 'male' ? (lang === 'ar' ? 'ذكر' : 'Male') : (lang === 'ar' ? 'أنثى' : 'Female')}</span>
            </div>
          )}
          {student.governorate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{lang === 'ar' ? 'المحافظة:' : 'Governorate:'} {student.governorate}</span>
            </div>
          )}
          {student.school_name && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span>{lang === 'ar' ? 'المدرسة:' : 'School:'} {student.school_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const SummaryCard: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode; color: string }> = ({
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