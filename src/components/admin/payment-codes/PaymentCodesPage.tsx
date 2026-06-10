/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/payment-codes/PaymentCodesPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePaymentCodes } from '@/hooks/usePaymentCodes';
import { GenerateCodesModal } from './GenerateCodesModal';
import { useApp } from '@/contexts/AppContext';
import {
  Plus, Trash2, Copy, Check, TrendingUp, Wallet, BookOpen,
  Calendar, FileText, Sparkles, Search, Filter, X, Eye,
  Tag, DollarSign, Clock, Zap, Layers, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, BarChart3, PieChart, Download,
  Wifi, Building, Users, UserCheck, Clock as ClockIcon, User
} from 'lucide-react';
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

// ============= تعريف المكونات الخارجية =============

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}> = ({ label, value, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${color} p-5 text-white shadow-xl`}
  >
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium tracking-wide">{label}</p>
        <motion.p
          className="text-4xl font-bold mt-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        >
          {value}
        </motion.p>
      </div>
      <div className="p-3 rounded-full bg-white/20 backdrop-blur">
        <Icon size={32} className="text-white" />
      </div>
    </div>
    <motion.div
      className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </motion.div>
);

const ReportStatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${color} p-5 text-white shadow-xl`}
  >
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium tracking-wide">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className="p-3 rounded-full bg-white/20 backdrop-blur">
        <Icon size={28} />
      </div>
    </div>
  </motion.div>
);

const TypeBadge: React.FC<{ type: string; lang: string }> = ({ type, lang }) => {
  const configs: Record<string, any> = {
    wallet: {
      bg: 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-950/40 dark:to-green-950/40',
      text: 'text-emerald-800 dark:text-emerald-300',
      icon: Wallet,
      label: lang === 'ar' ? 'محفظة' : 'Wallet',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    course: {
      bg: 'bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-950/40 dark:to-sky-950/40',
      text: 'text-blue-800 dark:text-blue-300',
      icon: BookOpen,
      label: lang === 'ar' ? 'كورس' : 'Course',
      border: 'border-blue-200 dark:border-blue-800'
    },
    semester: {
      bg: 'bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-950/40 dark:to-violet-950/40',
      text: 'text-purple-800 dark:text-purple-300',
      icon: Calendar,
      label: lang === 'ar' ? 'ترم' : 'Semester',
      border: 'border-purple-200 dark:border-purple-800'
    },
    lesson: {
      bg: 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/40',
      text: 'text-orange-800 dark:text-orange-300',
      icon: FileText,
      label: lang === 'ar' ? 'درس' : 'Lesson',
      border: 'border-orange-200 dark:border-orange-800'
    },
  };
  const config = configs[type] || configs.course;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
      {React.createElement(config.icon, { size: 14 })}
      {config.label}
    </span>
  );
};

const UsageTypeBadge: React.FC<{ typeCode: string; lang: string }> = ({ typeCode, lang }) => {
  const isOnline = typeCode === 'online';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      isOnline 
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
    }`}>
      {isOnline ? <Wifi size={12} /> : <Building size={12} />}
      {isOnline ? (lang === 'ar' ? 'أونلاين' : 'Online') : (lang === 'ar' ? 'سنتر' : 'Center')}
    </span>
  );
};

const StatusBadge: React.FC<{ isUsed: boolean; lang: string }> = ({ isUsed, lang }) => {
  if (isUsed) {
    return (
      <Badge variant="destructive" className="gap-1.5 px-3 py-1 rounded-full shadow-sm">
        <Eye size={12} />
        {lang === 'ar' ? 'مستخدم' : 'Used'}
      </Badge>
    );
  }
  return (
    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 gap-1.5 px-3 py-1 rounded-full shadow-sm">
      <Zap size={12} />
      {lang === 'ar' ? 'غير مستخدم' : 'Unused'}
    </Badge>
  );
};

const ValueDisplay: React.FC<{ code: any; lang: string }> = ({ code, lang }) => {
  if (code.type === 'wallet') {
    return (
      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
        <DollarSign size={14} />
        {code.amount} {lang === 'ar' ? 'ج.م' : 'EGP'}
      </div>
    );
  }
  if (code.type === 'course') {
    return (
      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
        <BookOpen size={14} />
        {code.course_name || `Course ID: ${code.course_id}`}
      </div>
    );
  }
  if (code.type === 'semester') {
    return (
      <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
        <Calendar size={14} />
        {code.semester_name || `Semester ID: ${code.semester_id}`}
      </div>
    );
  }
  if (code.type === 'lesson') {
    return (
      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
        <FileText size={14} />
        {code.lesson_name || `Lesson ID: ${code.course_detail_id}`}
      </div>
    );
  }
  return <span>—</span>;
};

// مكون عرض اسم الطالب
const StudentNameDisplay: React.FC<{ studentName: string | null; studentId: number | null; lang: string }> = 
({ studentName, studentId, lang }) => {
  if (studentName) {
    return (
      <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
        <User size={12} className="text-blue-500" />
        <span className="text-sm">{studentName}</span>
      </div>
    );
  }
  if (studentId) {
    return (
      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
        <User size={12} />
        <span className="text-sm">ID: {studentId}</span>
      </div>
    );
  }
  return (
    <span className="text-gray-400 dark:text-gray-500 text-sm">
      {lang === 'ar' ? '—' : '—'}
    </span>
  );
};

// ============= الـ Component الرئيسي =============

type TabType = 'codes' | 'reports';

export const PaymentCodesPage: React.FC = () => {
  const { lang } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('codes');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState(''); // بحث باسم الطالب
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [filters, setFilters] = useState({
    type: '',
    type_code: '', // فلتر نوع الاستخدام (online/center)
    is_used: undefined as boolean | undefined,
  });

  const { useGetAllCodes, useDeleteCodes, useGetStatistics } = usePaymentCodes();
  const { data, isLoading, refetch } = useGetAllCodes({
    ...filters,
    search: debouncedSearch,
    perPage: 1000,
  });

  const deleteCodes = useDeleteCodes();
  const { data: reportData, refetch: refetchReport } = useGetStatistics();

  // Debounce searches
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStudentSearch(studentSearchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [studentSearchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.type, filters.type_code, filters.is_used]);

  const extractCodesFromResponse = (responseData: any): any[] => {
    if (!responseData) return [];

    let allCodes: any[] = [];

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

    allCodes.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    // فلتر البحث بالكود
    if (debouncedSearch) {
      allCodes = allCodes.filter((code: any) =>
        code.code.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // فلتر البحث باسم الطالب
    if (debouncedStudentSearch) {
      allCodes = allCodes.filter((code: any) =>
        code.student_name?.toLowerCase().includes(debouncedStudentSearch.toLowerCase()) ||
        code.student_id?.toString().includes(debouncedStudentSearch)
      );
    }

    // فلتر نوع الكود
    if (filters.type) {
      allCodes = allCodes.filter((code: any) => code.type === filters.type);
    }

    // فلتر نوع الاستخدام (online/center)
    if (filters.type_code) {
      allCodes = allCodes.filter((code: any) => code.type_code === filters.type_code);
    }

    // فلتر الحالة
    if (filters.is_used !== undefined) {
      allCodes = allCodes.filter((code: any) => code.is_used === (filters.is_used ? 1 : 0));
    }

    return allCodes;
  };

  const allCodes = useMemo(() => {
    return extractCodesFromResponse(data?.data);
  }, [data?.data, debouncedSearch, debouncedStudentSearch, filters.type, filters.type_code, filters.is_used]);

  const totalPages = Math.ceil(allCodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCodes = allCodes.slice(startIndex, endIndex);

  const statsData = useMemo(() => {
    const total = allCodes.length;
    const used = allCodes.filter((c: any) => c.is_used === 1 || c.is_used === true).length;
    const unused = total - used;
    const onlineCodes = allCodes.filter((c: any) => c.type_code === 'online').length;
    const centerCodes = allCodes.filter((c: any) => c.type_code === 'center').length;
    
    return {
      total_codes: total,
      used_codes: used,
      unused_codes: unused,
      online_codes: onlineCodes,
      center_codes: centerCodes,
    };
  }, [allCodes]);

  const reportStatistics = reportData?.data?.statistics || {
    online_used: 0,
    center_used: 0,
    total_used: 0,
    total_unused: 0
  };

  const usageByTypeData = useMemo(() => {
    const usedByType: Record<string, number> = {};
    const totalByType: Record<string, number> = {};
    
    allCodes.forEach((code: any) => {
      totalByType[code.type] = (totalByType[code.type] || 0) + 1;
      if (code.is_used === 1 || code.is_used === true) {
        usedByType[code.type] = (usedByType[code.type] || 0) + 1;
      }
    });
    
    const getLabel = (type: string) => {
      const labels: Record<string, string> = {
        wallet: lang === 'ar' ? 'محفظة' : 'Wallet',
        course: lang === 'ar' ? 'كورس' : 'Course',
        semester: lang === 'ar' ? 'ترم' : 'Semester',
        lesson: lang === 'ar' ? 'درس' : 'Lesson',
      };
      return labels[type] || type;
    };
    
    return Object.keys(totalByType).map(type => ({
      name: getLabel(type),
      used: usedByType[type] || 0,
      total: totalByType[type],
    }));
  }, [allCodes, lang]);

  const usageRatioData = [
    { name: lang === 'ar' ? 'مستخدم' : 'Used', value: statsData.used_codes, color: '#ef4444' },
    { name: lang === 'ar' ? 'غير مستخدم' : 'Unused', value: statsData.unused_codes, color: '#22c55e' },
  ];

  const usageLocationData = [
    { name: lang === 'ar' ? 'أونلاين' : 'Online', value: reportStatistics.online_used, color: '#3b82f6' },
    { name: lang === 'ar' ? 'سنتر' : 'Center', value: reportStatistics.center_used, color: '#8b5cf6' },
    { name: lang === 'ar' ? 'غير مستخدم' : 'Unused', value: reportStatistics.total_unused, color: '#9ca3af' },
  ];

  const typeCodeData = [
    { name: lang === 'ar' ? 'أونلاين' : 'Online', value: statsData.online_codes, color: '#3b82f6' },
    { name: lang === 'ar' ? 'سنتر' : 'Center', value: statsData.center_codes, color: '#8b5cf6' },
  ];

  const statsCards = [
    {
      key: 'total',
      label: lang === 'ar' ? 'إجمالي الكودات' : 'Total Codes',
      icon: Layers,
      color: 'from-blue-500 to-indigo-600',
      value: statsData.total_codes
    },
    {
      key: 'used',
      label: lang === 'ar' ? 'المستخدمة' : 'Used',
      icon: Check,
      color: 'from-rose-500 to-red-600',
      value: statsData.used_codes
    },
    {
      key: 'unused',
      label: lang === 'ar' ? 'غير المستخدمة' : 'Unused',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-600',
      value: statsData.unused_codes
    },
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const confirmMsg = lang === 'ar'
      ? `⚠️ هل أنت متأكد من حذف ${selectedIds.length} كود؟ لا يمكن التراجع.`
      : `⚠️ Delete ${selectedIds.length} code(s)? This action cannot be undone.`;
    if (confirm(confirmMsg)) {
      await deleteCodes.mutateAsync(selectedIds);
      setSelectedIds([]);
      refetch();
      refetchReport();
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(currentCodes.map((c: any) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectCode = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setStudentSearchQuery('');
    setDebouncedSearch('');
    setDebouncedStudentSearch('');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStudentSearchQuery('');
    setFilters({ type: '', type_code: '', is_used: undefined });
    setShowFilters(false);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && activeTab === 'codes') {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {lang === 'ar' ? 'جاري تحميل الكودات...' : 'Loading codes...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      <div className="p-6 lg:p-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-between items-center gap-4 mb-8"
        >
          <div>
            <motion.h1
              className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
            >
              {lang === 'ar' ? '💳 كودات الدفع' : '💳 Payment Codes'}
            </motion.h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
              <Tag size={16} className="text-blue-500" />
              {lang === 'ar' ? 'إدارة وتوليد أكواد الخصم والدفع بكل سهولة' : 'Manage and generate discount & payment codes easily'}
            </p>
          </div>
          <div className="flex gap-3">
            {activeTab === 'codes' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    showFilters
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <Filter size={18} />
                </motion.button>

                <AnimatePresence>
                  {selectedIds.length > 0 && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={handleDeleteSelected}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl flex items-center gap-2 hover:shadow-lg transition-all hover:scale-105"
                    >
                      <Trash2 size={18} />
                      {lang === 'ar' ? 'حذف' : 'Delete'} ({selectedIds.length})
                    </motion.button>
                  )}
                </AnimatePresence>
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsGenerateModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center gap-2 shadow-md hover:shadow-xl transition-all"
            >
              <Plus size={18} />
              {lang === 'ar' ? 'توليد كودات' : 'Generate Codes'}
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('codes')}
              className={`px-6 py-3 text-sm font-medium transition-all rounded-t-lg ${
                activeTab === 'codes'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers size={16} />
                {lang === 'ar' ? 'جميع الكودات' : 'All Codes'}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 text-sm font-medium transition-all rounded-t-lg ${
                activeTab === 'reports'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={16} />
                {lang === 'ar' ? 'التقارير والإحصائيات' : 'Reports & Statistics'}
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'codes' ? (
            <motion.div
              key="codes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    className="mb-6 overflow-hidden"
                  >
                    <Card className="p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* بحث بالكود */}
                        <div className="relative">
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            type="text"
                            placeholder={lang === 'ar' ? '🔍 بحث بالكود...' : '🔍 Search by code...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10 rounded-xl"
                          />
                        </div>

                        {/* بحث باسم الطالب */}
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            type="text"
                            placeholder={lang === 'ar' ? '👤 بحث باسم الطالب...' : '👤 Search by student name...'}
                            value={studentSearchQuery}
                            onChange={(e) => setStudentSearchQuery(e.target.value)}
                            className="pr-10 rounded-xl"
                          />
                        </div>

                        {/* فلتر نوع الكود */}
                        <select
                          value={filters.type}
                          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                          className="px-4 py-2 rounded-xl border bg-white dark:bg-gray-900"
                        >
                          <option value="">{lang === 'ar' ? '📌 كل الأنواع' : '📌 All Types'}</option>
                          <option value="wallet">💰 {lang === 'ar' ? 'محفظة' : 'Wallet'}</option>
                          <option value="course">📚 {lang === 'ar' ? 'كورس' : 'Course'}</option>
                          <option value="semester">📅 {lang === 'ar' ? 'ترم' : 'Semester'}</option>
                          <option value="lesson">📖 {lang === 'ar' ? 'درس' : 'Lesson'}</option>
                        </select>

                        {/* فلتر نوع الاستخدام (online/center) */}
                        <select
                          value={filters.type_code}
                          onChange={(e) => setFilters({ ...filters, type_code: e.target.value })}
                          className="px-4 py-2 rounded-xl border bg-white dark:bg-gray-900"
                        >
                          <option value="">{lang === 'ar' ? '🌐 كل طرق الاستخدام' : '🌐 All Usage Types'}</option>
                          <option value="online">📱 {lang === 'ar' ? 'أونلاين' : 'Online'}</option>
                          <option value="center">🏢 {lang === 'ar' ? 'سنتر' : 'Center'}</option>
                        </select>

                        {/* فلتر الحالة */}
                        <select
                          value={filters.is_used === undefined ? '' : filters.is_used.toString()}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFilters({
                              ...filters,
                              is_used: val === '' ? undefined : val === 'true',
                            });
                          }}
                          className="px-4 py-2 rounded-xl border bg-white dark:bg-gray-900"
                        >
                          <option value="">🔄 {lang === 'ar' ? 'الحالة (الكل)' : 'Status (All)'}</option>
                          <option value="false">✨ {lang === 'ar' ? 'غير مستخدم' : 'Unused'}</option>
                          <option value="true">✅ {lang === 'ar' ? 'مستخدم' : 'Used'}</option>
                        </select>

                        {/* زر مسح الكل */}
                        <button
                          onClick={clearAllFilters}
                          className="px-4 py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <X size={16} />
                          {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                  <StatCard
                    key={stat.key}
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                  />
                ))}
              </div>

              {/* Codes Table */}
              <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                {allCodes.length === 0 ? (
                  <div className="text-center py-20">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center"
                    >
                      <Tag size={48} className="text-gray-400 dark:text-gray-500" />
                    </motion.div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {lang === 'ar' ? '✨ لا توجد كودات مطابقة للبحث' : '✨ No matching codes found'}
                    </p>
                    <Button
                      variant="link"
                      onClick={clearAllFilters}
                      className="mt-3 text-blue-600"
                    >
                      {lang === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3 px-5 pt-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {lang === 'ar' 
                          ? `🔢 إجمالي النتائج: ${allCodes.length} | عرض ${startIndex + 1}-${Math.min(endIndex, allCodes.length)}` 
                          : `📊 Total: ${allCodes.length} | Showing ${startIndex + 1}-${Math.min(endIndex, allCodes.length)}`}
                      </div>
                      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === currentCodes.length && currentCodes.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        {lang === 'ar' ? 'اختر الكل في هذه الصفحة' : 'Select All on this page'}
                      </label>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                          <tr>
                            <th className="px-5 py-4 text-right w-12">
                              <input
                                type="checkbox"
                                checked={selectedIds.length === currentCodes.length && currentCodes.length > 0}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="rounded border-gray-300 dark:border-gray-600 w-4 h-4"
                              />
                            </th>
                            <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {lang === 'ar' ? '🏷️ الكود' : '🏷️ Code'}
                            </th>
                            <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {lang === 'ar' ? '📂 النوع' : '📂 Type'}
                            </th>
                            <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {lang === 'ar' ? '🌐 نوع الاستخدام' : '🌐 Usage Type'}
                            </th>
                            <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {lang === 'ar' ? '💎 القيمة' : '💎 Value'}
                            </th>
                            <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {lang === 'ar' ? '👤 الطالب' : '👤 Student'}
                            </th>
                             <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {lang === 'ar' ? '👤 كود الطالب' : '👤 Student code'}
                            </th>
                             <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === 'ar' ?  'تاريخ الاستخدام 📅' : 'used_at 📅'}
                  </th>
                            <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {lang === 'ar' ? '🟢 الحالة' : '🟢 Status'}
                            </th>
                            <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {lang === 'ar' ? '📅 تاريخ الإنشاء' : '📅 Created'}
                            </th>
                            <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {lang === 'ar' ? '⚡ الإجراءات' : '⚡ Actions'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                          {currentCodes.map((code: any, index: number) => {
                            const isUsed = code.is_used === 1 || code.is_used === true;
                            return (
                              <motion.tr
                                key={code.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                whileHover={{ backgroundColor: 'rgba(59,130,246,0.03)' }}
                                className="transition-colors duration-150"
                              >
                                <td className="px-5 py-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.includes(code.id)}
                                    onChange={(e) => handleSelectCode(code.id, e.target.checked)}
                                    className="rounded border-gray-300 dark:border-gray-600"
                                  />
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    <motion.code
                                      whileHover={{ scale: 1.02 }}
                                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-mono font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm"
                                    >
                                      {code.code}
                                    </motion.code>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <TypeBadge type={code.type} lang={lang} />
                                </td>
                                <td className="px-5 py-4">
                                  <UsageTypeBadge typeCode={code.type_code || 'online'} lang={lang} />
                                </td>
                                <td className="px-5 py-4 text-sm">
                                  <ValueDisplay code={code} lang={lang} />
                                </td>
                                <td className="px-5 py-4">
                                  <StudentNameDisplay 
                                    studentName={code.student_name} 
                                    studentId={code.student_id} 
                                    lang={lang} 
                                  />
                                </td>
                                  <td className="px-5 py-4">
                                  <StudentNameDisplay 
                                    // studentName={code} 
                                    studentId={code.student_id} 
                                    lang={lang} 
                                  />
                                </td>
                                <td className="px-5 py-4">
                                  <Clock size={12} />
                                  {formatDate(code.used_at)}
                                </td>
                                <td className="px-5 py-4">
                                  <StatusBadge isUsed={isUsed} lang={lang} />
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Clock size={12} />
                                  {formatDate(code.created_at)}
                                </td>
                                <td className="px-5 py-4">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleCopyCode(code.code)}
                                    className={`text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                                      copiedCode === code.code
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50'
                                    }`}
                                  >
                                    {copiedCode === code.code ? (
                                      <>
                                        <Check size={14} />
                                        {lang === 'ar' ? 'تم النسخ' : 'Copied'}
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={14} />
                                        {lang === 'ar' ? 'نسخ' : 'Copy'}
                                      </>
                                    )}
                                  </motion.button>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {lang === 'ar' ? 'عرض' : 'Show'}
                            </span>
                            <Select
                              value={itemsPerPage.toString()}
                              onValueChange={(value) => {
                                setItemsPerPage(Number(value));
                                setCurrentPage(1);
                              }}
                            >
                              <SelectTrigger className="w-20 h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[10, 25, 50, 100].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => goToPage(1)}
                              disabled={currentPage === 1}
                              className="p-2 rounded-lg border disabled:opacity-50 hover:bg-gray-100"
                            >
                              <ChevronsLeft size={18} />
                            </button>
                            <button
                              onClick={() => goToPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="p-2 rounded-lg border disabled:opacity-50 hover:bg-gray-100"
                            >
                              <ChevronLeft size={18} />
                            </button>

                            {getPageNumbers().map((page, idx) => (
                              <button
                                key={idx}
                                onClick={() => typeof page === 'number' && goToPage(page)}
                                className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                                  currentPage === page
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                    : typeof page === 'number'
                                      ? 'border hover:bg-gray-100'
                                      : 'cursor-default'
                                }`}
                                disabled={typeof page !== 'number'}
                              >
                                {page}
                              </button>
                            ))}

                            <button
                              onClick={() => goToPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="p-2 rounded-lg border disabled:opacity-50 hover:bg-gray-100"
                            >
                              <ChevronRight size={18} />
                            </button>
                            <button
                              onClick={() => goToPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className="p-2 rounded-lg border disabled:opacity-50 hover:bg-gray-100"
                            >
                              <ChevronsRight size={18} />
                            </button>
                          </div>

                          <div className="text-sm text-gray-500">
                            {lang === 'ar'
                              ? `الصفحة ${currentPage} من ${totalPages}`
                              : `Page ${currentPage} of ${totalPages}`}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Report Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <ReportStatCard
                  title={lang === 'ar' ? 'إجمالي المستخدم (API)' : 'Total Used (API)'}
                  value={reportStatistics.total_used}
                  icon={UserCheck}
                  color="from-rose-500 to-red-600"
                />
                <ReportStatCard
                  title={lang === 'ar' ? 'مستخدم أونلاين' : 'Online Used'}
                  value={reportStatistics.online_used}
                  icon={Wifi}
                  color="from-blue-500 to-indigo-600"
                />
                <ReportStatCard
                  title={lang === 'ar' ? 'مستخدم مركز' : 'Center Used'}
                  value={reportStatistics.center_used}
                  icon={Building}
                  color="from-purple-500 to-violet-600"
                />
                <ReportStatCard
                  title={lang === 'ar' ? 'غير مستخدم (API)' : 'Unused (API)'}
                  value={reportStatistics.total_unused}
                  icon={ClockIcon}
                  color="from-gray-500 to-gray-600"
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Usage Ratio Pie Chart */}
                <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <PieChart size={20} className="text-emerald-500" />
                    {lang === 'ar' ? 'نسبة الاستخدام (من الكودات)' : 'Usage Ratio (From Codes)'}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={usageRatioData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {usageRatioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Usage by Type Bar Chart */}
                <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-blue-500" />
                    {lang === 'ar' ? 'الاستخدام حسب النوع' : 'Usage by Type'}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={usageByTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="used" fill="#ef4444" name={lang === 'ar' ? 'مستخدم' : 'Used'} />
                      <Bar dataKey="total" fill="#3b82f6" name={lang === 'ar' ? 'إجمالي' : 'Total'} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Type Code Distribution */}
                <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <PieChart size={20} className="text-orange-500" />
                    {lang === 'ar' ? 'توزيع نوع الاستخدام (Online/Center)' : 'Usage Type Distribution'}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={typeCodeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {typeCodeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Usage Location Pie Chart */}
             
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Modal */}
        <GenerateCodesModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          onSuccess={() => {
            refetch();
            refetchReport();
            setSelectedIds([]);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
};