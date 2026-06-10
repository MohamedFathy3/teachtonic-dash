/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/InstructorCourses.tsx
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import api from '@/lib/api';
import { useTeacherMeta } from "@/hooks/useTeacherMeta";
import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { courseService } from '@/services/course.service';
import { CourseCard } from '@/components/courses/CourseCard';
import { CourseForm } from '@/components/courses/CourseForm';
import { CourseDetails } from '@/components/courses/CourseDetails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import {
  Loader2, Plus, Search, Trash2, RefreshCw, Archive, Eye,
  Grid3x3, List, AlertCircle, Edit2,
  Power, PowerOff, ChevronLeft, ChevronRight, BookOpen,
  Users, DollarSign, Clock, Filter, X, Sparkles, TrendingUp,
  GraduationCap, Calendar, Star, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Course } from '@/types/course.types';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import { Label } from '@/components/ui/label';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import { Select } from '@/components/ui/select';



// ✅ أنيميشن متقدمة
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
};

const statsCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400 } },
  hover: { scale: 1.03, y: -3, transition: { type: "spring", stiffness: 400 } },
};

export const InstructorCourses: React.FC = () => {
  const { t, lang, user } = useApp();
  const { stages, subjects } = useTeacherMeta(user?.id);
  const isRTL = lang === 'ar';

  // ✅ State
  const [courses, setCourses] = useState<Course[]>([]);
  const [deletedCourses, setDeletedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Filter State
  const [filterStageId, setFilterStageId] = useState<number | null>(null);
  const [filterSubjectId, setFilterSubjectId] = useState<number | null>(null);
  const [filterSemesterId, setFilterSemesterId] = useState<number | null>(null);

  // ✅ Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 12,
  });

  // ✅ Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // ✅ Dialog States
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [restoringCourse, setRestoringCourse] = useState<Course | null>(null);
  const [forceDeletingCourse, setForceDeletingCourse] = useState<Course | null>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState<{ type: 'delete' | 'restore' | 'forceDelete' | null; open: boolean }>({ type: null, open: false });


  const [price, setPrice] = useState<number | null>(null);
  const [courseType, setCourseType] = useState<'online' | 'center' | ''>('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [page, setPage] = useState(1);



const fetchCourses = useCallback(async (page = 1) => {
  if (!activeTab) return;

  setLoading(true);
  setError(null);

  const filters: Record<string, any> = {
    teacher_id: user?.id,
    stage_id: filterStageId,
    subject_id: filterSubjectId,
    semester_id: filterSemesterId,
    price: price ?? undefined,
    type: courseType || undefined,
    start_date: startDate,
    end_date: endDate,
  };

  // 🔥 البحث الذكي حسب اللغة
  let searchField = searchQuery;
  let searchType = 'default';
  
  if (searchQuery?.trim()) {
    if (lang === 'ar') {
      // في الوضع العربي - بحث في title_ar
      filters.title_ar = searchQuery.trim();
      searchField = searchQuery.trim();
      searchType = 'arabic';
    } else {
      // في الوضع الإنجليزي - بحث في title
      filters.title = searchQuery.trim();
      searchField = searchQuery.trim();
      searchType = 'english';
    }
  }

  console.log(`🔍 Searching in ${searchType} mode with:`, searchField);

  try {
    const response = await courseService.getAllCourses(
      filters,
      12,
      page,
      '', // 🔥 ما نمررش search تاني عشان ما يضربش الفلتر
      activeTab === 'deleted'
    );

    if (activeTab === 'active') {
      setCourses(response.data || []);
    } else {
      setDeletedCourses(response.data || []);
    }

    setPagination({
      currentPage: response.meta?.current_page || 1,
      lastPage: response.meta?.last_page || 1,
      total: response.meta?.total || 0,
      perPage: response.meta?.per_page || 12,
    });
  } catch (err: any) {
    setError(err.message || 'Failed to fetch courses');
  } finally {
    setLoading(false);
  }
}, [
  activeTab,
  searchQuery,
  lang, // 🔥 أضف lang للـ dependencies
  filterStageId,
  filterSubjectId,
  filterSemesterId,
  price,
  courseType,
  startDate,
  endDate,
  user?.id
]);




  useEffect(() => {
    fetchCourses(1);
  }, [fetchCourses]);
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchCourses(page);
      setSelectedIds(new Set());
    }
  };

  const clearFilters = () => {
    setFilterStageId(null);
    setFilterSubjectId(null);
    setFilterSemesterId(null);
    setShowFilters(false);
  };



  const applyFilters = () => {
    fetchCourses(1);
    setPage(1);
    setSelectedIds(new Set());
  };
  const refreshCourses = async () => {
    await fetchCourses(pagination.currentPage);
  };
  // ✅ Handlers
  const handleToggleActive = async (course: Course) => {
    await courseService.toggleCourseActive(course.id);
    await fetchCourses(pagination.currentPage);
    await refreshCourses();
  };

  const handleDelete = async (course: Course) => {
    await courseService.deleteCourse(course.id);
    await fetchCourses(pagination.currentPage);
    setDeletingCourse(null);
    await refreshCourses();
  };

  const handleRestore = async (course: Course) => {
    await courseService.restoreCourse(course.id);
    await fetchCourses(pagination.currentPage);
    setRestoringCourse(null);
    await refreshCourses();
  };

  const handleForceDelete = async (course: Course) => {
    await courseService.forceDeleteCourse(course.id);
    await fetchCourses(pagination.currentPage);
    setForceDeletingCourse(null);
    await refreshCourses();
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setSelectedCourseId(course.id);
    setShowDetails(true);

  };

  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setCourseToEdit(null);
    fetchCourses(pagination.currentPage);
  };

  const currentList = activeTab === 'active' ? courses : deletedCourses;
  const isDeletedTab = activeTab === 'deleted';

  // ✅ Stats
  const stats = {
    total: pagination.total || 0,
    active: courses.filter(c => c.active === 1).length,
    inactive: courses.filter(c => c.active === 0).length,
    totalStudents: courses.reduce((sum, c) => sum + (c.count_student || 0), 0),
  };

  // ✅ Render Details
  if (showDetails && selectedCourse) {
    return (
      <CourseDetails
        courseId={selectedCourseId!}
        onBack={() => {
          setShowDetails(false);
          setSelectedCourse(null);
          setSelectedCourseId(null);
        }}
        onEdit={() => {
          setShowDetails(false);
          setCourseToEdit(selectedCourse);
          setShowForm(true);
        }}
      />
    );
  }

  // ✅ Render Form
  if (showForm) {
    return (
      <CourseForm
        course={courseToEdit || undefined}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setCourseToEdit(null);
        }}
      />
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* ✅ Header Section */}
        <motion.div variants={headerVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-xl opacity-60" />
                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('myCourses')}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Sparkles className="h-3 w-3" />
                  {pagination.total} {t('courses')} 
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-muted/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 px-3 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-800 text-primary shadow-md'
                  : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 px-3 rounded-lg transition-all duration-300 ${viewMode === 'table'
                  ? 'bg-white dark:bg-gray-800 text-primary shadow-md'
                  : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button
              onClick={() => refreshCourses()}
              disabled={loading}
              className="
    gap-2
    rounded-xl
    bg-gradient-to-r
    from-cyan-500
    to-blue-600
    hover:from-cyan-600
    hover:to-blue-700
    text-white
    shadow-lg
  "
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {lang === "ar" ? "تحديث البيانات" : "Refresh Data"}
            </Button>
            {/* ✅ زرار التصدير */}
            <ExportExcelButton
              data={currentList}
              fileName="courses-list"
              label={lang === 'ar' ? 'تصدير' : 'Export'}
              disabled={loading || currentList.length === 0}
            />
            {/* Create Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4" />
              {t('createCourse')}
            </motion.button>
          </div>
        </motion.div>

        {/* ✅ Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: t('totalCourses'), value: stats.total, icon: BookOpen, color: 'from-blue-500 to-cyan-500', delay: 0 },
            { label: t('activeCourses'), value: stats.active, icon: Eye, color: 'from-green-500 to-emerald-500', delay: 0.1 },
            { label: t('inactiveCourses'), value: stats.inactive, icon: Power, color: 'from-orange-500 to-red-500', delay: 0.2 },
            // { label: t('totalStudents'), value: stats.totalStudents, icon: Users, color: 'from-purple-500 to-pink-500', delay: 0.3 },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={statsCardVariants}
              whileHover="hover"
              className="relative overflow-hidden rounded-xl bg-gradient-to-r p-4 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${stat.color.split(' ')[1]}20, ${stat.color.split(' ')[3]}10)` }}
            >
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: stat.delay, type: "spring" }}
                    className="text-2xl font-bold mt-1"
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            </motion.div>
          ))}
        </motion.div>

        {/* ✅ Tabs & Filters Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <TabsList className="bg-muted/50 p-1 rounded-xl">
             

              </TabsList>

              <div className="flex gap-2">
                {/* Filter Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2.5 rounded-xl border transition-all duration-300 ${showFilters
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary'
                    }`}
                >
                  <Filter className="h-4 w-4" />
                </motion.button>

                {/* Search */}
                <div className="relative">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                  <Input
                    placeholder={t('searchCourses')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${isRTL ? 'pr-9' : 'pl-9'} w-64 rounded-xl bg-white dark:bg-gray-800`}
                  />
                </div>
              </div>
            </div>

            {/* ✅ Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="overflow-hidden"
                >
                  <Card className="p-5 mt-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-xl rounded-2xl">

                    {/* 🔹 Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    

                      {/* Subject */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1 text-sm font-medium">
                          <BookOpen className="h-4 w-4 text-primary" />
                          {t('subject') || 'المادة'}
                        </Label>

                        <Select value={filterSubjectId?.toString()} onValueChange={(val) => setFilterSubjectId(Number(val))}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Subjects" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>

                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id.toString()}>
                                {isRTL ? subject.name_ar : subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
  {/* Stage */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1 text-sm font-medium">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          {t('stage') || 'المرحلة'}
                        </Label>


                        <Select value={filterStageId?.toString()} onValueChange={(val) => setFilterStageId(Number(val))}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Stages" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>

                            {stages.map((stage) => (
                              <SelectItem key={stage.id} value={stage.id.toString()}>
                                {isRTL ? stage.name_ar : stage.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Semester */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-primary" />
                          {t('semester') || 'الترم'}
                        </Label>
                        <AsyncSelect
                          configKey="semesters"
                          value={filterSemesterId}
                          onChange={setFilterSemesterId}
                          placeholder={lang === 'ar' ? 'جميع الترمات' : 'All Semesters'}
                          clearable
                          extraFilters={{ teacher_id: user?.id }}
                        />
                      </div>

                      {/* Price (Single) */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          {lang === 'ar' ? 'السعر' : 'Price'}
                        </Label>

                        <Input
                          type="number"
                          placeholder={lang === 'ar' ? 'أدخل السعر' : 'Enter price'}
                          value={price ?? ''}
                          onChange={(e) =>
                            setPrice(e.target.value ? Number(e.target.value) : null)
                          }
                        />
                      </div>

                      {/* Course Type */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          {lang === 'ar' ? 'نوع الكورس' : 'Course Type'}
                        </Label>

                        <Select
                          value={courseType}
                          onValueChange={(value) =>
                            setCourseType(value as 'all' | 'online' | 'center')
                          }
                        >
                          <SelectTrigger className="w-full rounded-xl bg-white dark:bg-gray-800 border">
                            <SelectValue placeholder={lang === 'ar' ? 'الكل' : 'All'} />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="all">
                              {lang === 'ar' ? 'الكل' : 'All'}
                            </SelectItem>

                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                    </div>

                    {/* 🔹 Actions */}
                    <div className="flex justify-end gap-3 mt-5 pt-3 border-t">

                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
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
            {/* ✅ Content */}
            <TabsContent value={activeTab} className="mt-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground mt-4">{t('loadingCourses')}</p>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!loading && !error && currentList.length === 0 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-12 w-12 text-primary/40" />
                  </div>
                  <p className="text-muted-foreground mb-4 text-lg">
                    {!isDeletedTab ? t('noCoursesFound') : t('noDeletedCourses')}
                  </p>
                  {!isDeletedTab && (
                    <Button onClick={() => setShowForm(true)} variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t('createYourFirstCourse')}
                    </Button>
                  )}
                </motion.div>
              )}

              {/* ✅ Grid View */}
              {!loading && !error && currentList.length > 0 && viewMode === 'grid' && (
                <>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                  >
                    {currentList.map((course, idx) => (
                      <motion.div
                        key={course.id}
                        variants={itemVariants}
                        custom={idx}
                      >
                        <CourseCard
                          course={course}
                          onView={handleViewCourse}
                          onEdit={handleEditCourse}
                          onDelete={() => setDeletingCourse(course)}
                          onRestore={() => setRestoringCourse(course)}
                          onForceDelete={() => setForceDeletingCourse(course)}
                          onToggleActive={handleToggleActive}
                          isDeleted={isDeletedTab}
                          showActions={true}
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* ✅ Pagination */}
                  {pagination.total > pagination.perPage && (
                    <div className="flex items-center justify-center gap-3 pt-8 pb-4">
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
                </>
              )}

              {/* ✅ Table View - Simplified with better design */}
              {!loading && !error && currentList.length > 0 && viewMode === 'table' && (
                <Card className="rounded-3xl overflow-hidden border bg-background/80 backdrop-blur-md shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-b">
                        <tr>
                          <th className="px-6 py-5 text-right text-sm font-bold">
                            {t('course')}
                          </th>

                          <th className="px-6 py-5 text-right text-sm font-bold hidden md:table-cell">
                            {t('students')}
                          </th>

                          <th className="px-6 py-5 text-center text-sm font-bold">
                            {t('price')}
                          </th>

                          {!isDeletedTab && (
                            <th className="px-6 py-5 text-center text-sm font-bold">
                              {t('status')}
                            </th>
                          )}

                          <th className="px-6 py-5 text-center text-sm font-bold">
                            {t('actions')}
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-border">
                        {currentList.map((course, idx) => (
                          <motion.tr
                            key={course.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="
              group
              transition-all
              duration-300
              hover:bg-primary/5
            "
                          >
                            {/* Course */}
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div
                                  className="
                  w-14 h-14
                  rounded-2xl
                  overflow-hidden
                  ring-2 ring-primary/10
                  shadow-md
                  shrink-0
                "
                                >
                                  {course.image?.fullUrl ? (
                                    <img
                                      src={course.image.fullUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                                      <BookOpen className="h-6 w-6 text-primary" />
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <p className="font-semibold text-base">
                                    {isRTL ? course.title_ar : course.title}
                                  </p>

                                  <p className="text-xs text-muted-foreground mt-1">
                                    {isRTL
                                      ? course.subject?.name_ar
                                      : course.subject?.name}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Students */}
                            <td className="px-6 py-5 hidden md:table-cell">
                              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="font-semibold">
                                  {course.count_student}
                                </span>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-6 py-5 text-center">
                              <div
                                className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-xl
                bg-gradient-to-r
                from-emerald-500/10
                to-green-500/10
                border
                border-emerald-500/20
              "
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                  EGP
                                </span>

                                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                  {Number(course.price).toLocaleString()}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            {!isDeletedTab && (
                              <td className="px-6 py-5 text-center">
                                {course.active === 1 ? (
                                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                    <Zap className="h-4 w-4" />
                                    {t('active')}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                    <PowerOff className="h-4 w-4" />
                                    {t('inactive')}
                                  </span>
                                )}
                              </td>
                            )}

                            {/* Actions */}
                            <td className="px-6 py-5 text-center">
                              <div className="flex justify-center">
                                <div className="flex gap-2 p-1 rounded-xl bg-muted/40">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl hover:bg-primary/10"
                                    onClick={() => handleViewCourse(course)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>

                                  {!isDeletedTab ? (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
                                        onClick={() => handleEditCourse(course)}
                                      >
                                        <Edit2 className="h-4 w-4 text-yellow-500" />
                                      </Button>

                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20"
                                        onClick={() => setDeletingCourse(course)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl hover:bg-green-100 dark:hover:bg-green-900/20"
                                        onClick={() => setRestoringCourse(course)}
                                      >
                                        <RefreshCw className="h-4 w-4 text-green-500" />
                                      </Button>

                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20"
                                        onClick={() => setForceDeletingCourse(course)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* ✅ Dialogs */}
        <DeleteConfirmDialog
          open={!!deletingCourse}
          onClose={() => setDeletingCourse(null)}
          onConfirm={() => handleDelete(deletingCourse!)}
          title={t('deleteCourse') || 'Delete Course'}
          itemName={deletingCourse?.title}
        />

        <DeleteConfirmDialog
          open={!!restoringCourse}
          onClose={() => setRestoringCourse(null)}
          onConfirm={() => handleRestore(restoringCourse!)}
          title={t('restoreCourse') || 'Restore Course'}
          itemName={restoringCourse?.title}
        />

        <DeleteConfirmDialog
          open={!!forceDeletingCourse}
          onClose={() => setForceDeletingCourse(null)}
          onConfirm={() => handleForceDelete(forceDeletingCourse!)}
          title={t('permanentDelete') || 'Permanent Delete'}
          itemName={forceDeletingCourse?.title}
        />
      </div>
    </motion.div>
  );
};

// ✅ Delete Confirm Dialog Component
const DeleteConfirmDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName?: string;
}> = ({ open, onClose, onConfirm, title, itemName }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
      >
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">
          {`Are you sure you want to delete "${itemName || 'this item'}"? This action cannot be undone.`}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
        </div>
      </motion.div>
    </div>
  );
};