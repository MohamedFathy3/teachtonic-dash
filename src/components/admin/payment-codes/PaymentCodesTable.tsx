/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/payment-codes/PaymentCodesTable.tsx

import React, { useState, useEffect } from 'react';
import { usePaymentCodes } from '@/hooks/usePaymentCodes';
import { PaymentCode } from '@/types/payment-code.types';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { useApp } from '@/contexts/AppContext';
import { Check, Copy, Trash2, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentCodesTableProps {
  type?: 'all' | 'used' | 'unused';
  searchQuery?: string;
  typeFilter?: string;
  statusFilter?: boolean | undefined;
  onRefresh?: () => void;
}

export const PaymentCodesTable: React.FC<PaymentCodesTableProps> = ({ 
  type = 'all',
  searchQuery = '',
  typeFilter = '',
  statusFilter = undefined,
  onRefresh 
}) => {
  const { lang } = useApp();
  const [selectedCodes, setSelectedCodes] = useState<number[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const { useGetAllCodes, useDeleteCodes } = usePaymentCodes();
  const deleteCodes = useDeleteCodes();
  
  // جلب البيانات
  const { data, isLoading, refetch } = useGetAllCodes({
    search: searchQuery,
    perPage: 100,
  });
  
  // 🔥 استخراج الكودات من الشكل الجديد للـ API
  const extractCodes = (responseData: any): PaymentCode[] => {
    if (!responseData) return [];
    
    let allCodes: PaymentCode[] = [];
    
    // الشكل الجديد: { wallet: [{ amount, count, codes }], courses: [], semesters: [], lessons: [] }
    if (responseData.wallet && Array.isArray(responseData.wallet)) {
      responseData.wallet.forEach((item: any) => {
        if (item.codes && Array.isArray(item.codes)) {
          allCodes = [...allCodes, ...item.codes];
        }
      });
    }
    
    if (responseData.courses && Array.isArray(responseData.courses)) {
      allCodes = [...allCodes, ...responseData.courses];
    }
    
    if (responseData.semesters && Array.isArray(responseData.semesters)) {
      allCodes = [...allCodes, ...responseData.semesters];
    }
    
    if (responseData.lessons && Array.isArray(responseData.lessons)) {
      allCodes = [...allCodes, ...responseData.lessons];
    }
    
    // فلترة حسب النوع
    if (typeFilter) {
      allCodes = allCodes.filter((code: any) => code.type === typeFilter);
    }
    
    // فلترة حسب الحالة
    if (statusFilter !== undefined) {
      allCodes = allCodes.filter((code: any) => code.is_used === (statusFilter ? 1 : 0));
    }
    
    // فلترة حسب النوع (all, used, unused)
    if (type === 'used') {
      allCodes = allCodes.filter((code: any) => code.is_used === 1);
    } else if (type === 'unused') {
      allCodes = allCodes.filter((code: any) => code.is_used === 0);
    }
    
    return allCodes;
  };

  const codes = extractCodes(data?.data);
  
  // تحديث عند تغيير الفلاتر
  useEffect(() => {
    refetch();
  }, [searchQuery, typeFilter, statusFilter, type]);

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
      setSelectedCodes(codes.map(c => c.id));
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

  const getTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      wallet: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      course: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      semester: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      lesson: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return badges[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
      {/* Header with actions */}
      {codes.length > 0 && selectedCodes.length > 0 && (
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

      {codes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Search size={28} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {lang === 'ar' ? 'لا توجد كودات' : 'No codes found'}
          </p>
        </div>
      ) : (
        <>
          {/* Select All Row */}
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-end">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCodes.length === codes.length && codes.length > 0}
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
                    {lang === 'ar' ? 'الكود' : 'Code'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === 'ar' ? 'النوع' : 'Type'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === 'ar' ? 'القيمة' : 'Value'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === 'ar' ? 'الحالة' : 'Status'}
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
                  {codes.map((code: any, index: number) => (
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
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                          {code.code}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(code.type)}`}>
                          {getTypeLabel(code.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {code.type === 'wallet' && `${code.amount} ${lang === 'ar' ? 'ج.م' : 'EGP'}`}
                        {code.type !== 'wallet' && '—'}
                      </td>
                      <td className="px-4 py-3">
                        {code.is_used === 1 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {lang === 'ar' ? 'مستخدم' : 'Used'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {lang === 'ar' ? 'غير مستخدم' : 'Unused'}
                          </span>
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
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Footer with count */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lang === 'ar' ? 'إجمالي الكودات' : 'Total codes'}: {codes.length}
            </p>
          </div>
        </>
      )}
    </div>
  );
};