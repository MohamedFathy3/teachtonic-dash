/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/center-hours/CenterHoursPage.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCenterHours } from '@/hooks/useCenterHours';
import { CenterHourModal } from './CenterHourModal';
import { useApp } from '@/contexts/AppContext';
import { Plus, Trash2, Edit, Calendar, Clock, User, FileText, Search, BookOpen, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { AsyncSelect } from '@/components/ui/AsyncSelect';

export const CenterHoursPage: React.FC = () => {
  const { lang } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 🔥 جلب الإعدادات من localStorage
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [filters, setFilters] = useState({
    search: '',
    teacher_id: undefined as number | undefined,
  });

  const { useGetAll, useBulkDelete } = useCenterHours();
  const { data, isLoading, refetch } = useGetAll({
    ...filters,
    perPage: 20,
  });
  const bulkDelete = useBulkDelete();

  // 🔥 تأثير dark mode على الـ body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // 🔥 تصحيح: معرفة شكل البيانات
  useEffect(() => {
    console.log('📊 CenterHours Data:', data);
  }, [data]);

  // 🔥 استخراج البيانات حسب شكل الـ response
  const hours = data?.data?.data || data?.data || [];
  const meta = data?.data?.meta || data?.meta;

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(lang === 'ar' ? `حذف ${selectedIds.length} موعد؟` : `Delete ${selectedIds.length} appointment(s)?`)) {
      await bulkDelete.mutateAsync(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(hours.map((h: any) => h.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {lang === 'ar' ? 'مواعيد السناتر' : 'Center Hours'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {lang === 'ar' ? 'إدارة مواعيد الدروس في السنتر' : 'Manage center lesson appointments'}
            </p>
          </div>
          <div className="flex gap-3">
            {/* Dark Mode Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-700" />
              )}
            </motion.button>

            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-all"
                >
                  <Trash2 size={18} />
                  {lang === 'ar' ? 'حذف' : 'Delete'} ({selectedIds.length})
                </motion.button>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={18} />
              {lang === 'ar' ? 'إضافة موعد' : 'Add Appointment'}
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'بحث بالعنوان...' : 'Search by title...'}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-3 pr-10 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
              />
            </div>
            
            <AsyncSelect
              configKey="teachers"
              value={filters.teacher_id}
              onChange={(id) => setFilters({ ...filters, teacher_id: id || undefined })}
              placeholder={lang === 'ar' ? 'فلتر حسب المعلم' : 'Filter by teacher'}
              clearable
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300"
        >
          {hours.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{lang === 'ar' ? 'لا توجد مواعيد' : 'No appointments found'}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-right w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === hours.length && hours.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                        {lang === 'ar' ? 'العنوان' : 'Title'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                        {lang === 'ar' ? 'التاريخ' : 'Date'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                        {lang === 'ar' ? 'الوقت' : 'Time'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                        {lang === 'ar' ? 'المعلم' : 'Teacher'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                        {lang === 'ar' ? 'ملاحظات' : 'Notes'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                        {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    <AnimatePresence>
                      {hours.map((hour: any, index: number) => (
                        <motion.tr
                          key={hour.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(hour.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds([...selectedIds, hour.id]);
                                } else {
                                  setSelectedIds(selectedIds.filter(id => id !== hour.id));
                                }
                              }}
                              className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <BookOpen size={16} className="text-purple-500 dark:text-purple-400" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">{hour.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Calendar size={14} />
                              <span>
                                {format(new Date(hour.date), 'dd/MM/yyyy', {
                                  locale: lang === 'ar' ? arSA : enUS,
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock size={14} />
                              <span>{hour.hours}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <User size={14} />
                              <span>{hour.teacher?.name || hour.teacher_name || `معلم ID: ${hour.teacher_id}`}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {hour.note && (
                              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                <FileText size={14} />
                                <span className="truncate max-w-[200px]">{hour.note}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(hour)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                              >
                                <Edit size={18} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && meta.total > 0 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {lang === 'ar' ? 'عرض' : 'Showing'} {((meta.current_page - 1) * meta.per_page) + 1} -{' '}
                    {Math.min(meta.current_page * meta.per_page, meta.total)} {lang === 'ar' ? 'من' : 'of'} {meta.total}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => refetch()}
                      disabled={meta.current_page === 1}
                      className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                    >
                      {lang === 'ar' ? 'السابق' : 'Previous'}
                    </button>
                    <button
                      onClick={() => refetch()}
                      disabled={meta.current_page === meta.last_page}
                      className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                    >
                      {lang === 'ar' ? 'التالي' : 'Next'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Modal */}
        <CenterHourModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={() => refetch()}
          editingItem={editingItem}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};