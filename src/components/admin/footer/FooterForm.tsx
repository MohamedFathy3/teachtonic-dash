/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/footer/FooterForm.tsx

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import { footerService } from '@/services/footer.service';
import { footerToFormData } from '@/types/footer.types';
import type { FooterFormData, Footer } from '@/types/footer.types';
import { Loader2, Phone, Link2 } from 'lucide-react';

// 🔥 أيقونات مخصصة 100% (مش من lucide-react)
const FacebookIcon = () => (
  <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.066 0 12 0 12s0 3.934.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.934 24 12 24 12s0-3.934-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-4 w-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
  </svg>
);

interface FooterFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FooterFormData) => Promise<void>;
  footerId?: number | null;
  loading?: boolean;
}

export function FooterForm({ open, onClose, onSubmit, footerId, loading }: FooterFormProps) {
  const { dir, lang } = useApp();
  
  const [formData, setFormData] = useState<FooterFormData>({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    facebook_link: '',
    youtube_link: '',
    instagram_link: '',
    tiktok_link: '',
    whatsapp_link: '',
    teacher_id: 0,
    active: true,
  });
  
  const [currentFooter, setCurrentFooter] = useState<Footer | null>(null);
  const [fetchingFooter, setFetchingFooter] = useState(false);

  useEffect(() => {
    const fetchFooterData = async () => {
      if (!open) return;
      
      if (footerId) {
        setFetchingFooter(true);
        try {
          const footer = await footerService.getFooter(footerId);
          setCurrentFooter(footer);
          const convertedData = footerToFormData(footer);
          setFormData(convertedData);
        } catch (error) {
          console.error('Failed to fetch footer:', error);
        } finally {
          setFetchingFooter(false);
        }
      } else {
        setCurrentFooter(null);
        setFormData({
          name: '',
          name_ar: '',
          description: '',
          description_ar: '',
          facebook_link: '',
          youtube_link: '',
          instagram_link: '',
          tiktok_link: '',
          whatsapp_link: '',
          teacher_id: 0,
          active: true,
        });
      }
    };

    fetchFooterData();
  }, [footerId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teacher_id || formData.teacher_id === 0) {
      console.error('Teacher is required');
      return;
    }
    
    await onSubmit(formData);
    if (!footerId) {
      setFormData({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        facebook_link: '',
        youtube_link: '',
        instagram_link: '',
        tiktok_link: '',
        whatsapp_link: '',
        teacher_id: 0,
        active: true,
      });
    }
    onClose();
  };

  if (fetchingFooter) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2">Loading footer section...</span>
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
            {footerId
              ? (dir === 'rtl' ? 'تعديل قسم التذييل' : 'Edit Footer Section')
              : (dir === 'rtl' ? 'إضافة قسم تذييل جديد' : 'Add Footer Section')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter footer name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description (EN)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter footer description"
                rows={2}
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
                rows={2}
              />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-gray-500">Social Media Links</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FacebookIcon />
                  Facebook Link
                </Label>
                <Input
                  value={formData.facebook_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, facebook_link: e.target.value }))}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <YoutubeIcon />
                  YouTube Link
                </Label>
                <Input
                  value={formData.youtube_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtube_link: e.target.value }))}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <InstagramIcon />
                  Instagram Link
                </Label>
                <Input
                  value={formData.instagram_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram_link: e.target.value }))}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TikTokIcon />
                  TikTok Link
                </Label>
                <Input
                  value={formData.tiktok_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, tiktok_link: e.target.value }))}
                  placeholder="https://tiktok.com/..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  WhatsApp Link
                </Label>
                <Input
                  value={formData.whatsapp_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_link: e.target.value }))}
                  placeholder="https://wa.me/..."
                />
              </div>
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
                : (footerId
                    ? (dir === 'rtl' ? 'تحديث' : 'Update')
                    : (dir === 'rtl' ? 'إضافة' : 'Create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}