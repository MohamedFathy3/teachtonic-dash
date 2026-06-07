/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/center-hours/CenterHourModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useCenterHours } from '@/hooks/useCenterHours';
import { useApp } from '@/contexts/AppContext';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import { X, Calendar, Clock, BookOpen, FileText, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface CenterHourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: any;
  isDarkMode?: boolean;

}

export const CenterHourModal: React.FC<CenterHourModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
  isDarkMode = false,
}) => {
  const { lang, user } = useApp();
  const { useCreate, useUpdate } = useCenterHours();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const weekDays = [
    {
      value: 'Saturday',
      ar: 'السبت',
      en: 'Saturday',
    },
    {
      value: 'Sunday',
      ar: 'الأحد',
      en: 'Sunday',
    },
    {
      value: 'Monday',
      ar: 'الإثنين',
      en: 'Monday',
    },
    {
      value: 'Tuesday',
      ar: 'الثلاثاء',
      en: 'Tuesday',
    },
    {
      value: 'Wednesday',
      ar: 'الأربعاء',
      en: 'Wednesday',
    },
    {
      value: 'Thursday',
      ar: 'الخميس',
      en: 'Thursday',
    },
    {
      value: 'Friday',
      ar: 'الجمعة',
      en: 'Friday',
    },
  ];
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    hours_start: '',
    hours_end: '',
    note: '',
    phone: '',
    address: '',
    teacher_id: null as number | null,
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        date: editingItem.date || '',
        hours_start: editingItem.hours_start || '',
        hours_end: editingItem.hours_end || '',
        note: editingItem.note || '',
        phone: editingItem.phone || '',
        address: editingItem.address || '',
        teacher_id: editingItem.teacher_id || null,
      });
    } else {
      // تعيين التاريخ والوقت الحالي افتراضياً
      const now = new Date();
      setFormData({
        title: '',
        date: '',
        hours_start: '',
        hours_end: '',
        note: '',
        phone: '',
        address: '',
        teacher_id: user?.id || null,
      });
    }
  }, [editingItem, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.date ||
      !formData.hours_start ||
      !formData.hours_end ||
      !formData.teacher_id
    ) {
      toast.error(
        lang === 'ar'
          ? 'يرجى ملء جميع الحقول المطلوبة'
          : 'Please fill all required fields'
      );
      return;
    }

    const payload = {
      title: formData.title,
      date: formData.date,
      hours_start: formData.hours_start,
      hours_end: formData.hours_end,
      note: formData.note,
      phone: formData.phone,
      address: formData.address,
      teacher_id: formData.teacher_id,
    };

    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    onSuccess();
    onClose();
    if (!editingItem) {
      const now = new Date();
      setFormData({
        title: '',
        date: '',
        hours_start: '',
        hours_end: '',
        note: '',
        phone: '',
        address: '',
        teacher_id: user?.id || null,
      });
    }
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex items-center gap-3">
                    <Calendar size={28} />
                    <div>
                      <Dialog.Title className="text-xl font-bold">
                        {editingItem
                          ? (lang === 'ar' ? 'تعديل موعد' : 'Edit Appointment')
                          : (lang === 'ar' ? 'إضافة موعد جديد' : 'Add New Appointment')}
                      </Dialog.Title>
                      <p className="text-white/80 text-sm mt-1">
                        {lang === 'ar' ? 'أدخل تفاصيل الموعد' : 'Enter appointment details'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                  {/* Center */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang === 'ar' ? 'السنتر' : 'Center'} *
                    </label>

                    <div className="relative">
                      <BookOpen
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />

                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            title: e.target.value,
                          })
                        }
                        className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder={
                          lang === 'ar'
                            ? 'مثال: سنتر ألف مسكن'
                            : 'e.g., Center Alfe Maskan'
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Day */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang === 'ar' ? 'اليوم' : 'Day'} *
                    </label>

                    <select
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">
                        {lang === 'ar'
                          ? 'اختر اليوم'
                          : 'Select Day'}
                      </option>

                      {weekDays.map((day) => (
                        <option key={day.value} value={day.ar}>
                          {lang === 'ar'
                            ? day.ar
                            : day.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Time + End Time */}
                  <div className="grid grid-cols-2 gap-3">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {lang === 'ar'
                          ? 'وقت البداية'
                          : 'Start Time'} *
                      </label>

                      <div className="relative">
                        <Clock
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={16}
                        />

                        <input
                          type="time"
                          value={formData.hours_start}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hours_start: e.target.value,
                            })
                          }
                          className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {lang === 'ar'
                          ? 'وقت النهاية'
                          : 'End Time'} *
                      </label>

                      <div className="relative">
                        <Clock
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={16}
                        />

                        <input
                          type="time"
                          value={formData.hours_end}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hours_end: e.target.value,
                            })
                          }
                          className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </div>

                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang === 'ar'
                        ? 'رقم الهاتف'
                        : 'Phone'}
                    </label>

                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder={
                        lang === 'ar'
                          ? 'أدخل رقم الهاتف'
                          : 'Enter phone number'
                      }
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang === 'ar'
                        ? 'العنوان'
                        : 'Address'}
                    </label>

                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder={
                        lang === 'ar'
                          ? 'أدخل العنوان'
                          : 'Enter address'
                      }
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang === 'ar'
                        ? 'ملاحظات'
                        : 'Notes'}
                    </label>

                    <div className="relative">
                      <FileText
                        className="absolute right-3 top-3 text-gray-400"
                        size={16}
                      />

                      <textarea
                        value={formData.note}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            note: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder={
                          lang === 'ar'
                            ? 'أي ملاحظات إضافية...'
                            : 'Any additional notes...'
                        }
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">

                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {lang === 'ar'
                        ? 'إلغاء'
                        : 'Cancel'}
                    </button>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {lang === 'ar'
                            ? 'جاري الحفظ...'
                            : 'Saving...'}
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