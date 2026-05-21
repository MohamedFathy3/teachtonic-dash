/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/assignments/AssignmentModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAssignments } from '@/hooks/useAssignments';
import { useApp } from '@/contexts/AppContext';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import FileUploader from '@/components/FileUploader';
import { 
  X, FileText, Clock, Star, Save, BookOpen, 
  Layers3, Award, Image as ImageIcon, Sparkles,
  ChevronRight, ChevronLeft, GraduationCap
} from 'lucide-react';
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
    title_ar: '',
    description: '',
    description_ar: '',
    teacher_id: null as number | null,
    stage_id: null as number | null,
    course_detail_id: null as number | null,
    total_marks: 0,
    total_marks_pass_marks: 0,
    duration_minutes: 0,
    type: 'assignment' as const,
  });

  const [imageId, setImageId] = useState<number | null>(null);

  // ✅ تحميل بيانات التعديل
  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        title_ar: editingItem.title_ar || '',
        description: editingItem.description || '',
        description_ar: editingItem.description_ar || '',
        teacher_id: isInstructor ? (user?.id ?? null) : (editingItem.teacher_id?.id || editingItem.teacher_id || null),
        stage_id: editingItem.stage_id?.id || editingItem.stage_id || null,
        course_detail_id: editingItem.course_detail_id?.id || editingItem.course_detail_id || null,
        total_marks: editingItem.total_marks || 0,
        total_marks_pass_marks: editingItem.total_marks_pass_marks || 0,
        duration_minutes: editingItem.duration_minutes || 0,
        type: 'assignment',
      });
      setImageId(editingItem.image?.id || editingItem.image || null);
    } else {
      setFormData({
        title: '',
        title_ar: '',
        description: '',
        description_ar: '',
        teacher_id: isInstructor ? (user?.id ?? null) : null,
        stage_id: null,
        course_detail_id: null,
        total_marks: 0,
        total_marks_pass_marks: 0,
        duration_minutes: 0,
        type: 'assignment',
      });
      setImageId(null);
    }
  }, [editingItem, isInstructor, user]);

  // ✅ معالج رفع الصورة
  const handleImageUpload = (id: number) => {
    setImageId(id);
    toast.success(lang === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
  };

  const handleRemoveImage = () => {
    setImageId(null);
  };

  // ✅ إرسال البيانات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.stage_id) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (!formData.teacher_id) {
      toast.error(lang === 'ar' ? 'حدث خطأ في بيانات المعلم' : 'Error with teacher data');
      return;
    }

    // ✅ التحقق من درجة النجاح
    if (formData.total_marks_pass_marks > formData.total_marks) {
      toast.error(lang === 'ar' ? 'درجة النجاح لا يمكن أن تتجاوز الدرجة الكلية' : 'Pass marks cannot exceed total marks');
      return;
    }

    const payload = {
      title: formData.title,
      title_ar: formData.title_ar,
      description: formData.description,
      description_ar: formData.description_ar,
      type: 'assignment',
      teacher_id: formData.teacher_id,
      stage_id: formData.stage_id,
      course_detail_id: formData.course_detail_id,
      total_marks: formData.total_marks,
      total_marks_pass_marks: formData.total_marks_pass_marks,
      duration_minutes: formData.duration_minutes,
      ...(imageId && { image: imageId }),
    };

    console.log('📤 Sending payload:', payload);

    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    onSuccess();
    onClose();
    if (!editingItem) {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      teacher_id: isInstructor ? (user?.id ?? null) : null,
      stage_id: null,
      course_detail_id: null,
      total_marks: 0,
      total_marks_pass_marks: 0,
      duration_minutes: 0,
      type: 'assignment',
    });
    setImageId(null);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
              <Dialog.Panel className={`w-full max-w-2xl transform overflow-hidden rounded-2xl shadow-xl transition-all ${
                isDarkMode ? 'bg-gray-900' : 'bg-white'
              }`}>
                {/* Header */}
                <div className={`relative bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white`}>
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"
                    >
                      <FileText size={24} />
                    </motion.div>
                    <div>
                      <Dialog.Title className="text-2xl font-bold">
                        {editingItem 
                          ? (lang === 'ar' ? 'تعديل الواجب' : 'Edit Assignment')
                          : (lang === 'ar' ? 'إضافة واجب جديد' : 'Create New Assignment')}
                      </Dialog.Title>
                      <p className="text-white/80 text-sm mt-1">
                        {lang === 'ar' ? 'أدخل تفاصيل الواجب' : 'Enter assignment details'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  {/* ✅ Image Upload */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <ImageIcon size={16} className="text-orange-500" />
                      {lang === 'ar' ? 'صورة الواجب' : 'Assignment Image'}
                    </label>
                    <FileUploader
                      label={lang === 'ar' ? 'اضغط لرفع صورة' : 'Click to upload image'}
                      onUploadSuccess={handleImageUpload}
                      onRemoveImage={handleRemoveImage}
                      multiple={false}
                      accept="image/*"
                      preview={true}
                      uniqueId="assignment-image-upload"
                      maxFiles={1}
                      defaultImageId={imageId}
                    />
                  </div>

                  {/* Title & Arabic Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <BookOpen size={14} className="text-orange-500" />
                        {lang === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'} *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100 focus:border-orange-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                        }`}
                        placeholder={lang === 'ar' ? 'مثال: Backend Assignment' : 'e.g., Backend Assignment'}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <BookOpen size={14} className="text-orange-500" />
                        {lang === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={formData.title_ar}
                        onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100 focus:border-orange-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500'
                        }`}
                        placeholder={lang === 'ar' ? 'مثال: واجب الباك إند' : 'e.g., واجب الباك إند'}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Description & Arabic Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {lang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all resize-none ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={lang === 'ar' ? 'وصف الواجب...' : 'Assignment description...'}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {lang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                      </label>
                      <textarea
                        value={formData.description_ar}
                        onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                        rows={3}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all resize-none ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={lang === 'ar' ? 'وصف الواجب بالعربية...' : 'Assignment description in Arabic...'}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Marks, Pass Marks & Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Star size={14} className="text-yellow-500" />
                        {lang === 'ar' ? 'الدرجة الكلية' : 'Total Marks'} *
                      </label>
                      <input
                        type="number"
                        value={formData.total_marks}
                        onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) || 0 })}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Award size={14} className="text-green-500" />
                        {lang === 'ar' ? 'درجة النجاح' : 'Pass Marks'}
                      </label>
                      <input
                        type="number"
                        value={formData.total_marks_pass_marks}
                        onChange={(e) => setFormData({ ...formData, total_marks_pass_marks: parseInt(e.target.value) || 0 })}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        min="0"
                        placeholder={lang === 'ar' ? 'اختياري' : 'Optional'}
                      />
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {lang === 'ar' ? 'الدرجة المطلوبة للنجاح' : 'Minimum marks required to pass'}
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Clock size={14} className="text-blue-500" />
                        {lang === 'ar' ? 'المدة (دقائق)' : 'Duration (minutes)'} *
                      </label>
                      <input
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  {/* Stage & Lesson */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Layers3 size={14} className="text-purple-500" />
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

                    <div>
                      <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <GraduationCap size={14} className="text-indigo-500" />
                        {lang === 'ar' ? 'الدرس' : 'Lesson'}
                      </label>
                      <AsyncSelect
                        configKey="lessons"
                        value={formData.course_detail_id}
                        onChange={(id) => setFormData({ ...formData, course_detail_id: id })}
                        placeholder={lang === 'ar' ? 'اختر الدرس (اختياري)' : 'Select lesson (optional)'}
                      />
                    </div>
                  </div>

                  {/* Teacher Info (readonly) */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <GraduationCap size={14} className="text-orange-500" />
                      {lang === 'ar' ? 'المعلم' : 'Teacher'} *
                    </label>
                    <div className={`p-3 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-300' 
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {teacherName ? teacherName.charAt(0).toUpperCase() : 'T'}
                        </div>
                        <div>
                          <p className="font-medium">{teacherName || (lang === 'ar' ? 'المعلم المسجل' : 'Registered Teacher')}</p>
                          <p className="text-xs opacity-70">
                            {lang === 'ar' ? 'سيتم ربط الواجب بهذا المعلم' : 'Assignment will be linked to this teacher'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={onClose}
                      className={`flex-1 px-4 py-2.5 border rounded-xl transition-all ${
                        isDarkMode 
                          ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
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
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          {editingItem 
                            ? (lang === 'ar' ? 'تحديث الواجب' : 'Update Assignment')
                            : (lang === 'ar' ? 'إضافة الواجب' : 'Create Assignment')}
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