/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/books/BooksPage.tsx

import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooks } from '@/hooks/useBooks';
import { BookModal } from './BookModal';
import { useApp } from '@/contexts/AppContext';
import { Plus, Trash2, Edit, BookOpen, User, DollarSign, FileText, Moon, Sun, Search, Filter, Power, Eye, X } from 'lucide-react';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export const BooksPage: React.FC = () => {
  const { lang, isInstructor, user } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    writer: '',
    active: undefined as boolean | undefined,
    price: '',
    from_date: '',
    to_date: '',
  });
  
  const { useGetAll, useBulkDelete, useToggleActive } = useBooks();
  const { data, isLoading, refetch } = useGetAll({
    search: debouncedSearch,
    teacher_id: isInstructor ? user?.id : undefined,
    writer: filters.writer || undefined,
    active: filters.active,
    price: filters.price ? Number(filters.price) : undefined,
    from_date: filters.from_date || undefined,
    to_date: filters.to_date || undefined,
    perPage: 20,
  });

  const bulkDelete = useBulkDelete();
  const toggleActive = useToggleActive();

  // Debounce للبحث
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const books = data?.data || [];
  const meta = data?.meta;

  // حذف الكتب المحددة
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(lang === 'ar' ? `حذف ${selectedIds.length} كتاب؟` : `Delete ${selectedIds.length} book(s)?`)) {
      await bulkDelete.mutateAsync(selectedIds);
      setSelectedIds([]);
      toast.success(lang === 'ar' ? 'تم حذف الكتب بنجاح' : 'Books deleted successfully');
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
    await refetch();
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

  // إعادة تعيين الفلتر
  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setFilters({
      search: '',
      writer: '',
      active: undefined,
      price: '',
      from_date: '',
      to_date: '',
    });
  };

  if (isLoading) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
              <DollarSign className="h-8 w-8 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {books.reduce((sum: number, b: any) => sum + parseFloat(b.price), 0).toFixed(2)} EGP
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'إجمالي القيمة' : 'Total Value'}</p>
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
                  onClick={clearSearch}
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

        {/* Filters Panel */}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Writer */}
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-2">
                      {lang === 'ar' ? 'المؤلف' : 'Writer'}
                    </label>
                    <Input
                      value={filters.writer}
                      onChange={(e) => setFilters(prev => ({ ...prev, writer: e.target.value }))}
                      placeholder={lang === 'ar' ? 'اسم المؤلف' : 'Author name'}
                      className="rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  {/* Active Status */}
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-2">
                      {lang === 'ar' ? 'الحالة' : 'Status'}
                    </label>
                    <select
                      value={filters.active === undefined ? '' : filters.active ? '1' : '0'}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        active: e.target.value === '' ? undefined : e.target.value === '1',
                      }))}
                      className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                      <option value="1">{lang === 'ar' ? 'نشط' : 'Active'}</option>
                      <option value="0">{lang === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-2">
                      {lang === 'ar' ? 'السعر' : 'Price'}
                    </label>
                    <Input
                      type="number"
                      value={filters.price}
                      onChange={(e) => setFilters(prev => ({ ...prev, price: e.target.value }))}
                      placeholder={lang === 'ar' ? 'السعر' : 'Price'}
                      className="rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  {/* From Date */}
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-2">
                      {lang === 'ar' ? 'من تاريخ' : 'From Date'}
                    </label>
                    <Input
                      type="date"
                      value={filters.from_date}
                      onChange={(e) => setFilters(prev => ({ ...prev, from_date: e.target.value }))}
                      className="rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  {/* To Date */}
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300 block mb-2">
                      {lang === 'ar' ? 'إلى تاريخ' : 'To Date'}
                    </label>
                    <Input
                      type="date"
                      value={filters.to_date}
                      onChange={(e) => setFilters(prev => ({ ...prev, to_date: e.target.value }))}
                      className="rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={clearSearch}
                    className="rounded-xl"
                  >
                    {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
                  >
                    {lang === 'ar' ? 'تطبيق' : 'Apply'}
                  </Button>
                </div>
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
                <Card className="overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300 dark:bg-gray-800 cursor-pointer border border-gray-100 dark:border-gray-700">
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
                        <DollarSign size={14} />
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

        {/* Pagination Info */}
        {meta && meta.total > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {lang === 'ar' ? 'عرض' : 'Showing'} {books.length} {lang === 'ar' ? 'من' : 'of'} {meta.total} {lang === 'ar' ? 'كتاب' : 'books'}
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
            refetch();
            setSelectedIds([]);
          }}
          editingItem={editingItem}
          isDarkMode={document.documentElement.classList.contains('dark')}
        />
      </div>
    </div>
  );
};