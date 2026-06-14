/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/offers/OfferModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useOffers } from '@/hooks/useOffers';
import { useApp } from '@/contexts/AppContext';
import { X, Gift, Percent, Calendar, ImageIcon, Save, Type, FileText, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import FileUploader from '@/components/FileUploader';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: any;
  isDarkMode?: boolean;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
  isDarkMode = false,
}) => {
  const { lang, user } = useApp();
  const { createOffer, updateOffer } = useOffers();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'offer' as 'offer' | 'banner',
    offer_discount: '',
    start_date: '',
    end_date: '',
    teacher_id: null as number | null,
    image_id: null as number | null,
  });
  
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        description: editingItem.description || '',
        type: editingItem.type || 'offer',
        offer_discount: editingItem.offer_discount || '',
        start_date: editingItem.start_date?.split('T')[0] || '',
        end_date: editingItem.end_date?.split('T')[0] || '',
        teacher_id: editingItem.teacher_id || user?.id,
        image_id: editingItem.image?.id || null,
      });
      if (editingItem.image?.fullUrl) {
        setSelectedImageUrl(editingItem.image.fullUrl);
        setSelectedImageId(editingItem.image.id);
      }
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'offer',
        offer_discount: '',
        start_date: '',
        end_date: '',
        teacher_id: user?.id,
        image_id: null,
      });
      setSelectedImageId(null);
      setSelectedImageUrl(null);
    }
  }, [editingItem, user]);

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

    if (!formData.title) {
      toast.error(lang === 'ar' ? 'يرجى إدخال عنوان العرض' : 'Please enter offer title');
      return;
    }

    const payload: any = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      teacher_id: formData.teacher_id || user?.id,
      image: formData.image_id,
    };

    // إضافة الخصم فقط إذا كان النوع offer
    if (formData.type === 'offer') {
      if (!formData.offer_discount) {
        toast.error(lang === 'ar' ? 'يرجى إدخال نسبة الخصم' : 'Please enter discount percentage');
        return;
      }
      payload.offer_discount = formData.offer_discount;
      payload.start_date = formData.start_date;
      payload.end_date = formData.end_date;
    }

    if (editingItem) {
      await updateOffer.mutateAsync({ id: editingItem.id, data: payload });
    } else {
      await createOffer.mutateAsync(payload);
    }

    onSuccess();
    onClose();
  };

  const isLoading = createOffer.isPending || updateOffer.isPending;

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
                <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex items-center gap-3">
                    <Gift size={28} />
                    <div>
                      <Dialog.Title className="text-xl font-bold">
                        {editingItem
                          ? (lang === 'ar' ? 'تعديل عرض' : 'Edit Offer')
                          : (lang === 'ar' ? 'إضافة عرض جديد' : 'Add New Offer')}
                      </Dialog.Title>
                      <p className="text-white/80 text-sm mt-1">
                        {lang === 'ar' ? 'أدخل تفاصيل العرض' : 'Enter offer details'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* نوع العرض */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {lang === 'ar' ? 'نوع العرض' : 'Offer Type'} *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'offer' })}
                        className={`px-4 py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                          formData.type === 'offer'
                            ? 'bg-orange-500 text-white border-orange-500'
                            : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Percent size={16} />
                        {lang === 'ar' ? 'عرض خصم' : 'Offer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'banner' })}
                        className={`px-4 py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                          formData.type === 'banner'
                            ? 'bg-orange-500 text-white border-orange-500'
                            : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ImageIcon size={16} />
                        {lang === 'ar' ? 'بانر' : 'Banner'}
                      </button>
                    </div>
                  </div>

                  {/* العنوان */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {lang === 'ar' ? 'العنوان' : 'Title'} *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  {/* الوصف */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {lang === 'ar' ? 'الوصف' : 'Description'}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  {/* حقول الخصم (تظهر فقط إذا كان النوع offer) */}
                  {formData.type === 'offer' && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {lang === 'ar' ? 'نسبة الخصم (%)' : 'Discount (%)'} *
                        </label>
                        <input
                          type="number"
                          value={formData.offer_discount}
                          onChange={(e) => setFormData({ ...formData, offer_discount: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                          }`}
                          min="0"
                          max="100"
                          step="1"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                          </label>
                          <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                              isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}
                          </label>
                          <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                              isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* رفع الصورة */}
                  <FileUploader
                    label={lang === 'ar' ? 'صورة العرض (اختياري)' : 'Offer Image (Optional)'}
                    onUploadSuccess={handleImageUpload}
                    multiple={false}
                    accept="image/*"
                    preview={true}
                    uniqueId="offer-image"
                    defaultImageUrl={selectedImageUrl || undefined}
                    defaultImageId={selectedImageId}
                    onRemoveImage={handleRemoveImage}
                  />

                  {/* الأزرار */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className={`flex-1 px-4 py-2 border rounded-lg transition ${
                        isDarkMode
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
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
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