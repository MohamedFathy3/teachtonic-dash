/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/features/FeatureForm.tsx

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
import { featureService } from '@/services/feature.service';
import { featureToFormData } from '@/types/feature.types';
import type { FeatureFormData, Feature } from '@/types/feature.types';
import { Loader2 } from 'lucide-react';

interface FeatureFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FeatureFormData) => Promise<void>;
  featureId?: number | null;
  loading?: boolean;
}

export function FeatureForm({ open, onClose, onSubmit, featureId, loading }: FeatureFormProps) {
  const { dir, lang } = useApp();
  
  const [formData, setFormData] = useState<FeatureFormData>({
    name: '',
    description: '',
    name_ar: '',
    description_ar: '',
    teacher_id: 0,
    image: undefined,
    active: true,
  });
  
  const [currentFeature, setCurrentFeature] = useState<Feature | null>(null);
  const [fetchingFeature, setFetchingFeature] = useState(false);

  useEffect(() => {
    const fetchFeatureData = async () => {
      if (!open) return;
      
      if (featureId) {
        setFetchingFeature(true);
        try {
          const feature = await featureService.getFeature(featureId);
          setCurrentFeature(feature);
          const convertedData = featureToFormData(feature);
          setFormData(convertedData);
        } catch (error) {
          console.error('Failed to fetch feature:', error);
        } finally {
          setFetchingFeature(false);
        }
      } else {
        setCurrentFeature(null);
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

    fetchFeatureData();
  }, [featureId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teacher_id || formData.teacher_id === 0) {
      console.error('Teacher is required');
      return;
    }
    
    await onSubmit(formData);
    if (!featureId) {
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

  if (fetchingFeature) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2">Loading feature data...</span>
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
            {featureId
              ? (dir === 'rtl' ? 'تعديل الميزة' : 'Edit Feature')
              : (dir === 'rtl' ? 'إضافة ميزة جديدة' : 'Add New Feature')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <Label>Feature Image</Label>
            <FileUploader
              label="Upload feature image"
              onUploadSuccess={(id) => setFormData(prev => ({ ...prev, image: id }))}
              multiple={false}
              accept="image/*"
              maxFiles={1}
              defaultImageUrl={currentFeature?.image?.fullUrl}
              defaultImageId={currentFeature?.image?.id}
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
                placeholder="Enter feature name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description (EN)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter feature description"
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
                placeholder="أدخل اسم الميزة"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description (AR)</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                placeholder="أدخل وصف الميزة"
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
                : (featureId
                    ? (dir === 'rtl' ? 'تحديث' : 'Update')
                    : (dir === 'rtl' ? 'إضافة' : 'Create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}