/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/stages/StageForm.tsx

import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import type { Stage, StageFormData } from '@/types/stage.types';
import { teacherService } from '@/services/teacher.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface StageFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Stage | null;
  loading?: boolean;
}

export function StageForm({ open, onClose, onSubmit, initialData, loading }: StageFormProps) {
  const { t, dir, lang } = useApp();
  const [formData, setFormData] = useState<StageFormData>({
    name: '',
    name_ar: '',
    position: 0,
    active: true,
    image: null,
    distinctive_mark_for_teacher_id: null,
  });

  const [teachers, setTeachers] = useState<any[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersLoaded, setTeachersLoaded] = useState(false);

  useEffect(() => {
    if (initialData) {
      const teacherId = (initialData as any).distinctive_mark_for_teacher_id || null;
      
      setFormData({
        name: initialData.name,
        name_ar: initialData.name_ar || '',
        position: initialData.position,
        active: initialData.active,
        image: null,
        distinctive_mark_for_teacher_id: teacherId,
      });
    } else {
      setFormData({
        name: '',
        name_ar: '',
        position: 0,
        active: true,
        image: null,
        distinctive_mark_for_teacher_id: null,
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (open && !teachersLoaded) {
      fetchTeachers();
    }
  }, [open, teachersLoaded]);

  const fetchTeachers = async () => {
    setTeachersLoading(true);
    try {
      const response = await teacherService.getAllTeachers(
        { active: true },
        100,
        1,
        '',
        false
      );
      setTeachers(response.data);
      setTeachersLoaded(true);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setTeachersLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = initialData
      ? { ...formData, id: initialData.id }
      : formData;
    await onSubmit(submitData);
    if (!initialData) {
      setFormData({
        name: '',
        name_ar: '',
        position: 0,
        active: true,
        image: null,
        distinctive_mark_for_teacher_id: null,
      });
    }
    onClose();
  };

  const getTeacherName = (teacher: any) => {
    if (lang === 'ar' && teacher.name_ar) return teacher.name_ar;
    return teacher.name;
  };

  const getSelectedTeacherName = () => {
    if (formData.distinctive_mark_for_teacher_id) {
      const teacher = teachers.find(t => t.id === formData.distinctive_mark_for_teacher_id);
      return teacher ? getTeacherName(teacher) : null;
    }
    
    if (initialData?.distinctiveMarkForTeacherName && !formData.distinctive_mark_for_teacher_id) {
      return initialData.distinctiveMarkForTeacherName;
    }
    
    return null;
  };

  const isFromInitialData = () => {
    return initialData?.distinctiveMarkForTeacherName && 
           !formData.distinctive_mark_for_teacher_id;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {initialData
              ? (dir === 'rtl' ? 'تعديل المرحلة' : 'Edit Stage')
              : (dir === 'rtl' ? 'إضافة مرحلة جديدة' : 'Add New Stage')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'اسم المرحلة (عربي)' : 'Stage Name (Arabic)'}
            </Label>
            <Input
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              placeholder={dir === 'rtl' ? 'أدخل اسم المرحلة بالعربية' : 'Enter stage name in Arabic'}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'اسم المرحلة (إنجليزي)' : 'Stage Name (English)'}
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={dir === 'rtl' ? 'أدخل اسم المرحلة بالإنجليزية' : 'Enter stage name in English'}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'الترتيب' : 'Position'}
            </Label>
            <Input
              type="number"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              placeholder={dir === 'rtl' ? 'أدخل الترتيب' : 'Enter position'}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'المعلم المميز' : 'Distinctive Teacher'}
            </Label>
            
            {teachersLoading ? (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-sm text-gray-500">
                  {dir === 'rtl' ? 'جاري تحميل المدرسين...' : 'Loading teachers...'}
                </span>
              </div>
            ) : (
              <Select
                value={formData.distinctive_mark_for_teacher_id?.toString()}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    distinctive_mark_for_teacher_id: value && value !== '0' ? parseInt(value) : null,
                  });
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={dir === 'rtl' ? 'اختر المعلم...' : 'Select teacher...'}>
                    {getSelectedTeacherName()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    {dir === 'rtl' ? 'لا يوجد معلم' : 'No teacher'}
                  </SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {getTeacherName(teacher)}
                      {teacher.email && (
                        <span className="text-xs text-gray-400 ml-2">
                          ({teacher.email})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {isFromInitialData() && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <span>⚠️</span>
                {dir === 'rtl' 
                  ? `المعلم الحالي: ${initialData.distinctiveMarkForTeacherName}` 
                  : `Current teacher: ${initialData.distinctiveMarkForTeacherName}`}
              </p>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              {dir === 'rtl' 
                ? 'اختر المعلم الذي سيكون مميزاً لهذه المرحلة (اختياري)' 
                : 'Select the teacher who will be distinctive for this stage (optional)'}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'الحالة' : 'Status'}
            </Label>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {loading
                ? (dir === 'rtl' ? 'جاري الحفظ...' : 'Saving...')
                : (initialData
                    ? (dir === 'rtl' ? 'تحديث' : 'Update')
                    : (dir === 'rtl' ? 'إضافة' : 'Create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}