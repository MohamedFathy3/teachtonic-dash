/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/center-hours/CenterHoursPage.tsx

import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCenterHours } from '@/hooks/useCenterHours';
import { CenterHourModal } from './CenterHourModal';
import { useApp } from '@/contexts/AppContext';
import { Plus, Trash2, Edit, Calendar, Clock, User, FileText, Search, BookOpen, Moon, Sun, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const CenterHoursPage: React.FC = () => {
  const { lang } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
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

  // استخراج البيانات
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

  const clearSearch = () => {
    setFilters({ search: '', teacher_id: undefined });
    setShowFilters(false);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="p-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 text-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 border-0 shadow-sm hover:shadow-md transition-all">
              <Calendar className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{meta?.total || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'إجمالي المواعيد' : 'Total Appointments'}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 text-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 border-0 shadow-sm hover:shadow-md transition-all">
              <Clock className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {hours.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'هذا الشهر' : 'This Month'}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 text-center bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/5 dark:to-amber-500/5 border-0 shadow-sm hover:shadow-md transition-all">
              <User className="h-8 w-8 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(hours.map((h: any) => h.teacher_id)).size}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'معلمين' : 'Teachers'}</p>
            </Card>
          </motion.div>
        </div>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {lang === 'ar' ? 'مواعيد السناتر' : 'Center Hours'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {lang === 'ar' ? 'إدارة مواعيد الدروس في السنتر' : 'Manage center lesson appointments'}
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

            {/* Export Button */}
            <ExportExcelButton
              data={hours}
              fileName="center-hours"
              label={lang === 'ar' ? 'تصدير' : 'Export'}
              disabled={isLoading || hours.length === 0}
            />

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                className="pl-9 pr-8 rounded-xl w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Add Button */}
            <Button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              {lang === 'ar' ? 'إضافة موعد' : 'Add Appointment'}
            </Button>
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300"
        >
          {hours.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Calendar size={48} className="text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {lang === 'ar' ? 'لا توجد مواعيد' : 'No appointments found'}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {lang === 'ar' ? 'ابدأ بإضافة أول موعد الآن' : 'Start by adding your first appointment'}
              </p>
              <Button
                onClick={() => {
                  setEditingItem(null);
                  setIsModalOpen(true);
                }}
                variant="outline"
                className="mt-4 gap-2 rounded-xl"
              >
                <Plus size={18} />
                {lang === 'ar' ? 'أضف أول موعد' : 'Add First Appointment'}
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50">
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
                        {lang === 'ar' ? 'اليوم' : 'Day'}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                        {lang === 'ar' ? 'الوقت' : 'Time'}
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
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(hour.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds([...selectedIds, hour.id]);
                                } else {
                                  setSelectedIds(selectedIds.filter((id) => id !== hour.id));
                                }
                              }}
                              className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                            />
                          </td>

                          {/* Title */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <BookOpen size={16} className="text-purple-500 dark:text-purple-400" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {hour.title}
                              </span>
                            </div>
                          </td>

                          {/* Day */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Calendar size={14} />
                              <span>{hour.date}</span>
                            </div>
                          </td>

                          {/* Time */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock size={14} />
                              <span>{hour.hours_start} - {hour.hours_end}</span>
                            </div>
                          </td>

                          {/* Notes */}
                          <td className="px-4 py-3">
                            {hour.note ? (
                              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                <FileText size={14} />
                                <span className="truncate max-w-[200px]">{hour.note}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(hour)}
                                className="h-8 w-8 p-0 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                              >
                                <Edit size={16} />
                              </Button>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      disabled={meta.current_page === 1}
                      className="rounded-lg"
                    >
                      {lang === 'ar' ? 'السابق' : 'Previous'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      disabled={meta.current_page === meta.last_page}
                      className="rounded-lg"
                    >
                      {lang === 'ar' ? 'التالي' : 'Next'}
                    </Button>
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
          isDarkMode={document.documentElement.classList.contains('dark')}
        />
      </div>
    </div>
  );
};