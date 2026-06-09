/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/TeacherForm.tsx

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import FileUploader from '@/components/FileUploader';
import { teacherService } from '@/services/teacher.service';
import type { TeacherFormData, TeacherStagePayload, TeacherSubjectPayload } from '@/types/teacher.types';
import { teacherToFormData } from '@/types/teacher.types';
import { X, Plus, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TeacherFormData) => Promise<void>;
  teacherId?: number | null;
  loading?: boolean;
}

export function TeacherForm({ open, onClose, onSubmit, teacherId, loading }: Props) {
  const { t, dir, lang } = useApp();
  
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    sub_domain: '',
    phone: '',
    password: '',
    stage: [],
    subject: [],
    image: undefined,
  });
  
  const [fetchingTeacher, setFetchingTeacher] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedStageImage, setSelectedStageImage] = useState<number>(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [stagesMap, setStagesMap] = useState<Map<number, any>>(new Map());
  const [subjectsMap, setSubjectsMap] = useState<Map<number, any>>(new Map());

  // جلب البيانات عند تحميل الفورم
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const stagesRes = await api.get('/stage?perPage=100');
        const stagesMapData = new Map();
        if (stagesRes.data?.data) {
          stagesRes.data.data.forEach((stage: any) => {
            stagesMapData.set(stage.id, stage);
          });
        }
        setStagesMap(stagesMapData);
        
        const subjectsRes = await api.get('/subject?perPage=100');
        const subjectsMapData = new Map();
        if (subjectsRes.data?.data) {
          subjectsRes.data.data.forEach((subject: any) => {
            subjectsMapData.set(subject.id, subject);
          });
        }
        setSubjectsMap(subjectsMapData);
      } catch (error) {
        console.error('Failed to fetch stages/subjects:', error);
      }
    };
    
    if (open) {
      fetchMaps();
    }
  }, [open]);

  // جلب بيانات المعلم عند التعديل
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!open || !teacherId) return;
      
      setFetchingTeacher(true);
      try {
        const teacher = await teacherService.getTeacher(teacherId);
        const convertedData = teacherToFormData(teacher);
        setFormData(convertedData);
        
        // حفظ رابط الصورة الحالية
        if (teacher.imageUrl) {
          setCurrentImageUrl(teacher.imageUrl);
        } else if (teacher.image?.fullUrl) {
          setCurrentImageUrl(teacher.image.fullUrl);
        } else if (teacher.image?.previewUrl) {
          setCurrentImageUrl(teacher.image.previewUrl);
        }
      } catch (error) {
        console.error('Failed to fetch teacher:', error);
      } finally {
        setFetchingTeacher(false);
      }
    };

    fetchTeacherData();
  }, [teacherId, open]);

  // معالج رفع الصورة
  const handleImageUpload = (id: number) => {
    setFormData(prev => ({ ...prev, image: id }));
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
  };

  // معالج اختيار ملف صورة جديد
  const handleImageFileSelect = (file: File) => {
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setCurrentImageUrl(null);
    setFormData(prev => ({ ...prev, image: undefined }));
  };

  // معالج حذف الصورة
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: undefined }));
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
  };

  const addStage = () => {
    if (selectedStageId && selectedStageImage) {
      setFormData(prev => ({
        ...prev,
        stage: [...prev.stage, { stage_id: parseInt(selectedStageId), image: selectedStageImage }]
      }));
      setSelectedStageId('');
      setSelectedStageImage(0);
    }
  };

  const removeStage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stage: prev.stage.filter((_, i) => i !== index)
    }));
  };

  const addSubject = () => {
    if (selectedSubjectId) {
      setFormData(prev => ({
        ...prev,
        subject: [...prev.subject, { subject_id: parseInt(selectedSubjectId) }]
      }));
      setSelectedSubjectId('');
    }
  };

  const removeSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subject: prev.subject.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    if (!teacherId) {
      setFormData({
        name: '',
        email: '',
        sub_domain: '',
        phone: '',
        password: '',
        stage: [],
        subject: [],
        image: undefined,
      });
      setCurrentImageUrl(null);
      setImagePreview(null);
      setImageFile(null);
    }
    onClose();
  };

  const getStageDisplayName = (stageId: number) => {
    const stage = stagesMap.get(stageId);
    if (lang === 'ar' && stage?.name_ar) return stage.name_ar;
    return stage?.name || `Stage ${stageId}`;
  };

  const getSubjectDisplayName = (subjectId: number) => {
    const subject = subjectsMap.get(subjectId);
    if (lang === 'ar' && subject?.name_ar) return subject.name_ar;
    return subject?.name || `Subject ${subjectId}`;
  };

  if (fetchingTeacher) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Loading teacher data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {teacherId ? (t('edit_teacher') || 'Edit Teacher') : (t('add_teacher') || 'Add Teacher')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section with Preview */}
          <div>
            <Label className="mb-2 block">Profile Image</Label>
            
            {/* عرض الصورة الحالية أو المعاينة */}
            {(currentImageUrl || imagePreview) && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={imagePreview || currentImageUrl || ''}
                      alt="Teacher preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {imagePreview ? 'New image ready' : 'Current image'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {imagePreview ? 'Click save to update' : teacherId ? 'Upload new image to replace' : 'Upload an image'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* File Uploader */}
            <FileUploader
              label={currentImageUrl ? 'Change profile image' : 'Upload profile image'}
              onUploadSuccess={handleImageUpload}
              onRemoveImage={handleRemoveImage}
              multiple={false}
              accept="image/*"
              maxFiles={1}
              uniqueId={`teacher-image-${teacherId || 'new'}`}
            />
            
            {/* Upload status messages */}
            {formData.image && !teacherId && (
              <p className="text-xs text-green-600 mt-1">✓ Image ready to upload</p>
            )}
            {teacherId && formData.image && typeof formData.image === 'number' && !imagePreview && (
              <p className="text-xs text-blue-600 mt-1">✓ Image will be updated with ID: {formData.image}</p>
            )}
            {imageFile && (
              <p className="text-xs text-green-600 mt-1">✓ New image selected: {imageFile.name}</p>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name (EN)</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Sub Domain</Label>
              <Input
                value={formData.sub_domain}
                onChange={(e) => setFormData(prev => ({ ...prev, sub_domain: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Password {teacherId && '(leave empty to keep)'}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required={!teacherId}
              />
            </div>
          </div>

          {/* Stages Section */}
          <div className="border rounded-lg p-4">
            <Label className="mb-2 block">Stages & Images</Label>
            <div className="flex gap-2 mb-3 flex-wrap">
              <AsyncSelect
                configKey="stages"
                value={selectedStageId ? parseInt(selectedStageId) : null}
                onChange={(value) => setSelectedStageId(value?.toString() || '')}
                placeholder="Select stage"
                searchPlaceholder="Search stage..."
                className="flex-1 min-w-[150px]"
                perPageOptions={[10, 25, 50]}
                defaultPerPage={25}
              />
              
              <FileUploader
                label=""
                onUploadSuccess={(id) => setSelectedStageImage(id)}
                multiple={false}
                uniqueId="stage-image-upload"
              />
              
              <Button type="button" onClick={addStage} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {formData.stage.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-2">No stages added yet</p>
              ) : (
                formData.stage.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <div className="flex flex-col">
                      <span className="font-medium">{getStageDisplayName(item.stage_id)}</span>
                      {item.image > 0 && (
                        <span className="text-xs text-gray-500">Image ID: {item.image}</span>
                      )}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeStage(idx)}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Subjects Section */}
          <div className="border rounded-lg p-4">
            <Label className="mb-2 block">Subjects</Label>
            <div className="flex gap-2 mb-3">
              <AsyncSelect
                configKey="subjects"
                value={selectedSubjectId ? parseInt(selectedSubjectId) : null}
                onChange={(value) => setSelectedSubjectId(value?.toString() || '')}
                placeholder="Select subject"
                searchPlaceholder="Search subject..."
                className="flex-1"
                perPageOptions={[10, 25, 50]}
                defaultPerPage={25}
                debounceDelay={500}        
                cacheData={true}          
                enableInfiniteScroll={false}
              />
              <Button type="button" onClick={addSubject} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.subject.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-2 w-full">No subjects added yet</p>
              ) : (
                formData.subject.map((item, idx) => (
                  <span key={idx} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {getSubjectDisplayName(item.subject_id)}
                    <button type="button" onClick={() => removeSubject(idx)} className="text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (teacherId ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}