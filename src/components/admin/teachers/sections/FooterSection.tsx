/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/sections/FooterSection.tsx

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BaseSection } from './BaseSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Layout, Check, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { useWebsiteSection } from '@/hooks/useWebsiteSection';

interface FooterSectionProps {
  teacherId: number;
}

export function FooterSection({ teacherId }: FooterSectionProps) {
  const { lang } = useApp();
  const { items, loading, create, update, remove, refetch } = useWebsiteSection('footer', teacherId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', name_ar: '', description: '', description_ar: '',
    facebook_link: '', youtube_link: '', instagram_link: '', tiktok_link: '', whatsapp_link: ''
  });

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      name_ar: formData.name_ar,
      description: formData.description,
      description_ar: formData.description_ar,
      facebook_link: formData.facebook_link || null,
      youtube_link: formData.youtube_link || null,
      instagram_link: formData.instagram_link || null,
      tiktok_link: formData.tiktok_link || null,
      whatsapp_link: formData.whatsapp_link || null,
      teacher_id: teacherId,
    };

    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
    setDialogOpen(false);
    setEditing(null);
    setFormData({
      name: '', name_ar: '', description: '', description_ar: '',
      facebook_link: '', youtube_link: '', instagram_link: '', tiktok_link: '', whatsapp_link: ''
    });
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
        facebook_link: item.facebook_link || '',
        youtube_link: item.youtube_link || '',
        instagram_link: item.instagram_link || '',
        tiktok_link: item.tiktok_link || '',
        whatsapp_link: item.whatsapp_link || ''
      });
    } else {
      setEditing(null);
      setFormData({
        name: '', name_ar: '', description: '', description_ar: '',
        facebook_link: '', youtube_link: '', instagram_link: '', tiktok_link: '', whatsapp_link: ''
      });
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
        title="Footer Sections"
        icon={<Layout className="h-5 w-5 text-primary" />}
        loading={loading}
        onAdd={() => openEdit()}
        emptyMessage="No footer sections added yet"
      >
        <div className="space-y-3">
          {itemsList.map((item: any) => (
            <div key={item.id} className="flex items-start justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{getText(item)}</span>
                  {item.active ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                <div className="flex gap-3 mt-2">
                
                </div>
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
            <DialogTitle>{editing ? 'Edit Footer Section' : 'Add Footer Section'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Section Name (EN)</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label>Section Name (AR)</Label>
                <Input value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (EN)</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Description (AR)</Label>
                <Textarea value={formData.description_ar} onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })} rows={3} dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Facebook Link</Label>
                <Input value={formData.facebook_link} onChange={(e) => setFormData({ ...formData, facebook_link: e.target.value })} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <Label>YouTube Link</Label>
                <Input value={formData.youtube_link} onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })} placeholder="https://youtube.com/..." />
              </div>
              <div>
                <Label>Instagram Link</Label>
                <Input value={formData.instagram_link} onChange={(e) => setFormData({ ...formData, instagram_link: e.target.value })} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <Label>TikTok Link</Label>
                <Input value={formData.tiktok_link} onChange={(e) => setFormData({ ...formData, tiktok_link: e.target.value })} placeholder="https://tiktok.com/..." />
              </div>
              <div>
                <Label>WhatsApp Link</Label>
                <Input value={formData.whatsapp_link} onChange={(e) => setFormData({ ...formData, whatsapp_link: e.target.value })} placeholder="https://wa.me/..." />
              </div>
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