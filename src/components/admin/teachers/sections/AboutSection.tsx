/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/sections/AboutSection.tsx
import { sectionService } from '@/services/website.service';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BaseSection } from './BaseSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FileUploader from '@/components/FileUploader';
import { Edit, Info, Check, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react';
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

  const handleDelete = async () => {
    if (!about?.id) return;

    try {
      await sectionService.delete('about', about.id);

      setAbout(null);
      toast({
        title: "Success",
        description: "About section deleted successfully"
      });

    } catch (error) {
      console.error(error);
    }
  };

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
          <div className="group flex items-center justify-between gap-5 p-5 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-4 flex-1">

              {/* IMAGE */}
              {about.image?.fullUrl ? (
                <img
                  src={about.image.fullUrl}
                  alt={getText()}
                  className="w-20 h-20 rounded-xl object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                  <Info className="w-5 h-5 text-muted-foreground" />
                </div>
              )}

              {/* CONTENT */}
              <div className="flex-1 space-y-1">

                {/* TITLE + STATUS */}
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {getText()}
                  </h3>

                  {/*    {about.active ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <Eye className="w-4 h-4" /> Active
                    </span>
             ) : (
                    <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                      <EyeOff className="w-4 h-4" /> Hidden
                    </span>
                  )} */}
                </div>

                {/* DESCRIPTION */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {getDescription()}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition">

              <Button
                variant="ghost"
                size="icon"
                onClick={openEdit}
                className="hover:bg-blue-50"
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed">
            <Info className="h-10 w-10 text-muted-foreground mb-2" />

            <p className="text-muted-foreground text-sm">
              No about section added yet
            </p>

            <Button
              variant="link"
              onClick={openEdit}
              className="mt-1"
            >
              Add About Section
            </Button>
          </div>
        )}
      </BaseSection>

      {/* DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">

          <DialogHeader>
            <DialogTitle>
              {about ? 'Edit About Section' : 'Add About Section'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">

            {/* NAME */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name (EN)</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Name (AR)</Label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, name_ar: e.target.value })
                  }
                  dir="rtl"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (EN)</Label>
                <Textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Description (AR)</Label>
                <Textarea
                  rows={4}
                  dir="rtl"
                  value={formData.description_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, description_ar: e.target.value })
                  }
                />
              </div>
            </div>

            {/* IMAGE */}
            <div>
              <Label>About Image</Label>
              <FileUploader
                onUploadSuccess={(id) =>
                  setFormData({ ...formData, image: id })
                }
                multiple={false}
              />

              {about?.image?.fullUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={about.image.fullUrl}
                    className="w-14 h-14 rounded-lg object-cover border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Current image
                  </p>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2 border-t">

              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleSubmit}>
                {about ? 'Update' : 'Create'}
              </Button>

            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}