/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/books/BookDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, BookOpen, User, DollarSign, FileText, Calendar, 
  Users, Phone, Mail, MapPin, GraduationCap, Star, Eye, 
  Download, Share2, Heart, Edit, Trash2, Power, Loader2, 
  CheckCircle, XCircle, AlertCircle, Image as ImageIcon,
  UserCheck, UserX, Globe, Clock, Award, TrendingUp, Filter, X, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import api from '@/lib/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  
  // ✅ State للفلتر في الطلاب
  const [studentFilters, setStudentFilters] = useState({
    search: '',
    typeOfAttendance: '',
    active: '',
  });
  const [showStudentFilters, setShowStudentFilters] = useState(false);

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

  // ✅ فلترة الطلاب
  const filteredStudents = React.useMemo(() => {
    if (!book?.students) return [];
    let filtered = [...book.students];

    if (studentFilters.search) {
      const searchTerm = studentFilters.search.toLowerCase();
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(searchTerm) ||
        s.id?.toString().includes(searchTerm)
      );
    }

    if (studentFilters.typeOfAttendance) {
      filtered = filtered.filter(s => s.type_of_attendance === studentFilters.typeOfAttendance);
    }

    if (studentFilters.active !== '') {
      filtered = filtered.filter(s => s.active === (studentFilters.active === 'active'));
    }

    return filtered;
  }, [book?.students, studentFilters]);

  // ✅ تصدير بيانات الكتاب إلى Excel
  const exportBookToExcel = () => {
    if (!book) return;

    const bookData = [{
      [lang === 'ar' ? 'المعرف' : 'ID']: book.id,
      [lang === 'ar' ? 'العنوان' : 'Title']: book.title,
      [lang === 'ar' ? 'المؤلف' : 'Writer']: book.writer,
      [lang === 'ar' ? 'السعر' : 'Price']: `${book.price} EGP`,
      [lang === 'ar' ? 'الخصم' : 'Discount']: `${book.discount} EGP`,
      [lang === 'ar' ? 'السعر بعد الخصم' : 'Final Price']: `${parseFloat(book.price) - parseFloat(book.discount || '0')} EGP`,
      [lang === 'ar' ? 'عدد الصفحات' : 'Pages']: book.pages_count,
      [lang === 'ar' ? 'المرحلة' : 'Stage']: isRTL ? book.stage?.name_ar : book.stage?.name,
      [lang === 'ar' ? 'الحالة' : 'Status']: book.active === 1 ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive'),
      [lang === 'ar' ? 'تاريخ الإضافة' : 'Created At']: formatDate(book.createdAt),
    }];

    const worksheet = XLSX.utils.json_to_sheet(bookData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, lang === 'ar' ? 'معلومات الكتاب' : 'Book Info');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `book_${book.id}_info.xlsx`);
    
    toast.success(lang === 'ar' ? 'تم تصدير معلومات الكتاب بنجاح' : 'Book info exported successfully');
  };

  // ✅ تصدير الطلاب إلى Excel
  const exportStudentsToExcel = () => {
    if (!filteredStudents.length) return;

    const studentsData = filteredStudents.map((student, index) => ({
      [lang === 'ar' ? '#' : 'No']: index + 1,
      [lang === 'ar' ? 'المعرف' : 'ID']: student.id,
      [lang === 'ar' ? 'الاسم' : 'Name']: student.name,
      [lang === 'ar' ? 'الهاتف' : 'Phone']: student.phone,
      [lang === 'ar' ? 'هاتف ولي الأمر' : 'Parent Phone']: student.phone_parent || '—',
      [lang === 'ar' ? 'كود ولي الأمر' : 'Parent Code']: student.code_parent || '—',
      [lang === 'ar' ? 'نوع الحضور' : 'Attendance Type']: student.type_of_attendance === 'online' ? (lang === 'ar' ? 'أونلاين' : 'Online') : (lang === 'ar' ? 'سنتر' : 'Center'),
      [lang === 'ar' ? 'الحالة' : 'Status']: student.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive'),
      // [lang === 'ar' ? 'الرصيد' : 'Balance']: `${student.balance} EGP`,
      [lang === 'ar' ? 'المحافظة' : 'Governorate']: student.governorate || '—',
      [lang === 'ar' ? 'المدرسة' : 'School']: student.school_name || '—',
      [lang === 'ar' ? 'تاريخ التسجيل' : 'Registered']: formatDate(student.created_at),
    }));

    const worksheet = XLSX.utils.json_to_sheet(studentsData);
    const colWidths = [{ wch: 6 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, lang === 'ar' ? 'طلاب الكتاب' : 'Book Students');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `book_${book?.id}_students.xlsx`);
    
    toast.success(lang === 'ar' ? 'تم تصدير بيانات الطلاب بنجاح' : 'Students data exported successfully');
  };

  // ✅ تصدير الكل (الكتاب + الطلاب)
  const exportAllToExcel = () => {
    if (!book) return;

    const workbook = XLSX.utils.book_new();

    // ورقة معلومات الكتاب
    const bookData = [{
      [lang === 'ar' ? 'المعرف' : 'ID']: book.id,
      [lang === 'ar' ? 'العنوان' : 'Title']: book.title,
      [lang === 'ar' ? 'المؤلف' : 'Writer']: book.writer,
      [lang === 'ar' ? 'السعر' : 'Price']: `${book.price} EGP`,
      [lang === 'ar' ? 'الخصم' : 'Discount']: `${book.discount} EGP`,
      [lang === 'ar' ? 'السعر بعد الخصم' : 'Final Price']: `${parseFloat(book.price) - parseFloat(book.discount || '0')} EGP`,
      [lang === 'ar' ? 'عدد الصفحات' : 'Pages']: book.pages_count,
      [lang === 'ar' ? 'المرحلة' : 'Stage']: isRTL ? book.stage?.name_ar : book.stage?.name,
      [lang === 'ar' ? 'الحالة' : 'Status']: book.active === 1 ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive'),
      [lang === 'ar' ? 'تاريخ الإضافة' : 'Created At']: formatDate(book.createdAt),
    }];
    const bookSheet = XLSX.utils.json_to_sheet(bookData);
    XLSX.utils.book_append_sheet(workbook, bookSheet, lang === 'ar' ? 'معلومات الكتاب' : 'Book Info');

    // ورقة الطلاب
    if (filteredStudents.length > 0) {
      const studentsData = filteredStudents.map((student, index) => ({
        [lang === 'ar' ? '#' : 'No']: index + 1,
        [lang === 'ar' ? 'المعرف' : 'ID']: student.id,
        [lang === 'ar' ? 'الاسم' : 'Name']: student.name,
        [lang === 'ar' ? 'الهاتف' : 'Phone']: student.phone,
        [lang === 'ar' ? 'هاتف ولي الأمر' : 'Parent Phone']: student.phone_parent || '—',
        [lang === 'ar' ? 'كود ولي الأمر' : 'Parent Code']: student.code_parent || '—',
        [lang === 'ar' ? 'نوع الحضور' : 'Attendance Type']: student.type_of_attendance === 'online' ? (lang === 'ar' ? 'أونلاين' : 'Online') : (lang === 'ar' ? 'سنتر' : 'Center'),
        [lang === 'ar' ? 'الحالة' : 'Status']: student.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive'),
        [lang === 'ar' ? 'الرصيد' : 'Balance']: `${student.balance} EGP`,
        [lang === 'ar' ? 'المحافظة' : 'Governorate']: student.governorate || '—',
        [lang === 'ar' ? 'المدرسة' : 'School']: student.school_name || '—',
        [lang === 'ar' ? 'تاريخ التسجيل' : 'Registered']: formatDate(student.created_at),
      }));
      const studentsSheet = XLSX.utils.json_to_sheet(studentsData);
      XLSX.utils.book_append_sheet(workbook, studentsSheet, lang === 'ar' ? 'طلاب الكتاب' : 'Book Students');
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `book_${book.id}_complete_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success(lang === 'ar' ? 'تم تصدير جميع البيانات بنجاح' : 'All data exported successfully');
  };

  // دالة مساعدة لمسح الفلاتر
  const clearStudentFilters = () => {
    setStudentFilters({
      search: '',
      typeOfAttendance: '',
      active: '',
    });
    setShowStudentFilters(false);
  };

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

  const stats = {
    students: book.students?.length || 0,
    activeStudents: book.students?.filter(s => s.active).length || 0,
    onlineStudents: book.students?.filter(s => s.type_of_attendance === 'online').length || 0,
    centerStudents: book.students?.filter(s => s.type_of_attendance === 'center').length || 0,
    totalRevenue: book.students?.reduce((sum, s) => sum + parseFloat(s.balance || '0'), 0) || 0,
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6 max-w-7xl mx-auto px-4 pb-8"
    >
      {/* Header with Export Buttons */}
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
        <div className="flex gap-2 flex-wrap">
          {/* زر تصدير الكتاب */}
          <Button variant="outline" size="sm" onClick={exportBookToExcel} className="gap-1">
            <Download className="h-4 w-4" />
            {lang === 'ar' ? 'تصدير الكتاب' : 'Export Book'}
          </Button>
          {/* زر تصدير الطلاب */}
          {stats.students > 0 && (
            <Button variant="outline" size="sm" onClick={exportStudentsToExcel} className="gap-1 bg-green-50 dark:bg-green-950/20 border-green-200">
              <Download className="h-4 w-4 text-green-600" />
              <span className="text-green-600 dark:text-green-400">{lang === 'ar' ? 'تصدير الطلاب' : 'Export Students'}</span>
            </Button>
          )}
          {/* زر تصدير الكل */}
          <Button size="sm" onClick={exportAllToExcel} className="gap-1 bg-gradient-to-r from-blue-600 to-indigo-600">
            <Download className="h-4 w-4" />
            {lang === 'ar' ? 'تصدير الكل' : 'Export All'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            {lang === 'ar' ? 'مشاركة' : 'Share'}
          </Button>
          <Button size="sm" className="gap-1 bg-gradient-to-r from-blue-600 to-indigo-600">
            <Edit className="h-4 w-4" />
            {lang === 'ar' ? 'تعديل' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* باقي الكود كما هو - Hero Section, Stats Cards, Tabs... */}
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

        {/* Overview Tab - نفس الكود */}
        <TabsContent value="overview" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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

            {book.stage && (
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    {lang === 'ar' ? 'معلومات المرحلة' : 'Stage Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow icon={GraduationCap} label={lang === 'ar' ? 'المرحلة' : 'Stage'} value={isRTL ? book.stage.name_ar : book.stage.name} />
                  <InfoRow icon={CheckCircle} label={lang === 'ar' ? 'حالة المرحلة' : 'Stage Status'} value={book.stage.active ? (lang === 'ar' ? 'نشطة' : 'Active') : (lang === 'ar' ? 'غير نشطة' : 'Inactive')} />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Students Tab with Filters and Export */}
        <TabsContent value="students" className="mt-4">
          {stats.students > 0 ? (
            <>
              {/* Student Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <SummaryCard icon={Users} label={lang === 'ar' ? 'إجمالي الطلاب' : 'Total'} value={stats.students} color="blue" />
                <SummaryCard icon={UserCheck} label={lang === 'ar' ? 'نشط' : 'Active'} value={stats.activeStudents} color="green" />
                <SummaryCard icon={Globe} label={lang === 'ar' ? 'أونلاين' : 'Online'} value={stats.onlineStudents} color="purple" />
                <SummaryCard icon={MapPin} label={lang === 'ar' ? 'سنتر' : 'Center'} value={stats.centerStudents} color="orange" />
              </div>

              {/* Filter Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStudentFilters(!showStudentFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    {lang === 'ar' ? 'فلاتر' : 'Filters'}
                    {(studentFilters.search || studentFilters.typeOfAttendance || studentFilters.active) && (
                      <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                        {[studentFilters.search, studentFilters.typeOfAttendance, studentFilters.active].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                  {/* زر تصدير الطلاب */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportStudentsToExcel}
                    className="gap-2 bg-green-50 dark:bg-green-950/20 border-green-200"
                  >
                    <Download className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 dark:text-green-400">{lang === 'ar' ? 'تصدير Excel' : 'Export Excel'}</span>
                  </Button>
                  {(studentFilters.search || studentFilters.typeOfAttendance || studentFilters.active) && (
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

              {/* Results Count */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar' 
                    ? `عرض ${filteredStudents.length} من ${stats.students} طالب`
                    : `Showing ${filteredStudents.length} of ${stats.students} students`}
                </p>
              </div>

              {/* Students List */}
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
            <EmptyState icon={Users} message={lang === 'ar' ? 'لا يوجد طلاب اشتروا هذا الكتاب' : 'No students bought this book'} />
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

// ==================== مكونات مساعدة (نفس الكود) ====================

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