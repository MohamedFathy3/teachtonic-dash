/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/TeacherForm.tsx

import { useState, useEffect, useCallback } from 'react';
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
import { 
  X, 
  Plus, 
  Loader2, 
  Image as ImageIcon, 
  Trash2, 
  GripVertical,
  Eye,
  Check,
  AlertCircle,
  Upload,
  ArrowUp,
  ArrowDown,
  School,
  BookOpen,
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  Sparkles,
  Building2,
  GraduationCap,
  BookMarked,
  UserCircle2,
  AtSign,
  Smartphone,
  Key,
  Layers,
  FolderTree
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// ✅ Drag & Drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TeacherFormData) => Promise<void>;
  teacherId?: number | null;
  loading?: boolean;
}

// ✅ مكون المرحلة القابل للسحب
const StageItem = ({ 
  item, 
  index, 
  onRemove, 
  getStageDisplayName, 
  lang 
}: { 
  item: TeacherStagePayload; 
  index: number; 
  onRemove: (index: number) => void; 
  getStageDisplayName: (id: number) => string;
  lang: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all hover:border-blue-400 dark:hover:border-blue-500 group",
        isDragging && "shadow-lg ring-2 ring-blue-500 ring-offset-2"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
          <School className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">
            {getStageDisplayName(item.stage_id)}
          </p>
          {item.image && (
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>Image attached</span>
            </p>
          )}
        </div>
        {item.image && (
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
            <img
              src={`${import.meta.env.VITE_API_URL}/storage/media/files/${item.image}`}
              alt="Stage"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// ✅ مكون المادة
const SubjectBadge = ({ subject, onRemove, getSubjectDisplayName }: any) => {
  return (
    <div className="group inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all">
      <BookMarked className="w-4 h-4 text-purple-500" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {getSubjectDisplayName(subject.subject_id)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export function TeacherForm({ open, onClose, onSubmit, teacherId, loading }: Props) {
  const { t, dir, lang } = useApp();
  
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    sub_domain: '.web-lec.com', // ✅ النطاق الافتراضي
    phone: '',
    password: '',
    stage: [],
    subject: [],
    image: undefined,
  });
  
  const [fetchingTeacher, setFetchingTeacher] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedStageImage, setSelectedStageImage] = useState<number | null>(null);
  const [selectedStageImagePreview, setSelectedStageImagePreview] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [stageError, setStageError] = useState<string | null>(null);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  const [stagesMap, setStagesMap] = useState<Map<number, any>>(new Map());
  const [subjectsMap, setSubjectsMap] = useState<Map<number, any>>(new Map());
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([]);

  // ✅ Drag & Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        setFilteredSubjects(subjectsRes.data?.data || []);
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
        setFormData({
          ...convertedData,
          sub_domain: convertedData.sub_domain || 'default'
        });
        
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

  // ✅ فلترة المواد حسب المرحلة المختارة
  const filterSubjectsByStage = useCallback(async (stageId: string) => {
    if (!stageId) {
      const res = await api.get('/subject?perPage=100');
      setFilteredSubjects(res.data?.data || []);
      return;
    }

    try {
      const res = await api.get(`/subject?perPage=100&filters[stage_id]=${stageId}`);
      setFilteredSubjects(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch subjects by stage:', error);
    }
  }, []);

  // ✅ عند تغيير المرحلة في AsyncSelect
  const handleStageChange = (value: any, selectedItem: any) => {
    setSelectedStageId(value?.toString() || '');
    if (selectedItem) {
      filterSubjectsByStage(value?.toString() || '');
    } else {
      filterSubjectsByStage('');
    }
  };

  // معالج رفع الصورة الرئيسية
  const handleImageUpload = (id: number) => {
    setFormData(prev => ({ ...prev, image: id }));
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
  };

  // معالج حذف الصورة الرئيسية
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: undefined }));
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
  };

  // ✅ إضافة مرحلة جديدة
  const addStage = () => {
    setStageError(null);
    
    if (!selectedStageId) {
      setStageError('Please select a stage');
      return;
    }

    if (formData.stage.some(s => s.stage_id === parseInt(selectedStageId))) {
      setStageError('This stage is already added');
      return;
    }

    const newStage: TeacherStagePayload = {
      stage_id: parseInt(selectedStageId),
      image: selectedStageImage || 0,
    };

    setFormData(prev => ({
      ...prev,
      stage: [...prev.stage, newStage]
    }));
    
    setSelectedStageId('');
    setSelectedStageImage(null);
    setSelectedStageImagePreview(null);
    setStageError(null);
  };

  // ✅ حذف مرحلة
  const removeStage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stage: prev.stage.filter((_, i) => i !== index)
    }));
  };

  // ✅ معالج Drag & Drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData(prev => ({
        ...prev,
        stage: arrayMove(prev.stage, active.id as number, over.id as number)
      }));
    }
  };

  // ✅ رفع صورة المرحلة
  const handleStageImageUpload = (id: number) => {
    setSelectedStageImage(id);
    const imageUrl = `${import.meta.env.VITE_API_URL}/storage/media/files/${id}`;
    setSelectedStageImagePreview(imageUrl);
  };

  // ✅ إضافة مادة جديدة
  const addSubject = () => {
    setSubjectError(null);
    
    if (!selectedSubjectId) {
      setSubjectError('Please select a subject');
      return;
    }
    
    if (formData.subject.some(s => s.subject_id === parseInt(selectedSubjectId))) {
      setSubjectError('This subject is already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      subject: [...prev.subject, { subject_id: parseInt(selectedSubjectId) }]
    }));
    setSelectedSubjectId('');
    setSubjectError(null);
  };

  const removeSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subject: prev.subject.filter((_, i) => i !== index)
    }));
  };

  // ✅ معالج الإرسال
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    if (!teacherId) {
      setFormData({
        name: '',
        email: '',
        sub_domain: 'default',
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
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading teacher data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* ✅ Header - أنيق ونظيف */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {teacherId ? 'Edit Teacher' : 'Add New Teacher'}
              </DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {teacherId 
                  ? 'Update teacher information' 
                  : 'Create a new teacher account'}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-full">
              <UserCircle2 className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {teacherId ? 'Edit Mode' : 'New Mode'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* ✅ صورة المعلم - تصميم أنيق */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Profile Image
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Upload a profile photo
              </p>
            </div>
            <div className="lg:col-span-3">
              <div className="flex items-center gap-6">
                {/* Image Preview */}
                {(currentImageUrl || imagePreview) && (
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                      <img
                        src={imagePreview || currentImageUrl || ''}
                        alt="Teacher"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                <div className="flex-1">
                  <FileUploader
                    label={currentImageUrl ? 'Change Image' : 'Upload Image'}
                    onUploadSuccess={handleImageUpload}
                    onRemoveImage={handleRemoveImage}
                    multiple={false}
                    accept="image/*"
                    maxFiles={1}
                    uniqueId={`teacher-image-${teacherId || 'new'}`}
                  />
                  {imageFile && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {imageFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ بيانات المعلم - تصميم نظيف */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Full Name
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="John Doe"
                className="h-11"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email Address
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="john@example.com"
                className="h-11"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Sub Domain
              </Label>
              <div className="relative">
                <Input
                  value={formData.sub_domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, sub_domain: e.target.value }))}
                  required
                  placeholder="default"
                  className="h-11 pr-24"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  .web-lec.com
                </span>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                Phone Number
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                placeholder="+20123456789"
                className="h-11"
              />
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-400" />
                Password {teacherId && <span className="text-xs text-gray-400 font-normal">(leave empty to keep current)</span>}
              </Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required={!teacherId}
                placeholder={teacherId ? '••••••••' : 'Enter password'}
                className="h-11"
              />
            </div>
          </div>

          {/* ✅ المراحل الدراسية - تصميم أنيق */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-500" />
                <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                  Stages
                </Label>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {formData.stage.length}
                </span>
              </div>
            </div>

            {/* ✅ إضافة مرحلة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="md:col-span-1">
                <AsyncSelect
                  configKey="stages"
                  value={selectedStageId ? parseInt(selectedStageId) : null}
                  onChange={handleStageChange}
                  placeholder="Select stage"
                  searchPlaceholder="Search stage..."
                  className="w-full"
                  perPageOptions={[10, 25, 50]}
                  defaultPerPage={25}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <FileUploader
                  label=""
                  onUploadSuccess={handleStageImageUpload}
                  multiple={false}
                  accept="image/*"
                  maxFiles={1}
                  uniqueId={`stage-image-${Date.now()}`}
                  className="flex-1"
                />
                {selectedStageImagePreview && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={selectedStageImagePreview}
                      alt="Stage"
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStageImage(null);
                        setSelectedStageImagePreview(null);
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
                <Button 
                  type="button" 
                  onClick={addStage}
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {stageError && (
                <div className="md:col-span-3 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {stageError}
                </div>
              )}
            </div>

            {/* ✅ قائمة المراحل مع Drag & Drop */}
            {formData.stage.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formData.stage.map((_, index) => index)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {formData.stage.map((item, index) => (
                      <StageItem
                        key={index}
                        item={item}
                        index={index}
                        onRemove={removeStage}
                        getStageDisplayName={getStageDisplayName}
                        lang={lang}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <School className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No stages added yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Select a stage and click add</p>
              </div>
            )}
          </div>

          {/* ✅ المواد الدراسية - تصميم أنيق */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-purple-500" />
                <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                  Subjects
                </Label>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {formData.subject.length}
                </span>
              </div>
            </div>

            {/* ✅ إضافة مادة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div>
                <AsyncSelect
                  configKey="subjects"
                  value={selectedSubjectId ? parseInt(selectedSubjectId) : null}
                  onChange={(value) => setSelectedSubjectId(value?.toString() || '')}
                  placeholder="Select subject"
                  searchPlaceholder="Search subject..."
                  className="w-full"
                  perPageOptions={[10, 25, 50]}
                  defaultPerPage={25}
                  debounceDelay={500}
                  cacheData={true}
                  enableInfiniteScroll={false}
                  extraFilters={{ 
                    stage_id: formData.stage.length > 0 ? formData.stage[0].stage_id : undefined 
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  onClick={addSubject}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Subject
                </Button>
              </div>
              
              {subjectError && (
                <div className="md:col-span-2 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {subjectError}
                </div>
              )}
            </div>

            {/* ✅ قائمة المواد */}
            <div className="flex flex-wrap gap-2">
              {formData.subject.length === 0 ? (
                <div className="text-center py-6 w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No subjects added</p>
                </div>
              ) : (
                formData.subject.map((item, idx) => (
                  <SubjectBadge
                    key={idx}
                    subject={item}
                    onRemove={() => removeSubject(idx)}
                    getSubjectDisplayName={getSubjectDisplayName}
                  />
                ))
              )}
            </div>
          </div>

          {/* ✅ أزرار التحكم */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                teacherId ? 'Update Teacher' : 'Create Teacher'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}