// src/pages/admin/SemestersPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTeacherMeta } from '@/hooks/useTeacherMeta'; // عدّل المسار حسب مشروعك
import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { semesterService, Semester, SemesterFormData, SemesterFilters } from '@/services/semester.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  Plus,
  Search,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Tag,
  X,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Save,
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AsyncSelect } from '../ui/AsyncSelect';

export const SemestersPage: React.FC = () => {
  const { t, lang, user } = useApp();
  const teacherId = user?.id;

  const { stages, subjects } = useTeacherMeta(teacherId);
  const isRTL = lang === 'ar';

  // ✅ State

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // ✅ Filters State
  const [filters, setFilters] = useState<SemesterFilters>({
    subject_id: null,
    teacher_id: user?.id || null,

    active: '',

    // discount range (API uses `discount` field)
    price: null,
    discount: null,
    from_date: '',
    to_date: '',

    has_image: '',

  });



  // ✅ Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [formData, setFormData] = useState<SemesterFormData>({
    name: '',
    name_ar: '',
    price: 0,
    discount: 0,
    teacher_id: user?.id || 1,
    subject_id: null,
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // ✅ Debounce search
  // ✅ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleExport = async () => {
    try {
      const response = await semesterService.getAllSemesters(
        {},
        10000,
        1,
        ''
      );

      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const fetchSemesters = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await semesterService.getAllSemesters(
        filters as Record<string, any>,
        pagination.perPage,
        page,
        debouncedSearch
      );
      setSemesters(response.data);
      setPagination({
        currentPage: response.meta.current_page,
        lastPage: response.meta.last_page,
        total: response.meta.total,
        perPage: response.meta.per_page,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch semesters');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.perPage, filters]);

  // ✅ Filters should only trigger requests after user clicks Apply/Reset

  useEffect(() => {
    // Only fetch when search changes (no state changes inside this effect other than the fetch itself).
    fetchSemesters(1);
  }, [debouncedSearch, fetchSemesters]);



  // ✅ Handlers
  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await semesterService.createSemester(formData);
      setShowModal(false);
      resetForm();
      fetchSemesters(1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingSemester) return;
    setSubmitting(true);
    try {
      await semesterService.updateSemester(editingSemester.id, formData);
      setShowModal(false);
      resetForm();
      fetchSemesters(pagination.currentPage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الترم؟' : 'Are you sure you want to delete this semester?')) {
      await semesterService.deleteSemester(id);
      fetchSemesters(pagination.currentPage);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(lang === 'ar' ? `حذف ${selectedIds.size} ترم؟` : `Delete ${selectedIds.size} semesters?`)) {
      await semesterService.bulkDeleteSemesters(Array.from(selectedIds));
      setSelectedIds(new Set());
      fetchSemesters(1);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === semesters.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(semesters.map(s => s.id)));
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  const openEditModal = (semester: Semester) => {
    setEditingSemester(semester);
    setFormData({
      name: semester.name,
      name_ar: semester.name_ar || '',
      price: parseFloat(semester.price),
      discount: parseFloat(semester.discount),
      teacher_id: semester.teacher_id,
      subject_id: semester.subject_id,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingSemester(null);
    setFormData({
      name: '',
      name_ar: '',
      price: 0,
      discount: 0,
      teacher_id: user?.id || 1,
      subject_id: null,
    });
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchSemesters(page);
      setSelectedIds(new Set());
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
  };

  // ✅ Stats
  const stats = {
    total: pagination.total,
    active: semesters.filter(s => s.active).length,
    totalPrice: semesters.reduce((sum, s) => sum + parseFloat(s.price), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* ✅ Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-xl opacity-60" />
              <div className="relative h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {lang === 'ar' ? 'الترم الدراسي' : 'Semesters'}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Tag className="h-3 w-3" />
                {stats.total} {lang === 'ar' ? 'ترم' : 'semesters'} • {stats.totalPrice.toFixed(2)} EGP
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <ExportExcelButton
              data={semesters}
              fileName="semesters-list"
              label={lang === 'ar' ? 'تصدير' : 'Export'}
              disabled={loading || semesters.length === 0}
            />
            {selectedIds.size > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl flex items-center gap-2 hover:bg-red-700 transition-all"
              >
                <Trash2 className="h-4 w-4" />
                {lang === 'ar' ? 'حذف' : 'Delete'} ({selectedIds.size})
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4" />
              {lang === 'ar' ? 'إضافة ترم' : 'Add Semester'}
            </motion.button>
          </div>
        </div>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: lang === 'ar' ? 'إجمالي الأتربة' : 'Total Semesters', value: stats.total, icon: Calendar, color: 'from-purple-500 to-pink-500' },
            { label: lang === 'ar' ? 'الأتربة النشطة' : 'Active Semesters', value: stats.active, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
            { label: lang === 'ar' ? 'إجمالي السعر' : 'Total Price', value: `${stats.totalPrice.toFixed(2)} EGP`, icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
            { label: lang === 'ar' ? 'متوسط السعر' : 'Average Price', value: `${(stats.totalPrice / (stats.total || 1)).toFixed(2)} EGP`, icon: Tag, color: 'from-blue-500 to-cyan-500' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
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
        </div>

        {/* ✅ Search & Filters */}
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
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={lang === 'ar' ? 'بحث بالاسم...' : 'Search by name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="p-5 rounded-2xl border shadow-md bg-white/80 dark:bg-gray-900/60 backdrop-blur-md space-y-6">

                {/* ================= HEADER ================= */}
                <div className="flex items-center justify-between border-b pb-3">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-purple-500" />
                    {lang === 'ar' ? 'الفلاتر' : 'Filters'}
                  </h2>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFilters({
                        subject_id: null,
                        active: '',
                        price: null,
                        discount: null,
                      })
                    }
                    className="text-red-500 hover:text-red-600"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>

                {/* ================= GRID FILTERS ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* 📚 Subject */}
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      {lang === 'ar' ? 'المادة' : 'Subject'}
                    </Label>

                    {/* <AsyncSelect
                      configKey="subjects"
                      value={filters.subject_id}
                      onChange={(id) =>
                        setFilters(prev => ({ ...prev, subject_id: id }))
                      }
                      placeholder={lang === 'ar' ? 'اختر المادة' : 'Select Subject'}
                    /> */}
                    <select
                      className="w-full h-10 rounded-xl border bg-white dark:bg-gray-800 px-3"
                      value={filters.subject_id ?? ''}
                      onChange={(e) =>
                        setFilters(prev => ({
                          ...prev,
                          subject_id: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    >
                      <option value="">
                        {lang === 'ar' ? 'كل المواد' : 'All Subjects'}
                      </option>

                      {subjects.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>
                          {lang === 'ar' ? sub.name_ar : sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ⚡ Status */}
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      {lang === 'ar' ? 'الحالة' : 'Status'}
                    </Label>

                    <select
                      className="w-full h-10 rounded-xl border bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-purple-500"
                      value={filters.active}
                      onChange={(e) =>
                        setFilters(prev => ({
                          ...prev,
                          active: e.target.value,
                        }))
                      }
                    >
                      <option value="">
                        {lang === 'ar' ? 'الكل' : 'All'}
                      </option>
                      <option value="1">   {lang === 'ar' ? 'نشظ' : 'Active'}</option>
                      <option value="0">   {lang === 'ar' ? 'غير نشظ' : 'Inactive'}</option>
                    </select>
                  </div>

                  {/* 💰 Price */}
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      {lang === 'ar' ? 'السعر' : 'Price'}
                    </Label>

                    <Input
                      type="number"
                      value={filters.price ?? ''}
                      onChange={(e) =>
                        setFilters(prev => ({
                          ...prev,
                          price: e.target.value === '' ? null : Number(e.target.value),
                        }))
                      }
                      className="rounded-xl"
                      placeholder="0"
                    />
                  </div>

                  {/* 💸 Discount */}
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      {lang === 'ar' ? 'الخصم' : 'Discount'}
                    </Label>

                    <Input
                      type="number"
                      value={filters.discount ?? ''}
                      onChange={(e) =>
                        setFilters(prev => ({
                          ...prev,
                          discount: e.target.value === '' ? null : Number(e.target.value),
                        }))
                      }
                      className="rounded-xl"
                      placeholder="0"
                    />
                  </div>

                </div>

                {/* ================= ACTION BUTTONS ================= */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t">

                  <Button
                    variant="outline"
                    onClick={() => fetchSemesters(1)}
                    className="rounded-xl"
                  >
                    {lang === 'ar' ? 'تطبيق' : 'Apply'}
                  </Button>

                  <Button
                    onClick={() => fetchSemesters(1)}
                    className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {lang === 'ar' ? 'فلترة' : 'Filter'}
                  </Button>

                </div>

              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Select All */}
        {semesters.length > 0 && (
          <div className="flex items-center justify-end">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === semesters.length && semesters.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
              {lang === 'ar' ? 'اختيار الكل' : 'Select All'}
            </label>
          </div>
        )}

        {/* ✅ Table */}
        <Card className="rounded-2xl overflow-hidden shadow-xl border-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
              <p className="text-muted-foreground mt-4">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : semesters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{lang === 'ar' ? 'لا توجد أتربة' : 'No semesters found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50">
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === semesters.length && semesters.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>{lang === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</TableHead>
                    <TableHead>{lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</TableHead>
                    <TableHead className="text-center">{lang === 'ar' ? 'السعر' : 'Price'}</TableHead>
                    <TableHead className="text-center">{lang === 'ar' ? 'الخصم' : 'Discount'}</TableHead>
                    <TableHead className="text-center">{lang === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead className="text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {semesters.map((semester, idx) => (
                      <motion.tr
                        key={semester.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b hover:bg-muted/30 group"
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(semester.id)}
                            onChange={(e) => handleSelect(semester.id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{semester.name_ar || '—'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{semester.name || '—'}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600">
                            <DollarSign className="h-3 w-3" />
                            {semester.price}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm">
                            {typeof semester.discount === 'string'
                              ? parseFloat(semester.discount).toFixed(2)
                              : Number(semester.discount).toFixed(2)}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const ok = confirm(
                                lang === 'ar'
                                  ? semester.active
                                    ? 'تأكيد إيقاف الترم؟'
                                    : 'تأكيد تفعيل الترم؟'
                                  : semester.active
                                    ? 'Confirm deactivate this semester?'
                                    : 'Confirm activate this semester?'
                              );
                              if (!ok) return;

                              try {
                                await semesterService.toggleActive(semester.id);
                                fetchSemesters(pagination.currentPage);
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            className={
                              semester.active
                                ? 'text-green-600 hover:bg-green-600/10'
                                : 'text-red-500 hover:bg-red-500/10'
                            }
                          >
                            {semester.active ? (
                              <>
                                <CheckCircle className="h-3.5 w-3.5" />
                                {lang === 'ar' ? 'نشط' : 'Active'}
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5" />
                                {lang === 'ar' ? 'غير نشط' : 'Inactive'}
                              </>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
                              onClick={() => openEditModal(semester)}
                            >
                              <Edit2 className="h-4 w-4 text-yellow-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"
                              onClick={() => handleDelete(semester.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* ✅ Pagination */}
        {pagination.lastPage > 1 && (
          <div className="flex items-center justify-center gap-3 py-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={() => goToPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <span className="text-sm">
              {pagination.currentPage} / {pagination.lastPage}
            </span>
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

        {/* ✅ Modal for Create/Edit */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {editingSemester
                  ? (lang === 'ar' ? 'تعديل الترم' : 'Edit Semester')
                  : (lang === 'ar' ? 'إضافة ترم جديد' : 'Add New Semester')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <select
                  className="w-full h-10 rounded-xl border bg-white dark:bg-gray-800 px-3"
                  value={formData.subject_id ?? ''}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      subject_id: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                >
                  <option value="">
                    {lang === 'ar' ? 'كل المواد' : 'All Subjects'}
                  </option>

                  {subjects.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>
                      {lang === 'ar' ? sub.name_ar : sub.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{lang === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder={lang === 'ar' ? 'أدخل اسم الترم بالعربية' : 'Enter semester name in Arabic'}
                  className="rounded-xl mt-1"
                  dir="rtl"
                />
              </div>

              <div>
                <Label>{lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={lang === 'ar' ? 'أدخل اسم الترم بالإنجليزية' : 'Enter semester name in English'}
                  className="rounded-xl mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{lang === 'ar' ? 'السعر' : 'Price'}</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="rounded-xl mt-1"
                  />
                </div>
                <div>
                  <Label>{lang === 'ar' ? 'الخصم (%)' : 'Discount (%)'}</Label>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="rounded-xl mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  onClick={editingSemester ? handleUpdate : handleCreate}
                  disabled={submitting}
                  className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  {editingSemester
                    ? (lang === 'ar' ? 'تحديث' : 'Update')
                    : (lang === 'ar' ? 'إضافة' : 'Create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};