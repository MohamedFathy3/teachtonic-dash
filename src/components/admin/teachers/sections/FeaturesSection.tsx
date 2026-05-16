/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/sections/FeaturesSection.tsx

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BaseSection } from './BaseSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FileUploader from '@/components/FileUploader';
import { Edit, Trash2, Sparkles, Check, Eye, EyeOff } from 'lucide-react';
import { useWebsiteSection } from '@/hooks/useWebsiteSection';

interface FeaturesSectionProps {
  teacherId: number;
}

export function FeaturesSection({ teacherId }: FeaturesSectionProps) {
  const { lang } = useApp();
  const { items, loading, create, update, remove, refetch } = useWebsiteSection('feature', teacherId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', name_ar: '', description: '', description_ar: '', image: undefined as number | undefined
  });

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      name_ar: formData.name_ar,
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
    setFormData({ name: '', name_ar: '', description: '', description_ar: '', image: undefined });
    refetch();
  };

  const openEdit = (item?: any) => {
    if (item) {
      setEditing(item);
      setFormData({
        name: item.name || '',
        name_ar: item.name_ar || '',
        description: item.description || '',
        description_ar: item.description_ar || '',
        image: item.image?.id || undefined
      });
    } else {
      setEditing(null);
      setFormData({ name: '', name_ar: '', description: '', description_ar: '', image: undefined });
    }
    setDialogOpen(true);
  };

  const getText = (item: any) => {
    if (lang === 'ar') return item.name_ar || item.name;
    return item.name;
  };

  const itemsList = Array.isArray(items) ? items : [];

  return (
    <>
      <BaseSection
        title="Features"
        icon={<Sparkles className="h-5 w-5 text-primary" />}
        loading={loading}
        onAdd={() => openEdit()}
        emptyMessage="No features added yet"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {itemsList.map((item: any, index: number) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{getText(item)}</span>
                  {item.active ? (
                    <Eye className="h-3 w-3 text-green-500" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Feature' : 'Add Feature'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name (EN)</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label>Name (AR)</Label>
                <Input value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} dir="rtl" />
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
              <Label>Feature Image/Icon</Label>
              <FileUploader onUploadSuccess={(id) => setFormData({ ...formData, image: id })} multiple={false} />
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