/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/hero/HeroForm.tsx

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
import { heroService } from '@/services/hero.service';
import { heroToFormData } from '@/types/hero.types';
import type { HeroFormData, Hero } from '@/types/hero.types';
import { Loader2 } from 'lucide-react';

interface HeroFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HeroFormData) => Promise<void>;
  heroId?: number | null;
  loading?: boolean;
}

export function HeroForm({ open, onClose, onSubmit, heroId, loading }: HeroFormProps) {
  const { dir, lang } = useApp();
  
  const [formData, setFormData] = useState<HeroFormData>({
    title: '',
    sub_title: '',
    description: '',
    title_ar: '',
    sub_title_ar: '',
    description_ar: '',
    teacher_id: 0,
    image: undefined,
    active: true,
  });
  
  const [currentHero, setCurrentHero] = useState<Hero | null>(null);
  const [fetchingHero, setFetchingHero] = useState(false);

  useEffect(() => {
    const fetchHeroData = async () => {
      if (!open) return;
      
      if (heroId) {
        setFetchingHero(true);
        try {
          const hero = await heroService.getHero(heroId);
          setCurrentHero(hero);
          const convertedData = heroToFormData(hero);
          setFormData(convertedData);
        } catch (error) {
          console.error('Failed to fetch hero:', error);
        } finally {
          setFetchingHero(false);
        }
      } else {
        setCurrentHero(null);
        setFormData({
          title: '',
          sub_title: '',
          description: '',
          title_ar: '',
          sub_title_ar: '',
          description_ar: '',
          teacher_id: 0,
          image: undefined,
          active: true,
        });
      }
    };

    fetchHeroData();
  }, [heroId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teacher_id || formData.teacher_id === 0) {
      console.error('Teacher is required');
      return;
    }
    
    await onSubmit(formData);
    if (!heroId) {
      setFormData({
        title: '',
        sub_title: '',
        description: '',
        title_ar: '',
        sub_title_ar: '',
        description_ar: '',
        teacher_id: 0,
        image: undefined,
        active: true,
      });
    }
    onClose();
  };

  // 🔥 دالة إزالة الصورة
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: undefined }));
  };

  if (fetchingHero) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2">Loading hero data...</span>
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
            {heroId
              ? (dir === 'rtl' ? 'تعديل قسم البطل' : 'Edit Hero Section')
              : (dir === 'rtl' ? 'إضافة قسم بطل جديد' : 'Add New Hero Section')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload - مع دعم الصورة الحالية */}
          <div>
            <Label>Hero Image</Label>
            <FileUploader
              label="Upload hero image"
              onUploadSuccess={(id) => setFormData(prev => ({ ...prev, image: id }))}
              multiple={false}
              accept="image/*"
              maxFiles={1}
              // 🔥 تمرير الصورة الحالية
              defaultImageUrl={currentHero?.image?.fullUrl}
              defaultImageId={currentHero?.image?.id}
              onRemoveImage={handleRemoveImage}
            />
            {!currentHero?.image && formData.image && !heroId && (
              <p className="text-xs text-green-600 mt-1">✓ Image ready to upload</p>
            )}
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
              <Label>Title (EN)</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter hero title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Sub Title (EN)</Label>
              <Input
                value={formData.sub_title}
                onChange={(e) => setFormData(prev => ({ ...prev, sub_title: e.target.value }))}
                placeholder="Enter hero sub title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description (EN)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter hero description"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Arabic Fields */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-gray-500">Arabic Content</h4>
            
            <div className="space-y-2">
              <Label>Title (AR)</Label>
              <Input
                value={formData.title_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                placeholder="أدخل عنوان القسم"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Sub Title (AR)</Label>
              <Input
                value={formData.sub_title_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, sub_title_ar: e.target.value }))}
                placeholder="أدخل العنوان الفرعي"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description (AR)</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                placeholder="أدخل الوصف"
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
                : (heroId
                    ? (dir === 'rtl' ? 'تحديث' : 'Update')
                    : (dir === 'rtl' ? 'إضافة' : 'Create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}