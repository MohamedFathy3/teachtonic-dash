/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/about/AboutForm.tsx

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import FileUploader from '@/components/FileUploader';
import { aboutService } from '@/services/about.service';
import { aboutToFormData } from '@/types/about.types';
import type { AboutFormData, About } from '@/types/about.types';
import { Loader2 } from 'lucide-react';

interface AboutFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AboutFormData) => Promise<void>;
  aboutId?: number | null;
  loading?: boolean;
}

export function AboutForm({ open, onClose, onSubmit, aboutId, loading }: AboutFormProps) {
  const { dir, lang } = useApp();
  
  const [formData, setFormData] = useState<AboutFormData>({
    name: '',
    description: '',
    name_ar: '',
    description_ar: '',
    teacher_id: 0,
    image: undefined,
    active: true,
  });
  
  const [currentAbout, setCurrentAbout] = useState<About | null>(null);
  const [fetchingAbout, setFetchingAbout] = useState(false);

  useEffect(() => {
    const fetchAboutData = async () => {
      if (!open) return;
      
      if (aboutId) {
        setFetchingAbout(true);
        try {
          const about = await aboutService.getAbout(aboutId);
          setCurrentAbout(about);
          const convertedData = aboutToFormData(about);
          setFormData(convertedData);
        } catch (error) {
          console.error('Failed to fetch about:', error);
        } finally {
          setFetchingAbout(false);
        }
      } else {
        setCurrentAbout(null);
        setFormData({
          name: '',
          description: '',
          name_ar: '',
          description_ar: '',
          teacher_id: 0,
          image: undefined,
          active: true,
        });
      }
    };

    fetchAboutData();
  }, [aboutId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teacher_id || formData.teacher_id === 0) {
      console.error('Teacher is required');
      return;
    }
    
    await onSubmit(formData);
    if (!aboutId) {
      setFormData({
        name: '',
        description: '',
        name_ar: '',
        description_ar: '',
        teacher_id: 0,
        image: undefined,
        active: true,
      });
    }
    onClose();
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: undefined }));
  };

  if (fetchingAbout) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2">Loading about section...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {aboutId
              ? (dir === 'rtl' ? 'تعديل قسم من نحن' : 'Edit About Section')
              : (dir === 'rtl' ? 'إضافة قسم من نحن' : 'Add About Section')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <Label>About Image</Label>
            <FileUploader
              label="Upload about image"
              onUploadSuccess={(id) => setFormData(prev => ({ ...prev, image: id }))}
              multiple={false}
              accept="image/*"
              maxFiles={1}
              defaultImageUrl={currentAbout?.image?.fullUrl}
              defaultImageId={currentAbout?.image?.id}
              onRemoveImage={handleRemoveImage}
            />
          </div>

          {/* Teacher Select */}
          <div className="space-y-2">
            <Label>
              {dir === 'rtl' ? 'المدرس' : 'Teacher'} <span className="text-red-500">*</span>
            </Label>
            <AsyncSelect
              configKey="teachers"
              value={formData.teacher_id}
              onChange={(value) => setFormData(prev => ({ ...prev, teacher_id: value || 0 }))}
              placeholder={dir === 'rtl' ? 'اختر المدرس' : 'Select teacher'}
              searchPlaceholder={dir === 'rtl' ? 'بحث عن مدرس...' : 'Search teacher...'}
              required
              perPageOptions={[10, 25, 50]}
              defaultPerPage={25}
            />
          </div>

          {/* English Fields */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-gray-500">English Content</h4>
            
            <div className="space-y-2">
              <Label>Name (EN)</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter about name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description (EN)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter about description"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Arabic Fields */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-gray-500">Arabic Content</h4>
            
            <div className="space-y-2">
              <Label>Name (AR)</Label>
              <Input
                value={formData.name_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                placeholder="أدخل اسم القسم"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description (AR)</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                placeholder="أدخل وصف القسم"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Status Switch */}
          <div className="flex items-center justify-between">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'الحالة' : 'Status'}
            </Label>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
          </div>

          {/* Actions Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.teacher_id} 
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              {loading
                ? (dir === 'rtl' ? 'جاري الحفظ...' : 'Saving...')
                : (aboutId
                    ? (dir === 'rtl' ? 'تحديث' : 'Update')
                    : (dir === 'rtl' ? 'إضافة' : 'Create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}