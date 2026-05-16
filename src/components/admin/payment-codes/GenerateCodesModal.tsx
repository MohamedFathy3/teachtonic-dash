/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/payment-codes/GenerateCodesModal.tsx (المعدل بالكامل)

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { usePaymentCodes } from '@/hooks/usePaymentCodes';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import { useApp } from '@/contexts/AppContext';
import { X, Sparkles, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GenerateCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const codeTypes = [
  { value: 'wallet', label: 'محفظة', labelEn: 'Wallet', icon: '💰', color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
  { value: 'course', label: 'كورس', labelEn: 'Course', icon: '📚', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50' },
  { value: 'semester', label: 'ترم', labelEn: 'Semester', icon: '📅', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
  { value: 'lesson', label: 'درس', labelEn: 'Lesson', icon: '📖', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50' },
];

export const GenerateCodesModal: React.FC<GenerateCodesModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { lang, dir,user } = useApp();
  const { useGenerateCodes } = usePaymentCodes();
  const generateCodes = useGenerateCodes();
  const [formData, setFormData] = useState<any>({
    type: 'wallet',
    count: 1,
    amount: 60,
  });
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [animate, setAnimate] = useState(false);
const teacherId = user?.id;

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {
      type: formData.type,
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

    await generateCodes.mutateAsync(payload);
    onSuccess();
    onClose();
    setFormData({ type: 'wallet', count: 1, amount: 60 });
    setSelectedCourse(null);
  };

  const getCurrentTypeConfig = () => {
    return codeTypes.find(t => t.value === formData.type) || codeTypes[0];
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === 'ar' ? 'المبلغ (ج.م)' : 'Amount (EGP)'}
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
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
                  extraFilters={{ teacher_id: user?.id,course_id: formData.course_id }}
                />
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header with gradient */}
                <div className={`relative bg-gradient-to-r ${getCurrentTypeConfig().color} p-6 text-white`}>
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  
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
                  
                  {/* Decorative sparkles */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Code Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
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
                              count: formData.count,
                              ...(type.value === 'wallet' ? { amount: 60 } : {})
                            });
                            setSelectedCourse(null);
                          }}
                          className={`relative p-3 rounded-xl text-center transition-all ${
                            formData.type === type.value
                              ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
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

                  {/* Number of Codes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang === 'ar' ? 'عدد الكودات' : 'Number of Codes'}
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, count: Math.max(1, formData.count - 1) })}
                        className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={formData.count}
                        onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
                        className="flex-1 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="100"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, count: Math.min(100, formData.count + 1) })}
                        className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {lang === 'ar' ? 'يمكن إنشاء حتى 100 كود في المرة الواحدة' : 'You can generate up to 100 codes at once'}
                    </p>
                  </div>

                  {/* Dynamic Fields with Animation */}
                  <AnimatePresence mode="wait">
                    {renderDynamicFields()}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};