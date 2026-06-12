/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/payment-codes/GenerateCodesModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { usePaymentCodes } from '@/hooks/usePaymentCodes';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import { useApp } from '@/contexts/AppContext';
import { X, Gift, Download, FileSpreadsheet, CheckCircle, Copy, Eye, Wifi, Building, MonitorSmartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

interface GenerateCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface GeneratedCode {
  id: number;
  code: string;
  type: string;
  type_code: 'online' | 'center';
  amount?: number;
  course_id?: number;
  course_name?: string;
  semester_id?: number;
  semester_name?: string;
  course_detail_id?: number;
  lesson_name?: string;
  created_at: string;
  expires_at?: string;
  status: string;
  used_by?: string;
  used_at?: string;
}

const codeTypes = [
  { value: 'wallet', label: 'محفظة', labelEn: 'Wallet', icon: '💰', color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-950/30', textColor: 'text-green-700 dark:text-green-400' },
  { value: 'course', label: 'كورس', labelEn: 'Course', icon: '📚', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50 dark:bg-blue-950/30', textColor: 'text-blue-700 dark:text-blue-400' },
  { value: 'semester', label: 'ترم', labelEn: 'Semester', icon: '📅', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-950/30', textColor: 'text-purple-700 dark:text-purple-400' },
  { value: 'lesson', label: 'درس', labelEn: 'Lesson', icon: '📖', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50 dark:bg-orange-950/30', textColor: 'text-orange-700 dark:text-orange-400' },
];

const usageTypeOptions = [
  { value: 'online', label: 'أونلاين', labelEn: 'Online', icon: Wifi, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/30', textColor: 'text-blue-700 dark:text-blue-400' },
  { value: 'center', label: 'مركز', labelEn: 'Center', icon: Building, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50 dark:bg-purple-950/30', textColor: 'text-purple-700 dark:text-purple-400' },
];

export const GenerateCodesModal: React.FC<GenerateCodesModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { lang, dir, user } = useApp();
  const { useGenerateCodes } = usePaymentCodes();
  const generateCodes = useGenerateCodes();
  const [formData, setFormData] = useState<any>({
    type: 'wallet',
    type_code: 'online',
    count: 1,
    amount: 60,
  });
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [animate, setAnimate] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const [showResults, setShowResults] = useState(false);
  const teacherId = user?.id;

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [formData.type]);

  // ✅ دالة إغلاق المودال بشكل صحيح
  const handleCloseModal = () => {
    setShowResults(false);
    setGeneratedCodes([]);
    setFormData({ type: 'wallet', type_code: 'online', count: 1, amount: 60 });
    setSelectedCourse(null);
    onClose(); // استدعاء onClose من props
  };

  // ✅ دالة إلغاء (لزر الإلغاء)
  const handleCancel = () => {
    handleCloseModal();
  };

  const exportToExcel = (codes: GeneratedCode[]) => {
    try {
      if (!codes || codes.length === 0) {
        toast.error(lang === 'ar' ? 'لا توجد أكواد للتصدير' : 'No codes to export');
        return;
      }

      const isArabic = lang === 'ar';
      
      const excelData = codes.map((code, index) => {
        const row: any = {
          [isArabic ? '#' : 'No']: index + 1,
          [isArabic ? 'الكود' : 'Code']: code.code,
          [isArabic ? 'النوع' : 'Type']: getTypeLabel(code.type),
          [isArabic ? 'نوع الاستخدام' : 'Usage Type']: getUsageTypeLabel(code.type_code),
          [isArabic ? 'القيمة (ج.م)' : 'Value (EGP)']: code.amount || '—',
          [isArabic ? 'تاريخ الإنشاء' : 'Created At']: new Date(code.created_at).toLocaleString(isArabic ? 'ar-EG' : 'en-US'),
        };
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const colWidths = [{ wch: 8 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }];
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, isArabic ? 'أكواد الدفع' : 'Payment Codes');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const fileName = `payment_codes_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
      toast.success(isArabic ? 'تم تصدير الأكواد بنجاح' : 'Codes exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء تصدير الأكواد' : 'Error exporting codes');
    }
  };

  const copyAllCodes = () => {
    const codesText = generatedCodes.map(c => c.code).join('\n');
    navigator.clipboard.writeText(codesText);
    toast.success(lang === 'ar' ? 'تم نسخ جميع الأكواد' : 'All codes copied');
  };

  const copySingleCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(lang === 'ar' ? 'تم نسخ الكود' : 'Code copied');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {
      type: formData.type,
      type_code: formData.type_code,
      count: formData.count,
    };

    switch (formData.type) {
      case 'wallet':
        payload.amount = formData.amount;
        break;
      case 'course':
        payload.course_id = formData.course_id;
        break;
      case 'semester':
        payload.semester_id = formData.semester_id;
        break;
      case 'lesson':
        payload.course_detail_id = formData.course_detail_id;
        break;
    }

    try {
      const result = await generateCodes.mutateAsync(payload);
      console.log('API Response:', result);
      
      let codes: GeneratedCode[] = [];
      
      if (result?.data && Array.isArray(result.data)) {
        codes = result.data.map((item: any) => ({
          code: item.code,
          type: item.type,
          type_code: item.type_code,
          amount: item.amount,
          course_id: item.course_id,
          semester_id: item.semester_id,
          course_detail_id: item.course_detail_id,
          created_at: item.created_at,
          status: 'active',
        }));
      } else if (result?.codes && Array.isArray(result.codes)) {
        codes = result.codes;
      } else if (Array.isArray(result)) {
        codes = result;
      } else if (result?.data?.codes && Array.isArray(result.data.codes)) {
        codes = result.data.codes;
      }
      
      console.log('Extracted codes:', codes);
      setGeneratedCodes(codes);
      setShowResults(true);
      
      toast.success(lang === 'ar' 
        ? `تم إنشاء ${codes.length} كود بنجاح` 
        : `${codes.length} codes generated successfully`);
      
      onSuccess();
    } catch (error: any) {
      console.error('Generate error:', error);
      toast.error(error?.response?.data?.message || (lang === 'ar' ? 'حدث خطأ أثناء إنشاء الأكواد' : 'Error generating codes'));
    }
  };

  const getTypeLabel = (type: string) => {
    const typeConfig = codeTypes.find(t => t.value === type);
    if (!typeConfig) return type;
    return lang === 'ar' ? typeConfig.label : typeConfig.labelEn;
  };

  const getUsageTypeLabel = (typeCode: string) => {
    const usageConfig = usageTypeOptions.find(t => t.value === typeCode);
    if (!usageConfig) return typeCode;
    return lang === 'ar' ? usageConfig.label : usageConfig.labelEn;
  };

  const getCurrentTypeConfig = () => {
    return codeTypes.find(t => t.value === formData.type) || codeTypes[0];
  };

  const getCurrentUsageConfig = () => {
    return usageTypeOptions.find(t => t.value === formData.type_code) || usageTypeOptions[0];
  };

  const renderDynamicFields = () => {
    const typeConfig = getCurrentTypeConfig();
    
    return (
      <motion.div
        key={formData.type}
        initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
        transition={{ duration: 0.2 }}
        className={`${typeConfig.bg} rounded-lg p-4 transition-all`}
      >
        {formData.type === 'wallet' && (
          <div>
            <label className={`block text-sm font-medium ${typeConfig.textColor} mb-2`}>
              {lang === 'ar' ? 'المبلغ (ج.م)' : 'Amount (EGP)'}
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              min="1"
              required
            />
          </div>
        )}
        
        {formData.type === 'course' && (
          <AsyncSelect
            configKey="courses"
            value={formData.course_id}
            onChange={(id) => {
              setFormData({ ...formData, course_id: id || undefined });
            }}
            label={lang === 'ar' ? 'اختر الكورس' : 'Select Course'}
            placeholder={lang === 'ar' ? 'ابحث عن كورس...' : 'Search for course...'}
            required
          />
        )}
        
        {formData.type === 'semester' && (
          <AsyncSelect
            configKey="semesters"
            value={formData.semester_id}
            onChange={(id, semester) => {
              setFormData({ ...formData, semester_id: id || undefined });
            }}
            label={lang === 'ar' ? 'اختر الترم' : 'Select Semester'}
            placeholder={lang === 'ar' ? 'ابحث عن ترم...' : 'Search for semester...'}
            required
            extraFilters={teacherId ? { teacher_id: teacherId } : undefined}
          />
        )}
        
        {formData.type === 'lesson' && (
          <div className="space-y-3">
            <AsyncSelect
              configKey="courses"
              value={formData.course_id}
              onChange={(id, course) => {
                setFormData({ ...formData, course_id: id || undefined, course_detail_id: undefined });
                setSelectedCourse(course);
              }}
              label={lang === 'ar' ? 'اختر الكورس أولاً' : 'Select Course First'}
              placeholder={lang === 'ar' ? 'ابحث عن كورس...' : 'Search for course...'}
              required
            />
            
            {formData.course_id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AsyncSelect
                  configKey="lessons"
                  value={formData.course_detail_id}
                  onChange={(id, lesson) => {
                    setFormData({ ...formData, course_detail_id: id || undefined });
                  }}
                  label={lang === 'ar' ? 'اختر الدرس' : 'Select Lesson'}
                  placeholder={lang === 'ar' ? 'ابحث عن درس...' : 'Search for lesson...'}
                  required
                  extraFilters={{ teacher_id: user?.id, course_id: formData.course_id }}
                />
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  const renderResults = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-6 space-y-4"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {lang === 'ar' ? 'تم إنشاء الأكواد بنجاح!' : 'Codes Generated Successfully!'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {lang === 'ar' 
            ? `تم إنشاء ${generatedCodes.length} كود بنجاح` 
            : `${generatedCodes.length} codes have been generated successfully`}
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => exportToExcel(generatedCodes)}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
        >
          <FileSpreadsheet size={18} />
          {lang === 'ar' ? 'تصدير Excel' : 'Export Excel'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={copyAllCodes}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <Copy size={18} />
          {lang === 'ar' ? 'نسخ الكل' : 'Copy All'}
        </motion.button>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2 border-t dark:border-gray-700 pt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {lang === 'ar' ? 'الأكواد المُنشأة:' : 'Generated Codes:'}
        </p>
        {generatedCodes.map((code, index) => (
          <motion.div
            key={code.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-750 transition-all"
          >
            <div className="flex-1">
              <code className="text-sm font-mono text-gray-800 dark:text-gray-200">{code.code}</code>
              {code.amount && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                  ({code.amount} EGP)
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                code.type_code === 'online' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' 
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
              }`}>
                {getUsageTypeLabel(code.type_code)}
              </span>
            </div>
            <button
              onClick={() => copySingleCode(code.code)}
              className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Copy size={16} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCloseModal}
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
        >
          {lang === 'ar' ? 'إغلاق' : 'Close'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setShowResults(false);
            setGeneratedCodes([]);
            setFormData({ type: 'wallet', type_code: 'online', count: 1, amount: 60 });
            setSelectedCourse(null);
          }}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all"
        >
          {lang === 'ar' ? 'إنشاء المزيد' : 'Create More'}
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl transition-all">
                <AnimatePresence mode="wait">
                  {!showResults ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Header with close button */}
                      <div className={`relative bg-gradient-to-r ${getCurrentTypeConfig().color} p-6 text-white`}>
                        {/* ✅ زر الإغلاق في الزاوية */}
                      
                        
                        <div className="flex items-center gap-3">
                          <div className="text-4xl animate-bounce">
                            {getCurrentTypeConfig().icon}
                          </div>
                          <div>
                            <Dialog.Title className="text-xl font-bold">
                              {lang === 'ar' ? 'توليد كودات دفع' : 'Generate Payment Codes'}
                            </Dialog.Title>
                            <p className="text-white/80 text-sm mt-1">
                              {lang === 'ar' 
                                ? 'قم بإنشاء أكواد خصم للطلاب' 
                                : 'Create discount codes for students'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />
                      </div>

                      <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Code Type Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            {lang === 'ar' ? 'نوع الكود' : 'Code Type'}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {codeTypes.map((type) => (
                              <motion.button
                                key={type.value}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setFormData({ 
                                    type: type.value as any, 
                                    type_code: formData.type_code,
                                    count: formData.count,
                                    ...(type.value === 'wallet' ? { amount: 60 } : {})
                                  });
                                  setSelectedCourse(null);
                                }}
                                className={`relative p-3 rounded-xl text-center transition-all ${
                                  formData.type === type.value
                                    ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                <div className="text-2xl mb-1">{type.icon}</div>
                                <div className="text-sm font-medium">
                                  {lang === 'ar' ? type.label : type.labelEn}
                                </div>
                                {formData.type === type.value && (
                                  <motion.div
                                    layoutId="activeTab"
                                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  />
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Usage Type Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            {lang === 'ar' ? 'نوع الاستخدام' : 'Usage Type'}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {usageTypeOptions.map((option) => {
                              const Icon = option.icon;
                              const isActive = formData.type_code === option.value;
                              return (
                                <motion.button
                                  key={option.value}
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setFormData({ ...formData, type_code: option.value as any })}
                                  className={`relative p-3 rounded-xl text-center transition-all ${
                                    isActive
                                      ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-center gap-2 mb-1">
                                    <Icon size={20} />
                                  </div>
                                  <div className="text-sm font-medium">
                                    {lang === 'ar' ? option.label : option.labelEn}
                                  </div>
                                  {isActive && (
                                    <motion.div
                                      layoutId="activeUsageTab"
                                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"
                                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Number of Codes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {lang === 'ar' ? 'عدد الكودات' : 'Number of Codes'}
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, count: Math.max(1, formData.count - 1) })}
                              className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={formData.count}
                              onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
                              className="flex-1 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                              min="1"
                              max="100"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, count: Math.min(100, formData.count + 1) })}
                              className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {lang === 'ar' ? 'يمكن إنشاء حتى 100 كود في المرة الواحدة' : 'You can generate up to 100 codes at once'}
                          </p>
                        </div>

                        <AnimatePresence mode="wait">
                          {renderDynamicFields()}
                        </AnimatePresence>

                        <div className={`p-3 rounded-lg ${getCurrentUsageConfig().bg} border border-gray-200 dark:border-gray-700`}>
                          <div className="flex items-center gap-2">
                            {React.createElement(getCurrentUsageConfig().icon, { size: 16, className: getCurrentUsageConfig().textColor })}
                            <p className={`text-xs ${getCurrentUsageConfig().textColor}`}>
                              {lang === 'ar' 
                                ? `هذه الأكواد ستكون متاحة للاستخدام عبر ${getCurrentUsageConfig().label}`
                                : `These codes will be available for use via ${getCurrentUsageConfig().labelEn}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCancel}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                          </motion.button>
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={generateCodes.isPending}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {generateCodes.isPending ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {lang === 'ar' ? 'جاري التوليد...' : 'Generating...'}
                              </>
                            ) : (
                              <>
                                <Gift size={18} />
                                {lang === 'ar' ? 'توليد' : 'Generate'}
                              </>
                            )}
                          </motion.button>
                        </div>
                      </form>
                    </motion.div>
                  ) : (
                    renderResults()
                  )}
                </AnimatePresence>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};