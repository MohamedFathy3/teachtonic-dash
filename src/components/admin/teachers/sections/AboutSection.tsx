/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Edit, Info, Trash2, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AboutSectionProps {
  teacherId: number;
}

const emptyForm = {
  name: '',
  name_ar: '',
  description: '',
  description_ar: '',
  facebook_meta: '',
  google_meta: '',
  tiktok_meta: '',
  you_tube_meta: '',
  image: undefined as number | undefined,
};

export function AboutSection({ teacherId }: AboutSectionProps) {
  const { lang } = useApp();
  const [abouts, setAbouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAbout, setEditingAbout] = useState<any>(null); // null = create
  const [formData, setFormData] = useState(emptyForm);

  const fetchAbouts = async () => {
    setLoading(true);
    try {
      const response = await api.post('/about/index', {
        filter: { teacher_id: teacherId },
      });
      setAbouts(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch abouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) fetchAbouts();
  }, [teacherId]);

  const handleDelete = async (about: any) => {
    if (!about?.id) return;
    try {
      await sectionService.delete('about', about.id);
      toast({ title: 'Success', description: 'About section deleted successfully' });
      fetchAbouts();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        name_ar: formData.name_ar,
        description: formData.description,
        description_ar: formData.description_ar,
        facebook_meta: formData.facebook_meta,
        google_meta: formData.google_meta,
        tiktok_meta: formData.tiktok_meta,
        you_tube_meta: formData.you_tube_meta,
        teacher_id: teacherId,
        ...(formData.image && { image: formData.image }),
      };

      if (editingAbout?.id) {
        await api.patch(`/about/${editingAbout.id}`, payload);
        toast({ title: 'Success', description: 'About section updated' });
      } else {
        await api.post('/about', payload);
        toast({ title: 'Success', description: 'About section created' });
      }

      setDialogOpen(false);
      setEditingAbout(null);
      fetchAbouts();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to save about section', variant: 'destructive' });
    }
  };

  const openCreate = () => {
    setEditingAbout(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (about: any) => {
    setEditingAbout(about);
    setFormData({
      name: about.name || '',
      name_ar: about.name_ar || '',
      description: about.description || '',
      description_ar: about.description_ar || '',
      facebook_meta: about.facebook_meta || '',
      google_meta: about.google_meta || '',
      tiktok_meta: about.tiktok_meta || '',
      you_tube_meta: about.you_tube_meta || '',
      image: about.image?.id || undefined,
    });
    setDialogOpen(true);
  };

  const field = (key: keyof typeof emptyForm) => ({
    value: formData[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData(prev => ({ ...prev, [key]: e.target.value })),
  });

  const getText = (about: any) =>
    lang === 'ar' ? about.name_ar || about.name : about.name;

  const getDescription = (about: any) =>
    lang === 'ar' ? about.description_ar || about.description : about.description;

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
        title={`About Section (${abouts.length})`}
        icon={<Info className="h-5 w-5 text-primary" />}
        onAdd={openCreate}  // ✅ دايمًا ممكن تضيف جديد
      >
        <div className="space-y-3">
          {abouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed">
              <Info className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No about section added yet</p>
              <Button variant="link" onClick={openCreate} className="mt-1">
                Add About Section
              </Button>
            </div>
          ) : (
            abouts.map((about) => (
              <div
                key={about.id}
                className="group flex items-center justify-between gap-5 p-5 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4 flex-1">
                  {about.image?.fullUrl ? (
                    about.image.fullUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i) ? (
                      <video
                        src={about.image.fullUrl}
                        className="w-20 h-20 rounded-xl object-cover border"
                        controls
                      />
                    ) : (
                      <img
                        src={about.image.fullUrl}
                        alt={getText(about)}
                        className="w-20 h-20 rounded-xl object-cover border"
                      />
                    )
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                      <Info className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <h3 className="text-lg font-semibold">{getText(about)}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {getDescription(about)}
                    </p>

                    {/* Meta badges */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {about.facebook_meta && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                          FB: {about.facebook_meta.substring(0, 20)}...
                        </span>
                      )}
                      {about.google_meta && (
                        <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                          G: {about.google_meta.substring(0, 20)}...
                        </span>
                      )}
                      {about.tiktok_meta && (
                        <span className="text-xs bg-gray-50 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
                          TT: {about.tiktok_meta.substring(0, 20)}...
                        </span>
                      )}
                      {about.you_tube_meta && (
                        <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">
                          YT: {about.you_tube_meta.substring(0, 20)}...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(about)}
                    className="hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(about)}
                    className="hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </BaseSection>

      {/* DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingAbout(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAbout ? 'Edit About Section' : 'Add About Section'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* NAME */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name (EN)</Label>
                <Input {...field('name')} />
              </div>
              <div>
                <Label>Name (AR)</Label>
                <Input {...field('name_ar')} dir="rtl" />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (EN)</Label>
                <Textarea rows={4} {...field('description')} />
              </div>
              <div>
                <Label>Description (AR)</Label>
                <Textarea rows={4} dir="rtl" {...field('description_ar')} />
              </div>
            </div>

            {/* META FIELDS */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm text-gray-500">Meta / Social</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Facebook Meta</Label>
                  <Textarea rows={2} {...field('facebook_meta')} placeholder="Facebook meta description" className="resize-none" />
                </div>
                <div>
                  <Label>Google Meta</Label>
                  <Textarea rows={2} {...field('google_meta')} placeholder="Google meta description" className="resize-none" />
                </div>
                <div>
                  <Label>TikTok Meta</Label>
                  <Textarea rows={2} {...field('tiktok_meta')} placeholder="TikTok meta description" className="resize-none" />
                </div>
                <div>
                  <Label>YouTube Meta</Label>
                  <Textarea rows={2} {...field('you_tube_meta')} placeholder="YouTube meta description" className="resize-none" />
                </div>
              </div>
            </div>

            {/* IMAGE/VIDEO */}
            <div>
              <Label>Media (Image or Video)</Label>
              <FileUploader
                onUploadSuccess={(id) => setFormData(prev => ({ ...prev, image: id }))}
                multiple={false}
                accept="image/*,video/*"
                maxVideoSize={50}
                label="Upload Image or Video"
                defaultImageUrl={editingAbout?.image?.fullUrl}
                defaultImageId={editingAbout?.image?.id}
                onRemoveImage={() => setFormData(prev => ({ ...prev, image: undefined }))}
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingAbout ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}