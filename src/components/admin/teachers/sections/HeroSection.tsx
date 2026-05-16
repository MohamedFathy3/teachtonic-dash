/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/sections/HeroSection.tsx

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BaseSection } from './BaseSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FileUploader from '@/components/FileUploader';
import { Edit, Trash2, Globe, Check, Eye, EyeOff } from 'lucide-react';
import { useWebsiteSection } from '@/hooks/useWebsiteSection';

interface HeroSectionProps {
  teacherId: number;
}

export function HeroSection({ teacherId }: HeroSectionProps) {
  const { lang } = useApp();
  const { items, loading, create, update, remove, refetch } = useWebsiteSection('home', teacherId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', title_ar: '', sub_title: '', sub_title_ar: '',
    description: '', description_ar: '', image: undefined as number | undefined
  });

  const handleSubmit = async () => {
    const payload = {
      title: formData.title,
      title_ar: formData.title_ar,
      sub_title: formData.sub_title,
      sub_title_ar: formData.sub_title_ar,
      description: formData.description,
      description_ar: formData.description_ar,
      teacher_id: teacherId,
      ...(formData.image && { image: formData.image })
    };

    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
    setDialogOpen(false);
    setEditing(null);
    setFormData({ title: '', title_ar: '', sub_title: '', sub_title_ar: '', description: '', description_ar: '', image: undefined });
    refetch();
  };

  const openEdit = (item?: any) => {
    if (item) {
      setEditing(item);
      setFormData({
        title: item.title || '',
        title_ar: item.title_ar || '',
        sub_title: item.sub_title || '',
        sub_title_ar: item.sub_title_ar || '',
        description: item.description || '',
        description_ar: item.description_ar || '',
        image: item.image?.id || undefined
      });
    } else {
      setEditing(null);
      setFormData({ title: '', title_ar: '', sub_title: '', sub_title_ar: '', description: '', description_ar: '', image: undefined });
    }
    setDialogOpen(true);
  };

  const getText = (item: any) => {
    if (lang === 'ar') return item.title_ar || item.title;
    return item.title;
  };

  const itemsList = Array.isArray(items) ? items : [];

  return (
    <>
      <BaseSection
        title="Hero Sections"
        icon={<Globe className="h-5 w-5 text-primary" />}
        loading={loading}
        onAdd={() => openEdit()}
        emptyMessage="No hero sections added yet"
      >
        <div className="space-y-3">
          {itemsList.map((item: any) => (
            <div key={item.id} className="flex items-start justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{getText(item)}</span>
                  {item.active ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{item.sub_title}</p>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                {item.image?.fullUrl && (
                  <img src={item.image.fullUrl} alt={getText(item)} className="w-20 h-20 object-cover rounded-lg mt-2" />
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(item.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </BaseSection>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Hero Section' : 'Add Hero Section'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (EN)</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label>Title (AR)</Label>
                <Input value={formData.title_ar} onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })} dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sub Title (EN)</Label>
                <Input value={formData.sub_title} onChange={(e) => setFormData({ ...formData, sub_title: e.target.value })} required />
              </div>
              <div>
                <Label>Sub Title (AR)</Label>
                <Input value={formData.sub_title_ar} onChange={(e) => setFormData({ ...formData, sub_title_ar: e.target.value })} dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (EN)</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} required />
              </div>
              <div>
                <Label>Description (AR)</Label>
                <Textarea value={formData.description_ar} onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })} rows={3} dir="rtl" />
              </div>
            </div>
            <div>
              <Label>Hero Image</Label>
              <FileUploader onUploadSuccess={(id) => setFormData({ ...formData, image: id })} multiple={false} />
              {formData.image && <p className="text-xs text-green-600 mt-1">Image uploaded, ID: {formData.image}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}