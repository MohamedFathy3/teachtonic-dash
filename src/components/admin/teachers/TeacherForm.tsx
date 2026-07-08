/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/TeacherForm.tsx

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FileUploader from '@/components/FileUploader';
import { teacherService } from '@/services/teacher.service';
import { stageService } from '@/services/stage.service';
import type { TeacherFormData, TeacherStagePayload, TeacherSubjectPayload } from '@/types/teacher.types';
import { teacherToFormData } from '@/types/teacher.types';
import { 
  X, 
  Plus, 
  Loader2, 
  Image as ImageIcon, 
  Trash2, 
  GripVertical,
  Check,
  AlertCircle,
  School,
  BookOpen,
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  BookMarked,
  UserCircle2,
  Key,
  FolderTree,
  RefreshCw,
  Users,
  Search,
  ChevronDown,
  Eye,        // ✅ أيقونة إظهار
  EyeOff,     // ✅ أيقونة إخفاء
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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
  lang,
  onUpdateImage,
  updatingImage,
  stagesMap,
}: { 
  item: TeacherStagePayload; 
  index: number; 
  onRemove: (index: number) => void; 
  getStageDisplayName: (id: number) => string;
  lang: string;
  onUpdateImage: (stageId: number, imageId: number) => void;
  updatingImage: boolean;
  stagesMap: Map<number, any>;
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

  const handleImageUpload = async (id: number) => {
    onUpdateImage(item.stage_id, id);
  };

  const stage = stagesMap.get(item.stage_id);
  const imageId = item.image || stage?.image?.id || null;
  const imageUrl = imageId ? `${import.meta.env.VITE_API_URL}/storage/media/files/${imageId}` : null;

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
          {imageId && (
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>Image attached</span>
            </p>
          )}
        </div>
        {imageUrl && (
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
            <img
              src={imageUrl}
              alt="Stage"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <FileUploader
          label=""
          onUploadSuccess={handleImageUpload}
          multiple={false}
          accept="image/*"
          maxFiles={1}
          uniqueId={`stage-image-update-${item.stage_id}-${Date.now()}`}
          className="w-auto"
          buttonClassName="p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all opacity-0 group-hover:opacity-100"
          buttonIcon={<RefreshCw className="w-4 h-4" />}
          buttonText=""
        />
        
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ✅ مكون المادة
const SubjectBadge = ({ subject, onRemove, getSubjectDisplayName, getStageName }: any) => {
  return (
    <div className="group inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all">
      <BookMarked className="w-4 h-4 text-purple-500" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {getSubjectDisplayName(subject.subject_id)}
      </span>
      {getStageName && (
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
          {getStageName}
        </span>
      )}
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

// ✅ مكون Select مع Search (Combobox)
const SearchableSelect = ({
  value,
  onChange,
  options,
  getDisplayName,
  placeholder,
  searchPlaceholder,
  disabled = false,
  className = '',
  loading = false,
  onSearchChange,
}: {
  value: string;
  onChange: (value: string) => void;
  options: any[];
  getDisplayName: (item: any) => string;
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
  onSearchChange?: (search: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<any[]>(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // فلترة الخيارات حسب البحث
  useEffect(() => {
    if (!search.trim()) {
      setFilteredOptions(options);
    } else {
      const searchTerm = search.trim().toLowerCase();
      const filtered = options.filter((item) =>
        getDisplayName(item).toLowerCase().includes(searchTerm)
      );
      setFilteredOptions(filtered);
    }
  }, [search, options, getDisplayName]);

  // تحديث الخيارات عند تغيير الـ options
  useEffect(() => {
    if (!search.trim()) {
      setFilteredOptions(options);
    }
  }, [options, search]);

  // إغلاق الـ dropdown عند الضغط بره
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id?.toString() === value);

  const handleSelect = (option: any) => {
    onChange(option.id?.toString() || '');
    setIsOpen(false);
    setSearch('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    if (onSearchChange) {
      onSearchChange(newSearch);
    }
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* زر الاختيار */}
      <div
        className={cn(
          "flex items-center justify-between w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer transition-all",
          "hover:border-blue-400 dark:hover:border-blue-500",
          isOpen && "border-blue-500 ring-2 ring-blue-500/20",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={cn(
          "truncate text-sm",
          !selectedOption && "text-gray-400 dark:text-gray-500"
        )}>
          {selectedOption ? getDisplayName(selectedOption) : placeholder}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="relative p-2 border-b border-gray-200 dark:border-gray-700">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder || 'Search...'}
              className="w-full h-8 pl-8 pr-3 text-sm bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            {search && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch('');
                  if (onSearchChange) onSearchChange('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-gray-500">Loading...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500">
                {search ? 'No results found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                    value === option.id?.toString() && "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{getDisplayName(option)}</span>
                    {value === option.id?.toString() && (
                      <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export function TeacherForm({ open, onClose, onSubmit, teacherId, loading }: Props) {
  const { t, dir, lang } = useApp();
  
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    sub_domain: '.web-lec.com',
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
  const [updatingImage, setUpdatingImage] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // ✅ State لإظهار/إخفاء كلمة المرور
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Search states
  const [stageSearch, setStageSearch] = useState<string>('');
  const [subjectSearch, setSubjectSearch] = useState<string>('');

  const [stagesMap, setStagesMap] = useState<Map<number, any>>(new Map());
  const [subjectsMap, setSubjectsMap] = useState<Map<number, any>>(new Map());
  const [allStages, setAllStages] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]); // ✅ كل المواد
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([]);

  // ✅ Drag & Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ✅ جلب المراحل عند فتح الفورم
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const stagesRes = await api.post('/stage/index', {
          perPage: 1000,
        });
        const stagesData = stagesRes.data?.data || [];
        setAllStages(stagesData);
        
        const stagesMapData = new Map();
        stagesData.forEach((stage: any) => {
          stagesMapData.set(stage.id, stage);
        });
        setStagesMap(stagesMapData);
      } catch (error) {
        console.error('Failed to fetch stages:', error);
      }
    };
    
    if (open) {
      fetchStages();
    }
  }, [open]);

  // ✅ جلب كل المواد عند فتح الفورم
  useEffect(() => {
    const fetchAllSubjects = async () => {
      try {
        const subjectsRes = await api.post('/subject/index', {
          perPage: 1000,
        });
        const subjectsData = subjectsRes.data?.data || [];
        
        // ✅ حفظ اسم المرحلة مع كل مادة
        const subjectsWithStage = subjectsData.map((subject: any) => {
          if (subject.stage) {
            const stageName = lang === 'ar' && subject.stage.name_ar 
              ? subject.stage.name_ar 
              : subject.stage.name;
            return { ...subject, name_stage: stageName };
          }
          return subject;
        });
        
        setAllSubjects(subjectsWithStage);
        setFilteredSubjects(subjectsWithStage);
        
        // ✅ تحديث الـ Map
        const subjectsMapData = new Map();
        subjectsWithStage.forEach((subject: any) => {
          subjectsMapData.set(subject.id, subject);
        });
        setSubjectsMap(subjectsMapData);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
      }
    };
    
    if (open) {
      fetchAllSubjects();
    }
  }, [open, lang]);

  // ✅ فلترة المواد حسب البحث
  useEffect(() => {
    if (!subjectSearch.trim()) {
      setFilteredSubjects(allSubjects);
    } else {
      const searchTerm = subjectSearch.trim().toLowerCase();
      const filtered = allSubjects.filter((subject: any) => {
        const name = lang === 'ar' && subject.name_ar ? subject.name_ar : subject.name;
        const stageName = subject.name_stage || '';
        return name.toLowerCase().includes(searchTerm) || 
               stageName.toLowerCase().includes(searchTerm);
      });
      setFilteredSubjects(filtered);
    }
  }, [subjectSearch, allSubjects, lang]);

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

  // ✅ تحديث صورة المرحلة المضافة
  const handleUpdateStageImage = async (stageId: number, imageId: number) => {
    setUpdatingImage(true);
    try {
      await stageService.updateStage(stageId, {
        image: imageId as any
      });

      setFormData(prev => ({
        ...prev,
        stage: prev.stage.map(s => 
          s.stage_id === stageId 
            ? { ...s, image: imageId }
            : s
        )
      }));

      setStagesMap(prev => {
        const newMap = new Map(prev);
        const stage = newMap.get(stageId);
        if (stage) {
          stage.image = { id: imageId };
          newMap.set(stageId, stage);
        }
        return newMap;
      });

      toast({
        title: "Success",
        description: "Stage image updated successfully",
      });
    } catch (error) {
      console.error('Error updating stage image:', error);
      toast({
        title: "Error",
        description: "Failed to update stage image",
        variant: "destructive",
      });
    } finally {
      setUpdatingImage(false);
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
    setStageSearch('');
    setSubjectSearch('');
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

  // ✅ رفع صورة المرحلة عند الإضافة
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
    setSubjectSearch('');
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

  // ✅ دالة للحصول على اسم المرحلة حسب اللغة
  const getStageDisplayName = (stageId: number) => {
    const stage = stagesMap.get(stageId);
    if (!stage) return `Stage ${stageId}`;
    
    if (lang === 'ar' && stage.name_ar) {
      return stage.name_ar;
    }
    if (stage.name) {
      return stage.name;
    }
    return `Stage ${stageId}`;
  };

  // ✅ دالة للحصول على اسم المرحلة للعرض في الـ Select مع المعلم المميز
  const getStageDisplayWithTeacher = (stage: any) => {
    let name = '';
    
    if (lang === 'ar' && stage.name_ar) {
      name = stage.name_ar;
    } else if (stage.name) {
      name = stage.name;
    } else {
      name = `Stage ${stage.id}`;
    }
    
    if (stage.distinctiveMarkForTeacherName) {
      return `${name} (${stage.distinctiveMarkForTeacherName})`;
    }
    
    return name;
  };

  const getSubjectDisplayName = (subjectId: number) => {
    const subject = subjectsMap.get(subjectId);
    if (lang === 'ar' && subject?.name_ar) return subject.name_ar;
    return subject?.name || `Subject ${subjectId}`;
  };

  // ✅ دالة للحصول على اسم المرحلة للمادة
  const getSubjectStageName = (subjectId: number) => {
    const subject = subjectsMap.get(subjectId);
    return subject?.name_stage || '';
  };

  // ✅ معالج تغيير المرحلة
  const handleStageSelectChange = (value: string) => {
    setSelectedStageId(value);
  };

  // ✅ معالج تغيير البحث في المواد
  const handleSubjectSearchChange = (search: string) => {
    setSubjectSearch(search);
  };

  // ✅ تبديل إظهار/إخفاء كلمة المرور
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        {/* Header */}
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
          {/* صورة المعلم */}
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

          {/* بيانات المعلم */}
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
            
            {/* ✅ حقل كلمة المرور مع زر إظهار/إخفاء */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-400" />
                Password {teacherId && <span className="text-xs text-gray-400 font-normal">(leave empty to keep current)</span>}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required={!teacherId}
                  placeholder={teacherId ? '••••••••' : 'Enter password'}
                  className="h-11 pr-12"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {/* ✅ مؤشر قوة كلمة المرور (اختياري) */}
              {formData.password && formData.password.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        formData.password.length < 6 && "w-1/3 bg-red-500",
                        formData.password.length >= 6 && formData.password.length < 10 && "w-2/3 bg-yellow-500",
                        formData.password.length >= 10 && "w-full bg-green-500"
                      )}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    formData.password.length < 6 && "text-red-500",
                    formData.password.length >= 6 && formData.password.length < 10 && "text-yellow-500",
                    formData.password.length >= 10 && "text-green-500"
                  )}>
                    {formData.password.length < 6 && 'Weak'}
                    {formData.password.length >= 6 && formData.password.length < 10 && 'Medium'}
                    {formData.password.length >= 10 && 'Strong'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* المراحل الدراسية */}
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
              <p className="text-xs text-gray-400">
                {dir === 'rtl' ? 'اسحب لإعادة الترتيب' : 'Drag to reorder'}
              </p>
            </div>

            {/* ✅ إضافة مرحلة - مع Searchable Select */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="md:col-span-1">
                <SearchableSelect
                  value={selectedStageId}
                  onChange={handleStageSelectChange}
                  options={allStages}
                  getDisplayName={getStageDisplayWithTeacher}
                  placeholder="Select stage..."
                  searchPlaceholder={lang === 'ar' ? 'بحث عن مرحلة...' : 'Search stage...'}
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

            {/* قائمة المراحل مع Drag & Drop */}
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
                        onUpdateImage={handleUpdateStageImage}
                        updatingImage={updatingImage}
                        stagesMap={stagesMap}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <School className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No stages added yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Search and select a stage then click add</p>
              </div>
            )}
          </div>

          {/* المواد الدراسية */}
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

            {/* إضافة مادة - مع Searchable Select */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div>
                <SearchableSelect
                  value={selectedSubjectId}
                  onChange={setSelectedSubjectId}
                  options={filteredSubjects}
                  getDisplayName={(subject: any) => {
                    const name = lang === 'ar' && subject.name_ar ? subject.name_ar : subject.name;
                    if (subject.name_stage) {
                      return `${name} (${subject.name_stage})`;
                    }
                    return name;
                  }}
                  placeholder="Select subject..."
                  searchPlaceholder={lang === 'ar' ? 'بحث عن مادة...' : 'Search subject...'}
                  onSearchChange={handleSubjectSearchChange}
                />
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Showing {filteredSubjects.length} subjects
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  onClick={addSubject}
                  className="flex-1"
                  disabled={filteredSubjects.length === 0}
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

            {/* قائمة المواد */}
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
                    getStageName={getSubjectStageName(item.subject_id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* أزرار التحكم */}
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