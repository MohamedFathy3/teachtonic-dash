/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/sections/AboutSection.tsx

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BaseSection } from './BaseSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FileUploader from '@/components/FileUploader';
import { Edit, Info, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AboutSectionProps {
  teacherId: number;
}

export function AboutSection({ teacherId }: AboutSectionProps) {
  const { lang } = useApp();
  const [about, setAbout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', name_ar: '', description: '', description_ar: '', image: undefined as number | undefined
  });

  const fetchAbout = async () => {
    setLoading(true);
    try {
      const response = await api.post('/about/index', { filter: { teacher_id: teacherId } });
      const aboutData = response.data?.data?.[0] || null;
      setAbout(aboutData);
    } catch (error) {
      console.error('Failed to fetch about:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) {
      fetchAbout();
    }
  }, [teacherId]);

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        name_ar: formData.name_ar,
        description: formData.description,
        description_ar: formData.description_ar,
        teacher_id: teacherId,
        ...(formData.image && { image: formData.image })
      };

      if (about?.id) {
        await api.patch(`/about/${about.id}`, payload);
        toast({ title: "Success", description: "About section updated" });
      } else {
        await api.post('/about', payload);
        toast({ title: "Success", description: "About section created" });
      }
      
      setDialogOpen(false);
      fetchAbout();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to save about section", variant: "destructive" });
    }
  };

  const openEdit = () => {
    if (about) {
      setFormData({
        name: about.name || '',
        name_ar: about.name_ar || '',
        description: about.description || '',
        description_ar: about.description_ar || '',
        image: about.image?.id || undefined
      });
    } else {
      setFormData({
        name: '', name_ar: '', description: '', description_ar: '', image: undefined
      });
    }
    setDialogOpen(true);
  };

  const getText = () => {
    if (!about) return 'No about section';
    if (lang === 'ar') return about.name_ar || about.name;
    return about.name;
  };

  const getDescription = () => {
    if (!about) return '';
    if (lang === 'ar') return about.description_ar || about.description;
    return about.description;
  };

  if (loading) {
    return (
      <BaseSection title="About Section" icon={<Info className="h-5 w-5 text-primary" />}>
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </BaseSection>
    );
  }

  return (
    <>
      <BaseSection
        title="About Section"
        icon={<Info className="h-5 w-5 text-primary" />}
        onAdd={!about ? openEdit : undefined}
      >
        {about ? (
          <div className="flex items-start justify-between p-4 rounded-lg bg-muted/30">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{getText()}</span>
                {about.active ? (
                  <Eye className="h-4 w-4 text-green-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">{getDescription()}</p>
              {about.image?.fullUrl && (
                <img src={about.image.fullUrl} alt={getText()} className="w-24 h-24 object-cover rounded-lg mt-3" />
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={openEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No about section added yet
            <Button variant="link" onClick={openEdit} className="ml-2">Add one</Button>
          </div>
        )}
      </BaseSection>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{about ? 'Edit About Section' : 'Add About Section'}</DialogTitle>
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
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} required />
              </div>
              <div>
                <Label>Description (AR)</Label>
                <Textarea value={formData.description_ar} onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })} rows={4} dir="rtl" />
              </div>
            </div>
            <div>
              <Label>About Image</Label>
              <FileUploader onUploadSuccess={(id) => setFormData({ ...formData, image: id })} multiple={false} />
              {about?.image?.fullUrl && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">Current image:</p>
                  <img src={about.image.fullUrl} alt="Current" className="w-16 h-16 object-cover rounded mt-1" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{about ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}