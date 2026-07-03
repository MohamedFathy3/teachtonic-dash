/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/SemestersPage.tsx

import { useTeacherMeta } from '@/hooks/useTeacherMeta';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { semesterService, Semester, SemesterFormData, SemesterFilters } from '@/services/semester.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUploader from '@/components/FileUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Link, useNavigate } from 'react-router-dom';
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
  Image as ImageIcon,
  Gift,
  Percent,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast  } from "@/hooks/use-toast";

export const SemestersPage: React.FC = () => {
  const { lang, user } = useApp();
  const teacherId = user?.id;
  const isRTL = lang === 'ar';
const navigate = useNavigate();

  const { subjects, offers } = useTeacherMeta(teacherId);

  // State
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [offersList, setOffersList] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<SemesterFilters>({
    subject_id: null,
    teacher_id: user?.id || null,
    active: '',
    price: null,
    discount: null,
    from_date: '',
    to_date: '',
    has_image: '',
    offer_id: null,
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [fetchingSemester, setFetchingSemester] = useState(false);
  const [formData, setFormData] = useState<SemesterFormData>({
    name: '',
    name_ar: '',
    price: 0,
    discount: 0,
    teacher_id: user?.id || 1,
    subject_id: null,
    image: null,
    offer_id: null,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch offers directly
  useEffect(() => {
    const fetchOffersDirect = async () => {
      if (!teacherId) return;
      setLoadingOffers(true);
      try {
        const response = await semesterService.getOffersForSelect(teacherId);
        setOffersList(response);
      } catch (error) {
        console.error('Error fetching offers directly:', error);
      } finally {
        setLoadingOffers(false);
      }
    };
    
    fetchOffersDirect();
  }, [teacherId]);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // Ref to prevent multiple API calls
  const fetchedRef = useRef(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch semesters
  const fetchSemesters = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await semesterService.getAllSemesters(
        filters as Record<string, any>,
        pagination.perPage,
        page,
        debouncedSearch,
        teacherId,
        lang
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
      toast.error(err.message || 'Failed to fetch semesters');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.perPage, filters, teacherId, lang]);

  // Initial fetch
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchSemesters(1);
    }
  }, [fetchSemesters]);

  // Handle search change
  useEffect(() => {
    fetchSemesters(1);
  }, [debouncedSearch, fetchSemesters]);

  // Handlers
  const handleCreate = async () => {
    if (!formData.name || !formData.name_ar) {
      toast.error(isRTL ? 'الاسم مطلوب' : 'Name is required');
      return;
    }
    
    setSubmitting(true);
    try {
      await semesterService.createSemester(formData);
      toast.success(isRTL ? 'تم إضافة الترم بنجاح' : 'Semester created successfully');
      setShowModal(false);
      resetForm();
      fetchSemesters(1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isRTL ? 'فشل في إضافة الترم' : 'Failed to create semester'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingSemester) return;
    if (!formData.name || !formData.name_ar) {
      toast.error(isRTL ? 'الاسم مطلوب' : 'Name is required');
      return;
    }
    
    setSubmitting(true);
    try {
      await semesterService.updateSemester(editingSemester.id, formData);
      toast.success(isRTL ? 'تم تحديث الترم بنجاح' : 'Semester updated successfully');
      setShowModal(false);
      setTimeout(() => {
        resetForm();
      }, 300);
      await fetchSemesters(pagination.currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isRTL ? 'فشل في تحديث الترم' : 'Failed to update semester'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا الترم؟' : 'Are you sure you want to delete this semester?')) {
      try {
        await semesterService.deleteSemester(id);
        toast.success(isRTL ? 'تم حذف الترم بنجاح' : 'Semester deleted successfully');
        fetchSemesters(pagination.currentPage);
      } catch (error: any) {
        toast.error(error.response?.data?.message || (isRTL ? 'فشل في حذف الترم' : 'Failed to delete semester'));
      }
    }
  };

  const handleToggleActive = async (semester: Semester) => {
    try {
      await semesterService.toggleActiveStatus(semester.id);
      toast.success(isRTL ? 'تم تغيير حالة الترم' : 'Semester status updated');
      fetchSemesters(pagination.currentPage);
    } catch (error) {
      console.error(error);
      toast.error(isRTL ? 'فشل في تغيير الحالة' : 'Failed to update status');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(isRTL ? `حذف ${selectedIds.size} ترم؟` : `Delete ${selectedIds.size} semesters?`)) {
      try {
        await semesterService.bulkDeleteSemesters(Array.from(selectedIds));
        toast.success(isRTL ? `تم حذف ${selectedIds.size} ترم بنجاح` : `${selectedIds.size} semesters deleted successfully`);
        setSelectedIds(new Set());
        fetchSemesters(1);
      } catch (error: any) {
        toast.error(error.response?.data?.message || (isRTL ? 'فشل في حذف الترمات' : 'Failed to delete semesters'));
      }
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

  const openEditModal = useCallback(async (semester: Semester) => {
    setFetchingSemester(true);
    try {
      const fullSemester = await semesterService.getSemester(semester.id);
      setCurrentSemester(fullSemester);
      
      setFormData({
        name: fullSemester.name,
        name_ar: fullSemester.name_ar || '',
        price: parseFloat(fullSemester.price),
        discount: parseFloat(fullSemester.discount),
        teacher_id: fullSemester.teacher_id,
        subject_id: fullSemester.subject_id,
        image: fullSemester.image,
        offer_id: fullSemester.offer_id || null,
      });
      setEditingSemester(semester);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to fetch semester:', error);
      toast.error(isRTL ? 'فشل في جلب بيانات الترم' : 'Failed to fetch semester data');
    } finally {
      setFetchingSemester(false);
    }
  }, [isRTL]);

  const openCreateModal = useCallback(() => {
    setCurrentSemester(null);
    setEditingSemester(null);
    setFormData({
      name: '',
      name_ar: '',
      price: 0,
      discount: 0,
      teacher_id: user?.id || 1,
      subject_id: null,
      image: null,
      offer_id: null,
    });
    setShowModal(true);
  }, [user?.id]);

  const resetForm = () => {
    setEditingSemester(null);
    setCurrentSemester(null);
    setFormData({
      name: '',
      name_ar: '',
      price: 0,
      discount: 0,
      teacher_id: user?.id || 1,
      subject_id: null,
      image: null,
      offer_id: null,
    });
  };

  const handleRemoveImage = useCallback(() => {
    setFormData(prev => ({ ...prev, image: null }));
  }, []);

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

  const applyFilters = () => {
    fetchSemesters(1);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      subject_id: null,
      teacher_id: user?.id || null,
      active: '',
      price: null,
      discount: null,
      from_date: '',
      to_date: '',
      has_image: '',
      offer_id: null,
    });
    fetchSemesters(1);
  };

  // Stats
  const stats = {
    total: pagination.total,
    active: semesters.filter(s => s.active).length,
    inactive: semesters.filter(s => !s.active).length,
    totalPrice: semesters.reduce((sum, s) => sum + parseFloat(s.price), 0),
  };

  // الحصول على اسم العرض من الـ ID
  const getOfferName = (offerId: number | null) => {
    if (!offerId) return null;
    const offer = offers?.find((o: any) => o.id === offerId);
    if (!offer) return null;
    return isRTL ? offer.title_ar || offer.title : offer.title;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* Header */}
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
                {isRTL ? 'الترم الدراسي' : 'Semesters'}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Tag className="h-3 w-3" />
                {stats.total} {isRTL ? 'ترم' : 'semesters'} • {stats.totalPrice.toFixed(2)} {isRTL ? 'جنيه' : 'EGP'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <ExportExcelButton
              data={semesters}
              fileName="semesters-list"
              label={isRTL ? 'تصدير' : 'Export'}
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
                {isRTL ? 'حذف' : 'Delete'} ({selectedIds.size})
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4" />
              {isRTL ? 'إضافة ترم' : 'Add Semester'}
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: isRTL ? 'إجمالي الترمات' : 'Total Semesters', value: stats.total, icon: Calendar, color: 'from-purple-500 to-pink-500' },
            { label: isRTL ? 'الترمات النشطة' : 'Active Semesters', value: stats.active, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
            { label: isRTL ? 'الترمات الغير نشطة' : 'Inactive Semesters', value: stats.inactive, icon: XCircle, color: 'from-red-500 to-rose-500' },
            { label: isRTL ? 'إجمالي السعر' : 'Total Price', value: `${stats.totalPrice.toFixed(2)} ${isRTL ? 'جنيه' : 'EGP'}`, icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
            { label: isRTL ? 'متوسط السعر' : 'Average Price', value: `${(stats.totalPrice / (stats.total || 1)).toFixed(2)} ${isRTL ? 'جنيه' : 'EGP'}`, icon: Tag, color: 'from-blue-500 to-cyan-500' },
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

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 rounded-xl"
            >
              <Filter className="h-4 w-4" />
              {isRTL ? 'فلاتر' : 'Filters'}
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isRTL ? 'بحث بالاسم العربي...' : 'Search by English name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
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
              <Card className="p-5 rounded-2xl border shadow-md bg-white/80 dark:bg-gray-900/60 backdrop-blur-md space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-purple-500" />
                    {isRTL ? 'الفلاتر' : 'Filters'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-red-500 hover:text-red-600"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {isRTL ? 'إعادة تعيين' : 'Reset'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      {isRTL ? 'المادة' : 'Subject'}
                    </Label>
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
                        {isRTL ? 'كل المواد' : 'All Subjects'}
                      </option>
                      {subjects?.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>
                          {isRTL ? sub.name_ar : sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      {isRTL ? 'الحالة' : 'Status'}
                    </Label>
                    <select
                      className="w-full h-10 rounded-xl border bg-white dark:bg-gray-800 px-3"
                      value={filters.active}
                      onChange={(e) =>
                        setFilters(prev => ({
                          ...prev,
                          active: e.target.value,
                        }))
                      }
                    >
                      <option value="">{isRTL ? 'الكل' : 'All'}</option>
                      <option value="1">{isRTL ? 'نشط' : 'Active'}</option>
                      <option value="0">{isRTL ? 'غير نشط' : 'Inactive'}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      {isRTL ? 'السعر' : 'Price'}
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

                  {/* فلتر العرض */}
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Gift className="h-3 w-3" />
                      {isRTL ? 'عرض خصم' : 'Offer'}
                    </Label>
                    <select
                      className="w-full h-10 rounded-xl border bg-white dark:bg-gray-800 px-3"
                      value={filters.offer_id ?? ''}
                      onChange={(e) =>
                        setFilters(prev => ({
                          ...prev,
                          offer_id: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    >
                      <option value="">
                        {isRTL ? 'كل العروض' : 'All Offers'}
                      </option>
                      {offersList.map((offer: any) => (
                        <option key={offer.id} value={offer.id}>
                          {isRTL ? (offer.title_ar || offer.title) : offer.title} - {offer.offer_discount}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t">
                  <Button variant="outline" onClick={applyFilters} className="rounded-xl">
                    {isRTL ? 'تطبيق' : 'Apply'}
                  </Button>
                  <Button onClick={applyFilters} className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {isRTL ? 'فلترة' : 'Filter'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Select All */}
        {semesters.length > 0 && (
          <div className="flex items-center justify-end">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === semesters.length && semesters.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              {isRTL ? 'اختيار الكل' : 'Select All'}
            </label>
          </div>
        )}

        {/* Table */}
        <Card className="rounded-2xl overflow-hidden shadow-xl border-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
              <p className="text-muted-foreground mt-4">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : semesters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{isRTL ? 'لا توجد ترمات' : 'No semesters found'}</p>
              <Button
                onClick={openCreateModal}
                variant="outline"
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                {isRTL ? 'أضف أول ترم' : 'Add First Semester'}
              </Button>
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
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </TableHead>
                    <TableHead>{isRTL ? 'الصورة' : 'Image'}</TableHead>
                    <TableHead>{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</TableHead>
                    <TableHead>{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</TableHead>
                    <TableHead className="text-center">{isRTL ? 'السعر' : 'Price'}</TableHead>
                    <TableHead className="text-center">{isRTL ? 'الخصم' : 'Discount'}</TableHead>
                    <TableHead className="text-center">{isRTL ? 'العرض' : 'Offer'}</TableHead>
                    <TableHead className="text-center">{isRTL ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead className="text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
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
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                        </TableCell>
                        <TableCell
                      >
                          {semester.imageUrl ? (
                            <img
                              src={semester.imageUrl}
                              alt={semester.name}
                              className="w-10 h-10 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{semester.name_ar || '—'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{semester.name || '—'}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600">
                            {parseFloat(semester.price).toFixed(2)} {isRTL ? 'جنيه' : 'EGP'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm">
                            {parseFloat(semester.discount).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {semester.offer_id ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">
                              <Percent className="h-3 w-3" />
                              {getOfferName(semester.offer_id)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={semester.active}
                                onCheckedChange={() => handleToggleActive(semester)}
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                              />
                              <span className={`text-sm ${semester.active ? 'text-green-600' : 'text-red-500'}`}>
                                {semester.active 
                                  ? (isRTL ? 'نشط' : 'Active')
                                  : (isRTL ? 'غير نشط' : 'Inactive')}
                              </span>
                            </div>
                          </div>
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
                               <Link 
          to={`/instructor/semesters/${semester.id}`}
          className="font-medium hover:text-primary transition-colors hover:underline"
          onClick={(e) => e.stopPropagation()} // ✅ منع انتشار الضغط
        >
        <Eye className="h-4 w-4 mt-2 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
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

        {/* Pagination */}
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

        {/* Modal for Create/Edit */}
        <Dialog open={showModal} onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
          setShowModal(open);
        }}>
          <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {editingSemester
                  ? (isRTL ? 'تعديل الترم' : 'Edit Semester')
                  : (isRTL ? 'إضافة ترم جديد' : 'Add New Semester')}
              </DialogTitle>
            </DialogHeader>

            {fetchingSemester ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="ml-2">{isRTL ? 'جاري تحميل البيانات...' : 'Loading data...'}</span>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                editingSemester ? handleUpdate() : handleCreate();
              }} className="space-y-4 mt-4">
                {/* File Uploader */}
                <FileUploader
                  label={isRTL ? 'صورة الترم' : 'Semester Image'}
                  onUploadSuccess={(fileId) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      image: fileId
                    }));
                  }}
                  multiple={false}
                  accept="image/*"
                  maxFiles={1}
                  defaultImageUrl={currentSemester?.imageUrl}
                  onRemoveImage={handleRemoveImage}
                />

                {/* Subject Select */}
                <div>
                  <Label>{isRTL ? 'المادة' : 'Subject'}</Label>
                  <select
                    className="w-full h-10 rounded-xl border bg-white dark:bg-gray-800 px-3 mt-1"
                    value={formData.subject_id ?? ''}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        subject_id: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    required
                  >
                    <option value="">
                      {isRTL ? 'اختر المادة' : 'Select Subject'}
                    </option>
                    {subjects?.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {isRTL ? sub.name_ar : sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Arabic Name */}
                <div>
                  <Label>{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    placeholder={isRTL ? 'أدخل اسم الترم بالعربية' : 'Enter semester name in Arabic'}
                    className="rounded-xl mt-1"
                    dir="rtl"
                    required
                  />
                </div>

                {/* English Name */}
                <div>
                  <Label>{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isRTL ? 'أدخل اسم الترم بالإنجليزية' : 'Enter semester name in English'}
                    className="rounded-xl mt-1"
                    required
                  />
                </div>

                {/* Price & Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{isRTL ? 'السعر' : 'Price'}</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="rounded-xl mt-1"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
               
                </div>

                {/* Offer Select - حقل العرض */}
                <div>
                  <Label className="flex items-center gap-1">
                    <Gift className="h-4 w-4 text-orange-500" />
                    {isRTL ? 'عرض خصم' : 'Discount Offer'}
                  </Label>
                  <select
                    className="w-full h-10 rounded-xl border bg-white dark:bg-gray-800 px-3 mt-1"
                    value={formData.offer_id ?? ''}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        offer_id: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                  >
                    <option value="">
                      {isRTL ? 'بدون عرض' : 'No Offer'}
                    </option>
                    {offersList.map((offer: any) => (
                      <option key={offer.id} value={offer.id}>
                        {isRTL ? (offer.title_ar || offer.title) : offer.title} - {offer.offer_discount}
                      </option>
                    ))}
                  </select>
                  <p className={`text-xs mt-1 ${isRTL ? 'text-right' : 'text-left'} text-muted-foreground`}>
                    {isRTL 
                      ? 'اختر عرض خصم لتطبيقه على هذا الترم'
                      : 'Select a discount offer to apply to this semester'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetForm();
                      setShowModal(false);
                    }} 
                    className="flex-1 rounded-xl"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  >
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    {editingSemester
                      ? (isRTL ? 'تحديث' : 'Update')
                      : (isRTL ? 'إضافة' : 'Create')}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SemestersPage;