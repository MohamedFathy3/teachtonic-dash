/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/TeacherForm.tsx
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import FileUploader from '@/components/FileUploader';
import { teacherService } from '@/services/teacher.service';
import type { TeacherFormData } from '@/types/teacher.types';
import { teacherToFormData } from '@/types/teacher.types';
import { X, Plus, Loader2, Trash2, Eye, EyeOff } from 'lucide-react';
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
<<<<<<< HEAD
  
  const initialFormData: TeacherFormData = {
=======

  const [formData, setFormData] = useState<TeacherFormData>({
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
    name: '',
    email: '',
    sub_domain: '',
    phone: '',
    password: '',
    stage: [],
    subject: [],
    image: undefined,
<<<<<<< HEAD
  };
  
  const [formData, setFormData] = useState<TeacherFormData>(initialFormData);
  
=======
  });

>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
  const [fetchingTeacher, setFetchingTeacher] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedStageImage, setSelectedStageImage] = useState<number>(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
  const [currentStageFilter, setCurrentStageFilter] = useState<number | null>(null);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

=======
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
  const [stagesMap, setStagesMap] = useState<Map<number, any>>(new Map());
  const [subjectsMap, setSubjectsMap] = useState<Map<number, any>>(new Map());

  // دالة لتفريغ الفورم بالكامل
  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedStageId('');
    setSelectedStageImage(0);
    setSelectedSubjectId('');
    setCurrentImageUrl(null);
    setImageFile(null);
    setImagePreview(null);
    setShowPassword(false);
    setCurrentStageFilter(null);
  };

  // تحديث فلتر المواد عند إضافة أو إزالة مرحلة
  useEffect(() => {
    if (formData.stage.length > 0) {
      const lastAddedStage = formData.stage[formData.stage.length - 1];
      setCurrentStageFilter(lastAddedStage.stage_id);
    } else {
      setCurrentStageFilter(null);
    }
  }, [formData.stage]);

  // جلب المواد المفلترة حسب المرحلة
  useEffect(() => {
    const fetchSubjectsByStage = async () => {
      if (!currentStageFilter) {
        setAllSubjects([]);
        return;
      }
      
      setLoadingSubjects(true);
      try {
        const response = await api.post('/subject/index', {
          filters: { stage_id: currentStageFilter },
          perPage: 100,
          page: 1,
          paginate: false,
        });
        
        if (response.data?.data) {
          setAllSubjects(response.data.data);
          // تحديث الـ Map
          const newMap = new Map();
          response.data.data.forEach((subject: any) => {
            newMap.set(subject.id, subject);
          });
          setSubjectsMap(newMap);
        }
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        setAllSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };
    
    fetchSubjectsByStage();
  }, [currentStageFilter]);

  // جلب المراحل عند تحميل الفورم
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const stagesRes = await api.post('/stage/index', {
          perPage: 100,
          page: 1,
          paginate: false,
        });
        const stagesMapData = new Map();
        if (stagesRes.data?.data) {
          stagesRes.data.data.forEach((stage: any) => {
            stagesMapData.set(stage.id, stage);
          });
        }
        setStagesMap(stagesMapData);
<<<<<<< HEAD
=======

        const subjectsRes = await api.get('/subject?perPage=100');
        const subjectsMapData = new Map();
        if (subjectsRes.data?.data) {
          subjectsRes.data.data.forEach((subject: any) => {
            subjectsMapData.set(subject.id, subject);
          });
        }
        setSubjectsMap(subjectsMapData);
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
      } catch (error) {
        console.error('Failed to fetch stages:', error);
      }
    };

    if (open) {
      fetchStages();
    } else {
      resetForm();
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
<<<<<<< HEAD
        
=======

        // حفظ رابط الصورة الحالية
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
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

  const handleImageUpload = (id: number) => {
    setFormData(prev => ({ ...prev, image: id }));
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: undefined }));
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
  };

  const addStage = () => {
<<<<<<< HEAD
    if (selectedStageId && selectedStageImage) {
      const alreadyExists = formData.stage.some(
        stage => stage.stage_id === parseInt(selectedStageId)
      );
      
      if (alreadyExists) {
        return;
      }
      
=======
    if (selectedStageId) {
      const stageIdNum = parseInt(selectedStageId);

      // منع تكرار نفس المرحلة في القائمة
      if (formData.stage.some(item => item.stage_id === stageIdNum)) {
        setSelectedStageId('');
        return;
      }

>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
      setFormData(prev => ({
        ...prev,
        stage: [...prev.stage, { stage_id: stageIdNum, image: 0 }] // تبدأ بـ 0 حتى يتم رفع الصورة
      }));
      setSelectedStageId('');
    }
  };

  const removeStage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stage: prev.stage.filter((_, i) => i !== index)
    }));
  };

  // دالة جديدة لتحديث صورة مرحلة معينة داخل المصفوفة بعد رفعها
  const handleStageImageUpload = (index: number, mediaId: number) => {
    setFormData(prev => {
      const updatedStages = [...prev.stage];
      updatedStages[index] = { ...updatedStages[index], image: mediaId };
      return { ...prev, stage: updatedStages };
    });
  };
  const addSubject = () => {
    if (selectedSubjectId) {
      const alreadyExists = formData.subject.some(
        subject => subject.subject_id === parseInt(selectedSubjectId)
      );
      
      if (alreadyExists) {
        return;
      }
      
      // جلب المادة من allSubjects
      const selectedSubject = allSubjects.find(s => s.id === parseInt(selectedSubjectId));
      if (selectedSubject) {
        setSubjectsMap(prev => new Map(prev).set(selectedSubject.id, selectedSubject));
      }
      
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
    resetForm();
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
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm();
          onClose();
        }
      }}>
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
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {teacherId ? (t('edit_teacher') || 'Edit Teacher') : (t('add_teacher') || 'Add Teacher')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div>
            <Label className="mb-2 block">Profile Image</Label>
<<<<<<< HEAD
            
=======

            {/* عرض الصورة الحالية أو المعاينة */}
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
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
<<<<<<< HEAD
            
=======

            {/* File Uploader */}
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
            <FileUploader
              label={currentImageUrl ? 'Change profile image' : 'Upload profile image'}
              onUploadSuccess={handleImageUpload}
              onRemoveImage={handleRemoveImage}
              multiple={false}
              accept="image/*"
              maxFiles={1}
              uniqueId={`teacher-image-${teacherId || 'new'}`}
            />
<<<<<<< HEAD
=======

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
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
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
<<<<<<< HEAD
            
            <div className="relative">
              <Label>Password {teacherId && '(leave empty to keep)'}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required={!teacherId}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
=======
            <div className="relative">
              <Label>Password {teacherId && "(leave empty to keep)"}</Label>

              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required={!teacherId}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
            </div>
          </div>

          {/* Stages Section */}
          <div className="border rounded-lg p-4">
            <Label className="mb-2 block">Stages & Images</Label>
<<<<<<< HEAD
            <div className="flex gap-2 mb-3 flex-wrap">
              <select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                className="flex-1 min-w-[150px] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="">Select stage</option>
                {Array.from(stagesMap.entries()).map(([id, stage]) => (
                  <option key={id} value={id}>
                    {lang === 'ar' && stage.name_ar ? stage.name_ar : stage.name}
                  </option>
                ))}
              </select>
              
              <FileUploader
                label=""
                onUploadSuccess={(id) => setSelectedStageImage(id)}
                multiple={false}
                uniqueId="stage-image-upload"
              />
              
=======
            <div className="flex gap-2 mb-3">
              <AsyncSelect
                configKey="stages"
                value={selectedStageId ? parseInt(selectedStageId) : null}
                onChange={(value) => setSelectedStageId(value?.toString() || '')}
                placeholder="Select stage"
                searchPlaceholder="Search stage..."
                className="flex-1"
                perPageOptions={[10, 25, 50]}
                defaultPerPage={25}
              />

>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
              <Button type="button" onClick={addStage} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {formData.stage.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-2">No stages added yet</p>
              ) : (
                formData.stage.map((item, idx) => (
                  <div key={item.stage_id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{getStageDisplayName(item.stage_id)}</p>
                      {item.image > 0 ? (
                        <span className="text-xs text-green-600 font-medium">✓ Image Attached (ID: {item.image})</span>
                      ) : (
                        <span className="text-xs text-amber-500 font-medium">* Please upload an image for this stage</span>
                      )}
                    </div>

                    {/* رافع ملفات مخصص ومستقل تماماً لكل مرحلة بناءً على الـ ID الخاص بها */}
                    <div className="flex items-center gap-2">
                      <FileUploader
                        label={item.image > 0 ? "Change" : "Upload"}
                        onUploadSuccess={(mediaId) => handleStageImageUpload(idx, mediaId)}
                        multiple={false}
                        accept="image/*"
                        maxFiles={1}
                        uniqueId={`stage-image-upload-${item.stage_id}`}
                      />

                      <Button type="button" variant="ghost" size="sm" onClick={() => removeStage(idx)}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Subjects Section */}
          <div className="border rounded-lg p-4">
            <Label className="mb-2 block">Subjects</Label>
            
            {currentStageFilter && (
              <div className="mb-2 text-xs text-blue-600 dark:text-blue-400">
                📚 Showing subjects for stage: {getStageDisplayName(currentStageFilter)}
              </div>
            )}
            
            {!currentStageFilter && formData.stage.length === 0 && (
              <div className="mb-2 text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Please add a stage first
              </div>
            )}
            
            <div className="flex gap-2 mb-3">
<<<<<<< HEAD
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                disabled={!currentStageFilter || loadingSubjects}
              >
                <option value="">Select subject</option>
                {allSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {lang === 'ar' && subject.name_ar ? subject.name_ar : subject.name}
                  </option>
                ))}
              </select>
              
              <Button 
                type="button" 
                onClick={addSubject} 
                size="sm"
                disabled={!selectedSubjectId}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {loadingSubjects && (
              <div className="text-center py-2">
                <Loader2 className="h-4 w-4 animate-spin inline text-blue-500" />
                <span className="text-xs ml-2">Loading subjects...</span>
              </div>
            )}
            
=======
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

>>>>>>> 3822f4525e4c92162736b9a733b04cbb0ba31cd6
            <div className="flex flex-wrap gap-2">
              {formData.subject.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-2 w-full">No subjects added yet</p>
              ) : (
                formData.subject.map((item, idx) => (
                  <span key={idx} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {getSubjectDisplayName(item.subject_id)}
                    <button type="button" onClick={() => removeSubject(idx)} className="text-red-500 hover:text-red-700">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => {
              resetForm();
              onClose();
            }}>
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