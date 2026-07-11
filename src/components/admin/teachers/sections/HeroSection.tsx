/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/sections/HeroSection.tsx

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BaseSection } from './BaseSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FileUploader from '@/components/FileUploader';
import { Edit, Trash2, Globe, Check, Eye, EyeOff } from 'lucide-react';
import { useWebsiteSection } from '@/hooks/useWebsiteSection';
import { RichTextEditor } from '@/components/ui/RichTextEditor'; // ✅ إضافة الاستيراد

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
    if (!item) return '';
    if (lang === 'ar') return item.title_ar || item.title || '';
    return item.title || '';
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
          {itemsList
            .filter((item: any) => item != null)
            .map((item: any) => (
              <div
                key={item.id}
                className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* IMAGE */}
                <div className="shrink-0">
                  {item.image?.fullUrl ? (
                    <img
                      src={item.image.fullUrl}
                      alt={getText(item)}
                      className="h-20 w-20 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* TITLE + STATUS */}
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base truncate">
                      {getText(item)}
                    </h3>

                    {item?.active ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  {/* SUB TITLE */}
                  <p className="text-sm text-muted-foreground truncate">
                    {item.sub_title || 'No subtitle'}
                  </p>

                  {/* DESCRIPTION */}
                  <div 
                    className="text-xs text-muted-foreground line-clamp-2"
                    dangerouslySetInnerHTML={{ 
                      __html: item.description || 'No description' 
                    }} 
                  />
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEdit(item)}
                    className="hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => remove(item.id)}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
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
                {/* ✅ استبدل Textarea بـ RichTextEditor */}
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Write description in English..."
                  minHeight="150px"
                  label=""
                />
              </div>
              <div>
                <Label>Description (AR)</Label>
                {/* ✅ استبدل Textarea بـ RichTextEditor للغة العربية */}
                <RichTextEditor
                  value={formData.description_ar}
                  onChange={(value) => setFormData({ ...formData, description_ar: value })}
                  placeholder="اكتب الوصف بالعربية..."
                  minHeight="150px"
                  label=""
                />
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