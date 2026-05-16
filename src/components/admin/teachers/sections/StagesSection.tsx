/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/sections/StagesSection.tsx
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BaseSection } from './BaseSection';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Layers, Image as ImageIcon, Check } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import FileUploader from '@/components/FileUploader';

interface StagesSectionProps {
  stages: any[];
  teacherId: number;
}

export function StagesSection({ stages, teacherId }: StagesSectionProps) {
  const { lang } = useApp();
  const [localStages, setLocalStages] = useState(stages);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<any>(null);
  const [imageId, setImageId] = useState<number | undefined>();

  const getStageName = (stage: any) => {
    if (!stage) return 'Unknown Stage';
    if (lang === 'ar' && stage.name_ar) return stage.name_ar;
    return stage.name || `Stage ${stage.id}`;
  };

  const handleUpdateImage = async (stageId: number) => {
    if (!imageId) {
      toast({ title: "Error", description: "Please upload an image first", variant: "destructive" });
      return;
    }
    
    try {
      await api.patch(`/stage/${stageId}`, { image: imageId, teacher_id: teacherId });
      setLocalStages(prev => prev.map(s => 
        s.id === stageId ? { ...s, image: { ...s.image, id: imageId } } : s
      ));
      toast({ title: "Success", description: "Stage image updated" });
      setDialogOpen(false);
      setEditingStage(null);
      setImageId(undefined);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update stage image", variant: "destructive" });
    }
  };

  if (!localStages || localStages.length === 0) {
    return (
      <BaseSection
        title="Stages"
        icon={<Layers className="h-5 w-5 text-primary" />}
        emptyMessage="No stages assigned to this teacher"
      />
    );
  }

  return (
    <>
      <BaseSection
        title="Stages"
        icon={<Layers className="h-5 w-5 text-primary" />}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {localStages.map((stage) => (
            <Card key={stage.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                  {stage.image?.fullUrl ? (
                    <img src={stage.image.fullUrl} alt={getStageName(stage)} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{getStageName(stage)}</h4>
                    {stage.active && <Check className="h-3 w-3 text-green-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Position: {stage.position}</p>
                  <p className="text-xs text-muted-foreground">Created: {stage.createdAt}</p>
                </div>
              
              </div>
            </Card>
          ))}
        </div>
      </BaseSection>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stage Image - {getStageName(editingStage)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              {editingStage?.image?.fullUrl ? (
                <div className="relative">
                  <img src={editingStage.image.fullUrl} alt="Current" className="w-32 h-32 object-cover rounded-lg" />
                  <span className="absolute -top-2 -right-2 text-xs bg-blue-500 text-white px-1 rounded">Current</span>
                </div>
              ) : (
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <FileUploader 
              onUploadSuccess={(id) => setImageId(id)} 
              multiple={false}
              label="Upload new image"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => handleUpdateImage(editingStage?.id)}>Update Image</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}