/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/assignments/AssignmentModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAssignments } from '@/hooks/useAssignments';
import { useApp } from '@/contexts/AppContext';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import { X, FileText, Clock, Star, Save, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: any;
  isDarkMode?: boolean;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
  isDarkMode = false,
}) => {
  const { lang, user, isInstructor } = useApp();
  const { useCreate, useUpdate } = useAssignments();
  const createMutation = useCreate();
  const updateMutation = useUpdate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teacher_id: null as number | null,
    stage_id: null as number | null,
    course_detail_id: null as number | null,
    total_marks: 20,
    duration_minutes: 30,
    type: 'assignment' as const,
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        description: editingItem.description || '',
        // 🔥 التعديل: خلي teacher_id من الـ user المسجل
        teacher_id: isInstructor ? (user?.id ?? null) : (editingItem.teacher_id?.id || editingItem.teacher_id || null),
        stage_id: editingItem.stage_id?.id || editingItem.stage_id || null,
        course_detail_id: editingItem.course_detail_id || null,
        total_marks: editingItem.total_marks || 20,
        duration_minutes: editingItem.duration_minutes || 30,
        type: 'assignment',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        // 🔥 التعديل: خلي teacher_id من الـ user المسجل
        teacher_id: isInstructor ? (user?.id ?? null) : null,
        stage_id: null,
        course_detail_id: null,
        total_marks: 20,
        duration_minutes: 30,
        type: 'assignment',
      });
    }
  }, [editingItem, isInstructor, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.stage_id) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    // 🔥 تأكد من وجود teacher_id
    if (!formData.teacher_id) {
      toast.error(lang === 'ar' ? 'حدث خطأ في بيانات المعلم' : 'Error with teacher data');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      type: 'assignment',
      teacher_id: formData.teacher_id,
      stage_id: formData.stage_id,
      course_detail_id: formData.course_detail_id,
      total_marks: formData.total_marks,
      duration_minutes: formData.duration_minutes,
    };

    console.log('📤 Sending payload:', payload); // للتأكد

    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    onSuccess();
    onClose();
    if (!editingItem) {
      setFormData({
        title: '',
        description: '',
        teacher_id: isInstructor ? (user?.id ?? null) : null,
        stage_id: null,
        course_detail_id: null,
        total_marks: 20,
        duration_minutes: 30,
        type: 'assignment',
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // 🔥 عرض اسم المعلم في الـ modal
  const teacherName = isInstructor && user ? user.name : (editingItem?.teacher?.name || '');

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
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl shadow-xl transition-all ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <FileText size={28} />
                    <div>
                      <Dialog.Title className="text-xl font-bold">
                        {editingItem 
                          ? (lang === 'ar' ? 'تعديل واجب' : 'Edit Assignment')
                          : (lang === 'ar' ? 'إضافة واجب جديد' : 'Add New Assignment')}
                      </Dialog.Title>
                      <p className="text-white/80 text-sm mt-1">
                        {lang === 'ar' ? 'أدخل تفاصيل الواجب' : 'Enter assignment details'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {lang === 'ar' ? 'عنوان الواجب' : 'Title'} *
                    </label>
                    <div className="relative">
                      <BookOpen className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} size={18} />
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={lang === 'ar' ? 'مثال: واجب الباك إند' : 'e.g., Backend Assignment'}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {lang === 'ar' ? 'الوصف' : 'Description'} *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={lang === 'ar' ? 'وصف الواجب...' : 'Assignment description...'}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {lang === 'ar' ? 'الدرجة الكلية' : 'Total Marks'} *
                      </label>
                      <div className="relative">
                        <Star className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} size={16} />
                        <input
                          type="number"
                          value={formData.total_marks}
                          onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                          className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-100' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {lang === 'ar' ? 'المدة (دقائق)' : 'Duration (min)'} *
                      </label>
                      <div className="relative">
                        <Clock className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} size={16} />
                        <input
                          type="number"
                          value={formData.duration_minutes}
                          onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                          className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-100' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {lang === 'ar' ? 'المرحلة الدراسية' : 'Stage'} *
                    </label>
                    <AsyncSelect
                      configKey="stages"
                      value={formData.stage_id}
                      onChange={(id) => setFormData({ ...formData, stage_id: id })}
                      placeholder={lang === 'ar' ? 'اختر المرحلة' : 'Select stage'}
                      required
                    />
                  </div>

                  {/* 🔥 عرض اسم المعلم بشكل ثابت (غير قابل للتعديل) */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {lang === 'ar' ? 'المعلم' : 'Teacher'} *
                    </label>
                    <div className={`p-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-300' 
                        : 'bg-gray-100 border-gray-200 text-gray-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                          {teacherName ? teacherName.charAt(0).toUpperCase() : 'T'}
                        </div>
                        <span>{teacherName || (lang === 'ar' ? 'المعلم المسجل' : 'Registered Teacher')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          {editingItem 
                            ? (lang === 'ar' ? 'تحديث' : 'Update')
                            : (lang === 'ar' ? 'إضافة' : 'Add')}
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