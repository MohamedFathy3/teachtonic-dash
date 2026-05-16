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
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        name_ar: initialData.name_ar || '',
        position: initialData.position,
        active: initialData.active,
        image: null,
      });
    } else {
      setFormData({
        name: '',
        name_ar: '',
        position: 0,
        active: true,
        image: null,
      });
    }
  }, [initialData]);

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
      });
    }
    onClose();
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