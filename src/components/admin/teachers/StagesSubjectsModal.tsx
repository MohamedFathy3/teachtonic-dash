/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/StagesSubjectsModal.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import FileUploader from '@/components/FileUploader';
import { stageService } from '@/services/stage.service';
import type { TeacherStagePayload, TeacherSubjectPayload } from '@/types/teacher.types';
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
  BookMarked,
  FolderTree,
  RefreshCw,
  Search,
  ChevronDown,
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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  open: boolean;
  onClose: () => void;
  initialStages: TeacherStagePayload[];
  initialSubjects: TeacherSubjectPayload[];
  onSave: (stages: TeacherStagePayload[], subjects: TeacherSubjectPayload[]) => void;
}

// ✅ مكون العنصر المختار (Stage + Subject + Image)
const SelectedItem = ({ 
  stageId, 
  subjectId, 
  onRemove, 
  getStageDisplayName, 
  getSubjectDisplayName,
  stagesMap,
  onUpdateImage,
  updatingImage,
}: { 
  stageId: number;
  subjectId: number;
  onRemove: () => void;
  getStageDisplayName: (id: number) => string;
  getSubjectDisplayName: (id: number) => string;
  stagesMap: Map<number, any>;
  onUpdateImage: (stageId: number, imageId: number) => Promise<void>;
  updatingImage: boolean;
}) => {
  const stage = stagesMap.get(stageId);
  const imageId = stage?.image?.id || null;
  const imageUrl = imageId ? `${import.meta.env.VITE_API_URL}/storage/media/files/${imageId}` : null;

  const handleImageUpload = async (id: number) => {
    await onUpdateImage(stageId, id);
  };

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all hover:border-purple-400 dark:hover:border-purple-500 group">
      {/* Stage */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <School className="w-4 h-4 text-blue-500" />
        </div>
        <span className="font-medium text-gray-900 dark:text-white truncate">
          {getStageDisplayName(stageId)}
        </span>
      </div>

      {/* Subject */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
          <BookMarked className="w-4 h-4 text-purple-500" />
        </div>
        <span className="font-medium text-gray-900 dark:text-white truncate">
          {getSubjectDisplayName(subjectId)}
        </span>
      </div>

      {/* Image */}
      <div className="flex items-center gap-2">
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
        
        <FileUploader
          label=""
          onUploadSuccess={handleImageUpload}
          multiple={false}
          accept="image/*"
          maxFiles={1}
          uniqueId={`stage-image-update-${stageId}-${Date.now()}`}
          className="w-auto"
          buttonClassName={cn(
            "p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all",
            "opacity-0 group-hover:opacity-100"
          )}
          buttonIcon={<RefreshCw className={cn("w-4 h-4", updatingImage && "animate-spin")} />}
          buttonText=""
          disabled={updatingImage}
        />

        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
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

  useEffect(() => {
    if (!search.trim()) {
      setFilteredOptions(options);
    }
  }, [options, search]);

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

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden">
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

export function StagesSubjectsModal({ open, onClose, initialStages, initialSubjects, onSave }: Props) {
  const { t, dir, lang } = useApp();
  
  // ✅ State للمراحل والمواد
  const [stages, setStages] = useState<TeacherStagePayload[]>(initialStages);
  const [subjects, setSubjects] = useState<TeacherSubjectPayload[]>(initialSubjects);
  
  // ✅ State للإضافة (Stage + Subject + Image مع بعض)
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [subjectSearch, setSubjectSearch] = useState<string>('');

  const [stagesMap, setStagesMap] = useState<Map<number, any>>(new Map());
  const [subjectsMap, setSubjectsMap] = useState<Map<number, any>>(new Map());
  const [allStages, setAllStages] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([]);

  // ✅ جلب المراحل
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

  // ✅ جلب المواد حسب المرحلة المختارة
  const fetchSubjectsByStage = useCallback(async (stageId: number) => {
    if (!stageId) {
      setAllSubjects([]);
      setFilteredSubjects([]);
      return;
    }

    setLoadingSubjects(true);
    try {
      const response = await api.post('/subject/index', {
        perPage: 1000,
        filter: {
          stage_id: stageId
        }
      });
      
      const subjectsData = response.data?.data || [];
      
      const subjectsWithStage = subjectsData.map((subject: any) => {
        const stage = stagesMap.get(stageId);
        const stageName = lang === 'ar' && stage?.name_ar 
          ? stage.name_ar 
          : stage?.name || '';
        return { ...subject, name_stage: stageName };
      });
      
      setAllSubjects(subjectsWithStage);
      setFilteredSubjects(subjectsWithStage);
      
      const subjectsMapData = new Map();
      subjectsWithStage.forEach((subject: any) => {
        subjectsMapData.set(subject.id, subject);
      });
      setSubjectsMap(subjectsMapData);
      
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects for this stage",
        variant: "destructive",
      });
    } finally {
      setLoadingSubjects(false);
    }
  }, [lang, stagesMap]);

  // ✅ عند تغيير المرحلة
  useEffect(() => {
    if (selectedStageId) {
      fetchSubjectsByStage(parseInt(selectedStageId));
      setSelectedSubjectId('');
    } else {
      setAllSubjects([]);
      setFilteredSubjects([]);
    }
  }, [selectedStageId, fetchSubjectsByStage]);

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

  // ✅ تحديث صورة المرحلة
  const handleUpdateStageImage = async (stageId: number, imageId: number) => {
    setUpdatingImage(true);
    try {
      await stageService.updateStage(stageId, {
        image: imageId as any
      });

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

  // ✅ رفع الصورة
  const handleImageUpload = (id: number) => {
    setSelectedImageId(id);
    const imageUrl = `${import.meta.env.VITE_API_URL}/storage/media/files/${id}`;
    setSelectedImagePreview(imageUrl);
  };

  // ✅ إضافة (Stage + Subject + Image) مع بعض
  const addCombination = () => {
    setError(null);
    
    if (!selectedStageId) {
      setError('Please select a stage');
      return;
    }

    if (!selectedSubjectId) {
      setError('Please select a subject');
      return;
    }

    const stageId = parseInt(selectedStageId);
    const subjectId = parseInt(selectedSubjectId);

    // ✅ تحقق إذا كانت المرحلة موجودة
    if (stages.some(s => s.stage_id === stageId)) {
      setError('This stage is already added');
      return;
    }

    // ✅ تحقق إذا كانت المادة موجودة
    if (subjects.some(s => s.subject_id === subjectId)) {
      setError('This subject is already added');
      return;
    }

    // ✅ إضافة المرحلة
    setStages(prev => [...prev, { 
      stage_id: stageId, 
      image: selectedImageId || 0 
    }]);

    // ✅ إضافة المادة
    setSubjects(prev => [...prev, { subject_id: subjectId }]);

    // ✅ تنظيف
    setSelectedStageId('');
    setSelectedSubjectId('');
    setSelectedImageId(null);
    setSelectedImagePreview(null);
    setError(null);
    setSubjectSearch('');
    setAllSubjects([]);
    setFilteredSubjects([]);
  };

  // ✅ حذف مرحلة
  const removeStage = (stageId: number) => {
    setStages(prev => prev.filter(s => s.stage_id !== stageId));
  };

  // ✅ حذف مادة
  const removeSubject = (subjectId: number) => {
    setSubjects(prev => prev.filter(s => s.subject_id !== subjectId));
  };

  // ✅ حذف الـ combination كامل
  const removeCombination = (stageId: number, subjectId: number) => {
    removeStage(stageId);
    removeSubject(subjectId);
  };

  // ✅ حفظ البيانات
  const handleSave = () => {
    onSave(stages, subjects);
    onClose();
  };

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

  const handleStageSelectChange = (value: string) => {
    setSelectedStageId(value);
    setSelectedSubjectId('');
  };

  const handleSubjectSelectChange = (value: string) => {
    setSelectedSubjectId(value);
  };

  const handleSubjectSearchChange = (search: string) => {
    setSubjectSearch(search);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage Stages & Subjects
              </DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Add stages with their subjects and images
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 rounded-full">
              <FolderTree className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                {stages.length} stages · {subjects.length} subjects
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* ✅ صف الإضافة (Stage + Subject + Image) */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900 dark:text-white">
              Add New Combination
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              {/* Stage Select */}
              <div>
                <SearchableSelect
                  value={selectedStageId}
                  onChange={handleStageSelectChange}
                  options={allStages}
                  getDisplayName={getStageDisplayWithTeacher}
                  placeholder="Select stage..."
                  searchPlaceholder={lang === 'ar' ? 'بحث عن مرحلة...' : 'Search stage...'}
                />
              </div>

              {/* Subject Select */}
              <div>
                {!selectedStageId ? (
                  <div className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">Select stage first</span>
                  </div>
                ) : loadingSubjects ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                    <span className="ml-2 text-sm text-gray-500">Loading...</span>
                  </div>
                ) : (
                  <SearchableSelect
                    value={selectedSubjectId}
                    onChange={handleSubjectSelectChange}
                    options={filteredSubjects}
                    getDisplayName={(subject: any) => {
                      const name = lang === 'ar' && subject.name_ar ? subject.name_ar : subject.name;
                      return name;
                    }}
                    placeholder={filteredSubjects.length === 0 ? "No subjects" : "Select subject..."}
                    searchPlaceholder={lang === 'ar' ? 'بحث عن مادة...' : 'Search subject...'}
                    onSearchChange={handleSubjectSearchChange}
                    disabled={filteredSubjects.length === 0}
                  />
                )}
              </div>

              {/* Image Upload */}
              <div className="flex items-center gap-2">
                <FileUploader
                  label=""
                  onUploadSuccess={handleImageUpload}
                  multiple={false}
                  accept="image/*"
                  maxFiles={1}
                  uniqueId={`combination-image-${Date.now()}`}
                  className="flex-1"
                />
                {selectedImagePreview && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={selectedImagePreview}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageId(null);
                        setSelectedImagePreview(null);
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Add Button */}
              <Button 
                type="button" 
                onClick={addCombination}
                className="h-10"
                disabled={!selectedStageId || !selectedSubjectId}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>

              {error && (
                <div className="md:col-span-4 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* ✅ القسم الثاني: العناصر المختارة */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-purple-500" />
                <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                  Selected Items
                </Label>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {stages.length} combinations
                </span>
              </div>
            </div>

            {/* قائمة العناصر المختارة */}
            {stages.length > 0 && subjects.length > 0 ? (
              <div className="space-y-2">
                {stages.map((stage, index) => {
                  // ✅ نجيب المادة对应的
                  const subject = subjects[index];
                  if (!subject) return null;
                  
                  return (
                    <SelectedItem
                      key={stage.stage_id}
                      stageId={stage.stage_id}
                      subjectId={subject.subject_id}
                      onRemove={() => removeCombination(stage.stage_id, subject.subject_id)}
                      getStageDisplayName={getStageDisplayName}
                      getSubjectDisplayName={getSubjectDisplayName}
                      stagesMap={stagesMap}
                      onUpdateImage={handleUpdateStageImage}
                      updatingImage={updatingImage}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <School className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No combinations added yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Select a stage, subject, and image then click add</p>
              </div>
            )}
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
              type="button" 
              onClick={handleSave}
              className="px-8 bg-purple-600 hover:bg-purple-700"
              disabled={stages.length === 0}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}