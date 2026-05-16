/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/subjects/SubjectForm.tsx

import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { subjectService } from '@/services/subject.service';
import { subjectToFormData } from '@/types/subject.types';
import type { SubjectFormData } from '@/types/subject.types';
import { Loader2 } from 'lucide-react';

interface SubjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SubjectFormData) => Promise<void>;
  subjectId?: number | null;
  loading?: boolean;
}

export function SubjectForm({ open, onClose, onSubmit, subjectId, loading }: SubjectFormProps) {
  const { dir, lang } = useApp();
  
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    name_ar: '',
    stage_id: 0,
    position: 0,
    active: true,
    image: null,
  });
  
  const [fetchingSubject, setFetchingSubject] = useState(false);

  useEffect(() => {
    const fetchSubjectData = async () => {
      if (!open) return;
      
      if (subjectId) {
        setFetchingSubject(true);
        try {
          const subject = await subjectService.getSubject(subjectId);
          const convertedData = subjectToFormData(subject);
          setFormData(convertedData);
        } catch (error) {
          console.error('Failed to fetch subject:', error);
        } finally {
          setFetchingSubject(false);
        }
      } else {
        setFormData({
          name: '',
          name_ar: '',
          stage_id: 0,
          position: 0,
          active: true,
          image: null,
        });
      }
    };

    fetchSubjectData();
  }, [subjectId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.stage_id || formData.stage_id === 0) {
      console.error('Stage is required');
      return;
    }
    
    await onSubmit(formData);
    if (!subjectId) {
      setFormData({
        name: '',
        name_ar: '',
        stage_id: 0,
        position: 0,
        active: true,
        image: null,
      });
    }
    onClose();
  };

  if (fetchingSubject) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2">Loading subject data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {subjectId
              ? (dir === 'rtl' ? 'تعديل المادة' : 'Edit Subject')
              : (dir === 'rtl' ? 'إضافة مادة جديدة' : 'Add New Subject')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 🔥 Stage Select with AsyncSelect */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'المرحلة' : 'Stage'} <span className="text-red-500">*</span>
            </Label>
            <AsyncSelect
              configKey="stages"
              value={formData.stage_id}
              onChange={(value) => setFormData({ ...formData, stage_id: value || 0 })}
              placeholder={dir === 'rtl' ? 'اختر المرحلة' : 'Select stage'}
              searchPlaceholder={dir === 'rtl' ? 'بحث عن مرحلة...' : 'Search stage...'}
              required
              perPageOptions={[10, 25, 50, 100]}
              defaultPerPage={25}
              showPagination
                 debounceDelay={500}        
  cacheData={true}          
  enableInfiniteScroll={false}
            />
          </div>

          {/* Subject Name Arabic */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'اسم المادة (عربي)' : 'Subject Name (Arabic)'}
            </Label>
            <Input
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              placeholder={dir === 'rtl' ? 'أدخل اسم المادة بالعربية' : 'Enter subject name in Arabic'}
              className="rounded-xl"
            />
          </div>

          {/* Subject Name English */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'اسم المادة (إنجليزي)' : 'Subject Name (English)'}
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={dir === 'rtl' ? 'أدخل اسم المادة بالإنجليزية' : 'Enter subject name in English'}
              className="rounded-xl"
              required
            />
          </div>

          {/* Position */}
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

          {/* Status Switch */}
          <div className="flex items-center justify-between">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'الحالة' : 'Status'}
            </Label>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
          </div>

          {/* Actions Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.stage_id} 
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              {loading
                ? (dir === 'rtl' ? 'جاري الحفظ...' : 'Saving...')
                : (subjectId
                    ? (dir === 'rtl' ? 'تحديث' : 'Update')
                    : (dir === 'rtl' ? 'إضافة' : 'Create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}