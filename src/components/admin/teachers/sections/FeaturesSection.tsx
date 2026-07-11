/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BaseSection } from './BaseSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FileUploader from '@/components/FileUploader';
import { Edit, Trash2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useWebsiteSection } from '@/hooks/useWebsiteSection';
import { RichTextEditor } from '@/components/ui/RichTextEditor'; // ✅ إضافة الاستيراد

export function FeaturesSection({ teacherId }: { teacherId: number }) {
  const { lang } = useApp();
  const { items, loading, create, update, remove, refetch } =
    useWebsiteSection('feature', teacherId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    image: undefined as number | undefined,
    imageUrl: '',
  });

  // ✅ SAFE TEXT
  const getText = (item: any) => {
    if (!item) return '';
    return lang === 'ar'
      ? item.name_ar || item.name || ''
      : item.name || '';
  };

  // ✅ SAFE DESCRIPTION
  const getDescription = (item: any) => {
    if (!item) return '';
    return lang === 'ar'
      ? item.description_ar || item.description || ''
      : item.description || '';
  };

  // ✅ SAFE IMAGE
  const getImage = (item: any) => {
    if (!item?.image) return null;
    if (typeof item.image === 'object') {
      return item.image.fullUrl || item.image.url;
    }
    return null;
  };

  const itemsList = Array.isArray(items) ? items.filter(Boolean) : [];

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      name_ar: formData.name_ar,
      description: formData.description,
      description_ar: formData.description_ar,
      teacher_id: teacherId,
      ...(formData.image && { image: formData.image }),
    };

    if (editing) await update(editing.id, payload);
    else await create(payload);

    setDialogOpen(false);
    setEditing(null);
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      image: undefined,
      imageUrl: '',
    });

    refetch();
  };

  const openEdit = (item?: any) => {
    if (item) {
      setEditing(item);
      setFormData({
        name: item?.name || '',
        name_ar: item?.name_ar || '',
        description: item?.description || '',
        description_ar: item?.description_ar || '',
        image: item?.image?.id || undefined,
        imageUrl: item?.image?.fullUrl || ''
      });
    } else {
      setEditing(null);
      setFormData({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        image: undefined,
        imageUrl: ''
      });
    }

    setDialogOpen(true);
  };

  return (
    <>
      <BaseSection
        title="Features"
        icon={<Sparkles className="h-5 w-5 text-primary" />}
        loading={loading}
        onAdd={() => openEdit()}
        emptyMessage="No features added yet"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {itemsList.map((item: any, index: number) => (
            <div
              key={item?.id || index}
              className="group relative flex flex-col gap-3 p-4 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all"
            >

              {/* TOP ROW */}
              <div className="flex items-start justify-between">

                {/* NUMBER BADGE */}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {index + 1}
                </div>

                {/* STATUS */}
                {item?.active ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <Eye className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                    <EyeOff className="h-3 w-3" /> Hidden
                  </span>
                )}
              </div>

              {/* TITLE */}
              <h3 className="font-semibold text-base">
                {getText(item)}
              </h3>

              {/* DESCRIPTION - ✅ استخدام dangerouslySetInnerHTML لعرض المحتوى الغني */}
              <div 
                className="text-sm text-muted-foreground line-clamp-3"
                dangerouslySetInnerHTML={{ 
                  __html: getDescription(item) || 'No description' 
                }} 
              />

              {/* IMAGE */}
              {getImage(item) && (
                <img
                  src={getImage(item)}
                  className="w-full h-32 object-cover rounded-xl border mt-1"
                />
              )}

              {/* ACTIONS (HOVER ONLY) */}
              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(item)}
                  className="hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(item.id)}
                  className="hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>

              </div>
            </div>
          ))}

        </div>
      </BaseSection>

      {/* DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">

          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Feature' : 'Add Feature'}
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
                  dir="rtl"
                  value={formData.name_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, name_ar: e.target.value })
                  }
                />
              </div>
            </div>

            {/* DESCRIPTION - ✅ استبدال Textarea بـ RichTextEditor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (EN)</Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Write feature description in English..."
                  minHeight="120px"
                  label=""
                />
              </div>

              <div>
                <Label>Description (AR)</Label>
                <RichTextEditor
                  value={formData.description_ar}
                  onChange={(value) => setFormData({ ...formData, description_ar: value })}
                  placeholder="اكتب وصف الميزة بالعربية..."
                  minHeight="120px"
                  label=""
                />
              </div>
            </div>

            {/* IMAGE */}
            <div>
              <Label>Feature Image/Icon</Label>

              <FileUploader
                onUploadSuccess={(id) =>
                  setFormData({ ...formData, image: id })
                }
                multiple={false}
              />

              {formData.imageUrl && (
                <div className="mt-3">
                  <img
                    src={formData.imageUrl}
                    className="w-20 h-20 rounded-xl object-cover border"
                  />
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-3 border-t">

              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleSubmit}>
                {editing ? 'Update' : 'Create'}
              </Button>

            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}