/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/payment-codes/PaymentCodesTable.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { usePaymentCodes } from '@/hooks/usePaymentCodes';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { useApp } from '@/contexts/AppContext';
import { 
  Check, Copy, Trash2, Search, X, Filter, 
  Wifi, Building, User, GraduationCap, Calendar,
  ChevronDown, ChevronUp, Eye, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentCodesTableProps {
  type?: 'all' | 'used' | 'unused';
  searchQuery?: string;
  typeFilter?: string;
  statusFilter?: boolean | undefined;
  onRefresh?: () => void;
}

interface ExtendedCodeItem {
  id: number;
  code: string;
  type: string;
  type_code: 'online' | 'center';
  amount: string | number;
  course_id: number | null;
  semester_id: number | null;
  course_detail_id: number | null;
  teacher_id: number;
  student_id: number | null;
  student_name?: string;
  teacher_name?: string;
  is_used: number;
  used_at: string | null;
  expires_at: string | null;
  active: number;
  created_at: string;
  updated_at: string;
}

export const PaymentCodesTable: React.FC<PaymentCodesTableProps> = ({ 
  type = 'all',
  searchQuery: externalSearchQuery = '',
  typeFilter: externalTypeFilter = '',
  statusFilter: externalStatusFilter = undefined,
  onRefresh 
}) => {
  const { lang } = useApp();
  const [selectedCodes, setSelectedCodes] = useState<number[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // فلترات متقدمة محلية
  const [localSearchQuery, setLocalSearchQuery] = useState(externalSearchQuery);
  const [studentFilter, setStudentFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [typeCodeFilter, setTypeCodeFilter] = useState<'all' | 'online' | 'center'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const { useGetAllCodes, useDeleteCodes } = usePaymentCodes();
  const deleteCodes = useDeleteCodes();
  
  // جلب البيانات
  const { data, isLoading, refetch } = useGetAllCodes({
    search: localSearchQuery,
    perPage: 1000,
  });
  
  // استخراج الكودات من الشكل الجديد للـ API مع تفاصيل إضافية
  const extractCodes = (responseData: any): ExtendedCodeItem[] => {
    if (!responseData) return [];
    
    let allCodes: ExtendedCodeItem[] = [];
    
    // الشكل الجديد: { wallet: [{ amount, count, codes }], courses: [], semesters: [], lessons: [] }
    if (responseData.wallet && Array.isArray(responseData.wallet)) {
      responseData.wallet.forEach((item: any) => {
        if (item.codes && Array.isArray(item.codes)) {
          allCodes = [...allCodes, ...item.codes];
        }
      });
    }
    
    if (responseData.courses && Array.isArray(responseData.courses)) {
      responseData.courses.forEach((item: any) => {
        if (item.codes && Array.isArray(item.codes)) {
          allCodes = [...allCodes, ...item.codes];
        }
      });
    }
    
    if (responseData.semesters && Array.isArray(responseData.semesters)) {
      responseData.semesters.forEach((item: any) => {
        if (item.codes && Array.isArray(item.codes)) {
          allCodes = [...allCodes, ...item.codes];
        }
      });
    }
    
    if (responseData.lessons && Array.isArray(responseData.lessons)) {
      responseData.lessons.forEach((item: any) => {
        if (item.codes && Array.isArray(item.codes)) {
          allCodes = [...allCodes, ...item.codes];
        }
      });
    }
    
    // إضافة اسم الطالب والمعلم إذا وجد (من البيانات الإضافية)
    allCodes = allCodes.map((code: any) => ({
      ...code,
      student_name: code.student?.name || code.student_name || null,
      teacher_name: code.teacher?.name || code.teacher_name || null,
      amount: code.amount ? parseFloat(code.amount) : null,
    }));
    
    return allCodes;
  };

  let allCodes = extractCodes(data?.data);
  
  // تطبيق الفلاتر المتقدمة
  allCodes = useMemo(() => {
    let filtered = [...allCodes];
    
    // فلتر حسب النوع (all, used, unused)
    if (type === 'used') {
      filtered = filtered.filter((code: any) => code.is_used === 1);
    } else if (type === 'unused') {
      filtered = filtered.filter((code: any) => code.is_used === 0);
    }
    
    // فلتر حسب نوع الكود (wallet, course, semester, lesson)
    if (externalTypeFilter) {
      filtered = filtered.filter((code: any) => code.type === externalTypeFilter);
    }
    
    // فلتر حسب الحالة
    if (externalStatusFilter !== undefined) {
      filtered = filtered.filter((code: any) => code.is_used === (externalStatusFilter ? 1 : 0));
    }
    
    // فلتر حسب نوع الاستخدام (online/center)
    if (typeCodeFilter !== 'all') {
      filtered = filtered.filter((code: any) => code.type_code === typeCodeFilter);
    }
    
    // فلتر حسب الطالب
    if (studentFilter) {
      filtered = filtered.filter((code: any) => 
        code.student_name?.toLowerCase().includes(studentFilter.toLowerCase()) ||
        code.student_id?.toString() === studentFilter
      );
    }
    
    // فلتر حسب المعلم
    if (teacherFilter) {
      filtered = filtered.filter((code: any) => 
        code.teacher_name?.toLowerCase().includes(teacherFilter.toLowerCase()) ||
        code.teacher_id?.toString() === teacherFilter
      );
    }
    
    // فلتر حسب التاريخ
    if (dateFrom) {
      filtered = filtered.filter((code: any) => 
        new Date(code.created_at) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filtered = filtered.filter((code: any) => 
        new Date(code.created_at) <= new Date(dateTo)
      );
    }
    
    return filtered;
  }, [allCodes, type, externalTypeFilter, externalStatusFilter, typeCodeFilter, studentFilter, teacherFilter, dateFrom, dateTo]);
  
  // تحديث البحث المحلي مع تأخير
  useEffect(() => {
    const timer = setTimeout(() => {
      if (externalSearchQuery !== localSearchQuery) {
        refetch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchQuery, externalSearchQuery]);
  
  // مزامنة البحث الخارجي
  useEffect(() => {
    setLocalSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  
  const handleDeleteSelected = async () => {
    if (selectedCodes.length === 0) return;
    if (confirm(lang === 'ar' ? `حذف ${selectedCodes.length} كود؟` : `Delete ${selectedCodes.length} code(s)?`)) {
      await deleteCodes.mutateAsync(selectedCodes);
      setSelectedCodes([]);
      refetch();
      if (onRefresh) onRefresh();
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCodes(allCodes.map(c => c.id));
    } else {
      setSelectedCodes([]);
    }
  };

  const handleSelectCode = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedCodes([...selectedCodes, id]);
    } else {
      setSelectedCodes(selectedCodes.filter(i => i !== id));
    }
  };
  
  const clearAdvancedFilters = () => {
    setStudentFilter('');
    setTeacherFilter('');
    setTypeCodeFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      wallet: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-950/40 dark:to-emerald-950/40 dark:text-green-400',
      course: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-950/40 dark:to-indigo-950/40 dark:text-blue-400',
      semester: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 dark:from-purple-950/40 dark:to-violet-950/40 dark:text-purple-400',
      lesson: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 dark:from-orange-950/40 dark:to-amber-950/40 dark:text-orange-400',
    };
    return badges[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getTypeCodeBadge = (typeCode: string) => {
    if (typeCode === 'online') {
      return {
        bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
        icon: Wifi,
        label: lang === 'ar' ? 'أونلاين' : 'Online'
      };
    }
    return {
      bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
      icon: Building,
      label: lang === 'ar' ? 'مركز' : 'Center'
    };
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      wallet: lang === 'ar' ? 'محفظة' : 'Wallet',
      course: lang === 'ar' ? 'كورس' : 'Course',
      semester: lang === 'ar' ? 'ترم' : 'Semester',
      lesson: lang === 'ar' ? 'درس' : 'Lesson',
    };
    return labels[type] || type;
  };
  
  const getStatusBadge = (isUsed: number) => {
    if (isUsed === 1) {
      return (
        <Badge variant="destructive" className="gap-1 px-2 py-1">
          <Eye size={12} />
          {lang === 'ar' ? 'مستخدم' : 'Used'}
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500 hover:bg-green-600 gap-1 px-2 py-1">
        <Zap size={12} />
        {lang === 'ar' ? 'غير مستخدم' : 'Unused'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="mr-2 text-gray-500">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Advanced Filters Toggle */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex justify-between items-center">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
        >
          <Filter size={16} />
          {lang === 'ar' ? 'فلتر متقدم' : 'Advanced Filters'}
          {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {(studentFilter || teacherFilter || typeCodeFilter !== 'all' || dateFrom || dateTo) && (
          <button
            onClick={clearAdvancedFilters}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <X size={12} />
            {lang === 'ar' ? 'مسح الكل' : 'Clear all'}
          </button>
        )}
      </div>
      
      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* فلتر نوع الاستخدام */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {lang === 'ar' ? 'نوع الاستخدام' : 'Usage Type'}
                </label>
                <Select value={typeCodeFilter} onValueChange={(v: any) => setTypeCodeFilter(v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === 'ar' ? 'الكل' : 'All'}</SelectItem>
                    <SelectItem value="online">{lang === 'ar' ? 'أونلاين' : 'Online'}</SelectItem>
                    <SelectItem value="center">{lang === 'ar' ? 'مركز' : 'Center'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* فلتر الطالب */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {lang === 'ar' ? 'البحث بالطالب' : 'Search by Student'}
                </label>
                <div className="relative">
                  <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={studentFilter}
                    onChange={(e) => setStudentFilter(e.target.value)}
                    placeholder={lang === 'ar' ? 'اسم الطالب أو ID' : 'Student name or ID'}
                    className="w-full pr-9 pl-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
              
              {/* فلتر المعلم */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {lang === 'ar' ? 'البحث بالمعلم' : 'Search by Teacher'}
                </label>
                <div className="relative">
                  <GraduationCap size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={teacherFilter}
                    onChange={(e) => setTeacherFilter(e.target.value)}
                    placeholder={lang === 'ar' ? 'اسم المعلم أو ID' : 'Teacher name or ID'}
                    className="w-full pr-9 pl-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
              
              {/* فلتر التاريخ */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {lang === 'ar' ? 'من تاريخ' : 'From Date'}
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {lang === 'ar' ? 'إلى تاريخ' : 'To Date'}
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header with delete actions */}
      {allCodes.length > 0 && selectedCodes.length > 0 && (
        <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-red-50 dark:bg-red-900/20 flex justify-between items-center">
          <span className="text-sm text-red-600 dark:text-red-400">
            {lang === 'ar' ? 'تم تحديد' : 'Selected'} {selectedCodes.length} {lang === 'ar' ? 'كود' : 'codes'}
          </span>
          <button
            onClick={handleDeleteSelected}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} />
            {lang === 'ar' ? 'حذف المحدد' : 'Delete Selected'}
          </button>
        </div>
      )}

      {allCodes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Search size={28} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {lang === 'ar' ? 'لا توجد كودات مطابقة للبحث' : 'No matching codes found'}
          </p>
        </div>
      ) : (
        <>
          {/* Select All Row */}
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {lang === 'ar' ? `إجمالي النتائج: ${allCodes.length}` : `Total results: ${allCodes.length}`}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCodes.length === allCodes.length && allCodes.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              {lang === 'ar' ? 'اختر الكل' : 'Select All'}
            </label>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-right w-10"></th>
                
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === 'ar' ? 'النوع' : 'Type'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === 'ar' ? 'نوع الاستخدام' : 'Usage'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === 'ar' ? 'القيمة' : 'Value'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === 'ar' ? 'الطالب' : 'Student'}
                  </th>
                   
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === 'ar' ? 'المعلم' : 'Teacher'}
                  </th>
                  
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === 'ar' ? 'تاريخ الإنشاء' : 'Created'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                <AnimatePresence>
                  {allCodes.map((code: ExtendedCodeItem, index: number) => {
                    const TypeCodeIcon = getTypeCodeBadge(code.type_code).icon;
                    const typeCodeConfig = getTypeCodeBadge(code.type_code);
                    
                    return (
                      <motion.tr
                        key={code.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedCodes.includes(code.id)}
                            onChange={(e) => handleSelectCode(code.id, e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono font-bold text-gray-800 dark:text-gray-200">
                            {code.code}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(code.type)}`}>
                            {getTypeLabel(code.type)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeCodeConfig.bg}`}>
                            <TypeCodeIcon size={12} />
                            {typeCodeConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {code.type === 'wallet' && code.amount ? `${code.amount} ${lang === 'ar' ? 'ج.م' : 'EGP'}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(code.is_used)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {code.student_name ? (
                            <span className="text-gray-700 dark:text-gray-300">{code.student_name}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {code.teacher_name ? (
                            <span className="text-gray-700 dark:text-gray-300">{code.teacher_name}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(code.created_at), 'dd/MM/yyyy', { 
                            locale: lang === 'ar' ? arSA : enUS 
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCopyCode(code.code)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm flex items-center gap-1"
                          >
                            {copiedCode === code.code ? (
                              <>
                                <Check size={14} />
                                <span className="hidden sm:inline">{lang === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span className="hidden sm:inline">{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                              </>
                            )}
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
             </table>
          </div>

          {/* Footer with statistics */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center text-sm">
            <div className="text-gray-500 dark:text-gray-400">
              {lang === 'ar' ? 'إجمالي الكودات' : 'Total codes'}: {allCodes.length}
            </div>
            <div className="flex gap-4 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {lang === 'ar' ? 'غير مستخدم' : 'Unused'}: {allCodes.filter(c => c.is_used === 0).length}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {lang === 'ar' ? 'مستخدم' : 'Used'}: {allCodes.filter(c => c.is_used === 1).length}
              </span>
              <span className="flex items-center gap-1">
                <Wifi size={12} />
                {lang === 'ar' ? 'أونلاين' : 'Online'}: {allCodes.filter(c => c.type_code === 'online').length}
              </span>
              <span className="flex items-center gap-1">
                <Building size={12} />
                {lang === 'ar' ? 'مركز' : 'Center'}: {allCodes.filter(c => c.type_code === 'center').length}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};