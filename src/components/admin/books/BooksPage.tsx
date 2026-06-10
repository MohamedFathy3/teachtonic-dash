/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/books/BooksPage.tsx

import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooks } from '@/hooks/useBooks';
import { BookModal } from './BookModal';
import { useApp } from '@/contexts/AppContext';
import { Plus, Trash2, Edit, BookOpen, User, DollarSign, FileText, Search, Filter, Power, X, GraduationCap, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useTeacherMeta } from '@/hooks/useTeacherMeta';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export const BooksPage: React.FC = () => {
  const { lang, user } = useApp();
  const { stages } = useTeacherMeta(user?.id);
  const isRTL = lang === 'ar';
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // ✅ فلتر المرحلة - المستوى الأول
  const [filterStageId, setFilterStageId] = useState<number | null>(null);
  const [filterWriter, setFilterWriter] = useState('');
  const [filterActive, setFilterActive] = useState<string>('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  
  const [books, setBooks] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { useBulkDelete, useToggleActive } = useBooks();

  const bulkDelete = useBulkDelete();
  const toggleActive = useToggleActive();

  // Debounce للبحث
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ جلب الكتب مع كل الفلاتر
  const fetchBooks = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      // بناء الفلاتر
      const filters: any = {};
      
      if (debouncedSearch) {
        filters.search = debouncedSearch;
      }
      
      if (user?.id) {
        filters.teacher_id = user.id;
      }
      
      if (filterWriter) {
        filters.writer = filterWriter;
      }
      
      if (filterActive === 'active') {
        filters.active = true;
      } else if (filterActive === 'inactive') {
        filters.active = false;
      }
      
      if (filterPrice) {
        filters.price = Number(filterPrice);
      }
      
      if (filterFromDate) {
        filters.from_date = filterFromDate;
      }
      
      if (filterToDate) {
        filters.to_date = filterToDate;
      }
      
      // 🔥 الفلتر المهم - المرحلة
      if (filterStageId) {
        filters.stage_id = filterStageId;
      }
      
      console.log('📚 Sending filters to API:', filters);
      
      const response = await api.post('/book/index', {
        filters: filters,
        orderBy: 'created_at',
        orderByDirection: 'desc',
        perPage: 20,
        page: page,
        paginate: true,
      });
      
      console.log('📚 Response:', response.data);
      
      setBooks(response.data?.data || []);
      setMeta(response.data?.meta || null);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل الكتب' : 'Error loading books');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, user?.id, filterWriter, filterActive, filterPrice, filterFromDate, filterToDate, filterStageId, lang]);

  // جلب الكتب عند تغيير الفلاتر
  useEffect(() => {
    fetchBooks(1);
  }, [fetchBooks]);

  // حذف الكتب المحددة
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(lang === 'ar' ? `حذف ${selectedIds.length} كتاب؟` : `Delete ${selectedIds.length} book(s)?`)) {
      await bulkDelete.mutateAsync(selectedIds);
      setSelectedIds([]);
      toast.success(lang === 'ar' ? 'تم حذف الكتب بنجاح' : 'Books deleted successfully');
      fetchBooks(currentPage);
    }
  };

  // تعديل كتاب
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // تبديل حالة الكتاب
  const handleToggleActive = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleActive.mutateAsync(id);
    await fetchBooks(currentPage);
  };

  // اختيار كتاب
  const handleSelectBook = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // اختيار الكل
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(books.map((b: any) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  // إعادة تعيين الفلاتر
  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setFilterStageId(null);
    setFilterWriter('');
    setFilterActive('');
    setFilterPrice('');
    setFilterFromDate('');
    setFilterToDate('');
    setShowFilters(false);
  };

  // تطبيق الفلاتر
  const applyFilters = () => {
    fetchBooks(1);
    setShowFilters(false);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= (meta?.last_page || 1)) {
      fetchBooks(page);
      setSelectedIds([]);
    }
  };

  if (isLoading && books.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="p-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 text-center bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 border-0 shadow-sm hover:shadow-md transition-all">
              <BookOpen className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{meta?.total || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'إجمالي الكتب' : 'Total Books'}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 text-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 border-0 shadow-sm hover:shadow-md transition-all">
              <User className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {books.filter((b: any) => b.active === 1).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'كتب نشطة' : 'Active Books'}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 text-center bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/5 dark:to-amber-500/5 border-0 shadow-sm hover:shadow-md transition-all">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {books.reduce((sum: number, b: any) => sum + parseFloat(b.price), 0).toFixed(2)} EGP
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'إجمالي القيمة' : 'Total Value'}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="p-4 text-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 border-0 shadow-sm hover:shadow-md transition-all">
              <GraduationCap className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stages?.length || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'المراحل' : 'Stages'}</p>
            </Card>
          </motion.div>
        </div>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {lang === 'ar' ? 'الكتب' : 'Books'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {lang === 'ar' ? 'إدارة وتنظيم الكتب' : 'Manage and organize books'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">

            {/* Bulk Delete Button */}
            {selectedIds.length > 0 && (
              <Button
                onClick={handleDeleteSelected}
                variant="destructive"
                className="gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Trash2 size={18} />
                {lang === 'ar' ? `حذف (${selectedIds.length})` : `Delete (${selectedIds.length})`}
              </Button>
            )}

            <ExportExcelButton
              data={books}
              fileName="books-list"
              label={lang === 'ar' ? 'تصدير' : 'Export'}
              disabled={isLoading || books.length === 0}
            />

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث عن كتاب...' : 'Search books...'}
                className="pl-9 pr-8 rounded-xl w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-xl ${showFilters ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
              title={lang === 'ar' ? 'بحث متقدم' : 'Advanced Search'}
            >
              <Filter size={18} />
            </Button>

            {/* Add Book Button */}
            <Button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              {lang === 'ar' ? 'إضافة كتاب' : 'Add Book'}
            </Button>
          </div>
        </div>

        {/* Filters Panel - متسلسل */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* 🔹 Stage (المرحلة) - المستوى الأول */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      {lang === 'ar' ? 'المرحلة' : 'Stage'}
                    </Label>
                    <select
                      value={filterStageId || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFilterStageId(value ? Number(value) : null);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    >
                      <option value="">
                        {lang === 'ar' ? 'جميع المراحل' : 'All Stages'}
                      </option>
                      {stages?.map((stage: any) => (
                        <option key={stage.id} value={stage.id}>
                          {isRTL ? stage.name_ar : stage.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 🔹 المؤلف */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <User className="h-4 w-4 text-primary" />
                      {lang === 'ar' ? 'المؤلف' : 'Writer'}
                    </Label>
                    <Input
                      value={filterWriter}
                      onChange={(e) => setFilterWriter(e.target.value)}
                      placeholder={lang === 'ar' ? 'اسم المؤلف' : 'Author name'}
                      className="rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  {/* 🔹 الحالة */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <Power className="h-4 w-4 text-primary" />
                      {lang === 'ar' ? 'الحالة' : 'Status'}
                    </Label>
                    <select
                      value={filterActive}
                      onChange={(e) => setFilterActive(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    >
                      <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                      <option value="active">✅ {lang === 'ar' ? 'نشط' : 'Active'}</option>
                      <option value="inactive">❌ {lang === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                    </select>
                  </div>

                  {/* 🔹 السعر */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      {lang === 'ar' ? 'السعر' : 'Price'}
                    </Label>
                    <Input
                      type="number"
                      value={filterPrice}
                      onChange={(e) => setFilterPrice(e.target.value)}
                      placeholder={lang === 'ar' ? 'السعر' : 'Price'}
                      className="rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  {/* 🔹 من تاريخ */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <FileText className="h-4 w-4 text-primary" />
                      {lang === 'ar' ? 'من تاريخ' : 'From Date'}
                    </Label>
                    <Input
                      type="date"
                      value={filterFromDate}
                      onChange={(e) => setFilterFromDate(e.target.value)}
                      className="rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  {/* 🔹 إلى تاريخ */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <FileText className="h-4 w-4 text-primary" />
                      {lang === 'ar' ? 'إلى تاريخ' : 'To Date'}
                    </Label>
                    <Input
                      type="date"
                      value={filterToDate}
                      onChange={(e) => setFilterToDate(e.target.value)}
                      className="rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>

                {/* 🔹 Actions */}
                <div className="flex justify-end gap-3 mt-5 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
                  </Button>
                  <Button size="sm" onClick={applyFilters} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl">
                    <Search className="h-4 w-4" />
                    {lang === 'ar' ? 'تطبيق' : 'Apply'}
                  </Button>
                </div>

                {/* عرض الفلاتر النشطة */}
                {(filterStageId || filterWriter || filterActive || filterPrice || filterFromDate || filterToDate) && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'الفلاتر النشطة:' : 'Active Filters:'}</span>
                    {filterStageId && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {stages?.find(s => s.id === filterStageId)?.name || filterStageId}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStageId(null)} />
                      </Badge>
                    )}
                    {filterWriter && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <User className="h-3 w-3" />
                        {filterWriter}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterWriter('')} />
                      </Badge>
                    )}
                    {filterActive && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        {filterActive === 'active' ? '✅ نشط' : '❌ غير نشط'}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterActive('')} />
                      </Badge>
                    )}
                    {filterPrice && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        💰 {filterPrice}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterPrice('')} />
                      </Badge>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Select All Checkbox */}
        {books.length > 0 && (
          <div className="flex items-center justify-end mb-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.length === books.length && books.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              {lang === 'ar' ? 'اختر الكل' : 'Select All'}
            </label>
          </div>
        )}

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {books.map((book: any, index: number) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card 
                  onClick={() => navigate(`/instructor/books/${book.id}`)}
                className="overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300 dark:bg-gray-800 cursor-pointer border border-gray-100 dark:border-gray-700">
                  {/* Book Cover */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600">
                    {book.image?.fullUrl ? (
                      <img
                        src={book.image.fullUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white/40" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge variant={book.active === 1 ? "default" : "secondary"} className="gap-1 backdrop-blur-sm bg-black/50 border-none">
                        {book.active === 1 ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                        {book.active === 1 ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-lg bg-black/60 hover:bg-black/80 border-none"
                        onClick={(e) => handleToggleActive(book.id, e)}
                      >
                        <Power size={14} className="text-white" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-lg bg-black/60 hover:bg-black/80 border-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(book);
                        }}
                      >
                        <Edit size={14} className="text-white" />
                      </Button>
                    </div>

                    {/* Checkbox */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <div className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(book.id)}
                          onChange={(e) => handleSelectBook(book.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-white/30 bg-white/20 checked:bg-blue-500 checked:border-blue-500"
                        />
                        <span className="text-xs text-white/80">{lang === 'ar' ? 'تحديد' : 'Select'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1 dark:text-white">
                      {book.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <User size={14} />
                      <span className="line-clamp-1">{book.writer}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <FileText size={14} />
                        <span>{book.pages_count} {lang === 'ar' ? 'صفحة' : 'pages'}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
                        <span>{parseFloat(book.price).toFixed(2)} EGP</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(book.createdAt), 'dd/MM/yyyy', {
                          locale: lang === 'ar' ? arSA : enUS,
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {books.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <BookOpen size={48} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {lang === 'ar' ? 'لا توجد كتب' : 'No books found'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {lang === 'ar' ? 'ابدأ بإضافة أول كتاب الآن' : 'Start by adding your first book'}
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="mt-4 gap-2 rounded-xl"
            >
              <Plus size={18} />
              {lang === 'ar' ? 'أضف أول كتاب' : 'Add First Book'}
            </Button>
          </motion.div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <span className="text-sm">
              {currentPage} / {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === meta.last_page}
            >
              <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        )}

        {/* Book Modal */}
        <BookModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            fetchBooks(currentPage);
            setSelectedIds([]);
          }}
          editingItem={editingItem}
          isDarkMode={document.documentElement.classList.contains('dark')}
        />
      </div>
    </div>
  );
};