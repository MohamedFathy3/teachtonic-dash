/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/books/BookModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useBooks } from '@/hooks/useBooks';
import { useApp } from '@/contexts/AppContext';
import { X, BookOpen, User, DollarSign, FileText, Save, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import FileUploader from '@/components/FileUploader';
import { useTeacherMeta } from '@/hooks/useTeacherMeta';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: any;
  isDarkMode?: boolean;
}

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
  isDarkMode = false,
}) => {
  const { lang, user, isInstructor } = useApp();
  const { useCreate, useUpdate } = useBooks();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const { stages } = useTeacherMeta(user?.id);
  const [formData, setFormData] = useState({
    title: '',
    writer: '',
    price: 0,
    pages_count: 0,
    teacher_id: null as number | null,
    image_id: null as number | null,
    discount: 0,              // ✅ NEW
    stage_id: null as number | null, // ✅ NEW
  });
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        writer: editingItem.writer || '',
        price: parseFloat(editingItem.price) || 0,
        pages_count: editingItem.pages_count || 0,
        teacher_id: editingItem.teacher_id || (isInstructor ? user?.id : null),
        image_id: editingItem.image?.id || null,
        discount: parseFloat(editingItem.discount) || 0,   // ✅
        stage_id: editingItem.stage_id || null, // ✅
      });
      if (editingItem.image?.fullUrl) {
        setSelectedImageUrl(editingItem.image.fullUrl);
        setSelectedImageId(editingItem.image.id);
      }
    } else {
      setFormData({
        title: '',
        writer: '',
        price: 0,
        pages_count: 0,
        teacher_id: isInstructor ? user?.id : null,
        image_id: null,
        discount: 0,              // ✅
        stage_id: null, // ✅
      });
    }
  }, [editingItem, isInstructor, user]);

  const handleImageUpload = (imageId: number) => {
    setSelectedImageId(imageId);
    setFormData(prev => ({ ...prev, image_id: imageId }));
    toast.success(lang === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
  };

  const handleRemoveImage = () => {
    setSelectedImageId(null);
    setSelectedImageUrl(null);
    setFormData(prev => ({ ...prev, image_id: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.writer || !formData.price || !formData.pages_count) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const payload = {
      title: formData.title,
      writer: formData.writer,
      price: formData.price,
      pages_count: formData.pages_count,
      teacher_id: formData.teacher_id || user?.id,
      image: formData.image_id,
      discount: formData.discount,   // ✅
      stage_id: formData.stage_id, // ✅
    };

    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    onSuccess();
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

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
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl shadow-xl transition-all ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex items-center gap-3">
                    <BookOpen size={28} />
                    <div>
                      <Dialog.Title className="text-xl font-bold">
                        {editingItem
                          ? (lang === 'ar' ? 'تعديل كتاب' : 'Edit Book')
                          : (lang === 'ar' ? 'إضافة كتاب جديد' : 'Add New Book')}
                      </Dialog.Title>
                      <p className="text-white/80 text-sm mt-1">
                        {lang === 'ar' ? 'أدخل تفاصيل الكتاب' : 'Enter book details'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                  {/* Title */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {lang === 'ar' ? 'عنوان الكتاب' : 'Title'} *
                    </label>

                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                      required
                    />
                  </div>

                  {/* Writer */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {lang === 'ar' ? 'المؤلف' : 'Writer'} *
                    </label>

                    <input
                      type="text"
                      value={formData.writer}
                      onChange={(e) => setFormData({ ...formData, writer: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                      required
                    />
                  </div>

                  {/* Price + Discount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {lang === 'ar' ? 'السعر' : 'Price'} *
                      </label>

                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                          }`}
                        min="0"
                        step="0.5"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {lang === 'ar' ? 'الخصم' : 'Discount'}
                      </label>

                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) =>
                          setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                          }`}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Stage + Pages */}
                  <div className="grid grid-cols-2 gap-3">

                    {/* Stage */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {lang === 'ar' ? 'المرحلة' : 'Stage'}
                      </label>

                      <select
                        value={formData.stage_id || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stage_id: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                          }`}
                      >
                        <option value="">
                          {lang === 'ar' ? 'اختر المرحلة' : 'Select Stage'}
                        </option>

                        {stages?.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {stage.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pages */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {lang === 'ar' ? 'عدد الصفحات' : 'Pages'} *
                      </label>

                      <input
                        type="number"
                        value={formData.pages_count}
                        onChange={(e) =>
                          setFormData({ ...formData, pages_count: parseInt(e.target.value) || 0 })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                          }`}
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Image */}
                  <FileUploader
                    label={lang === 'ar' ? 'صورة الكتاب (اختياري)' : 'Book Image (Optional)'}
                    onUploadSuccess={handleImageUpload}
                    multiple={false}
                    accept="image/*"
                    preview={true}
                    uniqueId="book-image"
                    defaultImageUrl={selectedImageUrl || undefined}
                    defaultImageId={selectedImageId}
                    onRemoveImage={handleRemoveImage}
                  />

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className={`flex-1 px-4 py-2 border rounded-lg transition ${isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          {editingItem ? (lang === 'ar' ? 'تحديث' : 'Update') : (lang === 'ar' ? 'إضافة' : 'Add')}
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