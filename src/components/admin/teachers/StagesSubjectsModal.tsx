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
  Check,
  AlertCircle,
  School,
  BookOpen,
  BookMarked,
  FolderTree,
  RefreshCw,
  Search,
  ChevronDown,
  Edit,
  Save,
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  initialStages: TeacherStagePayload[];
  initialSubjects: TeacherSubjectPayload[];
  onSave: (stages: TeacherStagePayload[], subjects: TeacherSubjectPayload[]) => void;
}

// ✅ دالة مساعدة لجلب fullUrl من الـ API
const fetchImageUrl = async (imageId: number): Promise<string | null> => {
  try {
    const response = await api.get(`/media/${imageId}`);
    return response.data?.data?.fullUrl || null;
  } catch (error) {
    console.error('❌ Failed to fetch image URL:', error);
    return null;
  }
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

// ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅
// ✅ مكون Stage Group مع Edit Mode
// ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅
const StageGroup = ({ 
  stage, 
  subjects, 
  index,
  onRemove,
  onEdit,
  getStageDisplayName,
  getSubjectDisplayName,
  stagesMap,
  allStages,
  allSubjects,
  lang,
  onUpdateImage,
  updatingImage,
}: { 
  stage: TeacherStagePayload;
  subjects: TeacherSubjectPayload[];
  index: number;
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
  getStageDisplayName: (id: number) => string;
  getSubjectDisplayName: (id: number) => string;
  stagesMap: Map<number, any>;
  allStages: any[];
  allSubjects: any[];
  lang: string;
  onUpdateImage: (stageId: number, imageId: number) => Promise<void>;
  updatingImage: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editStageId, setEditStageId] = useState<string>(stage.stage_id.toString());
  const [editSubjectIds, setEditSubjectIds] = useState<string[]>(
    subjects.map(s => s.subject_id.toString())
  );
  const [editImageId, setEditImageId] = useState<number | null>(stage.image || null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState<number>(Date.now());
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  // جلب صورة المرحلة
  useEffect(() => {
    if (stage.image) {
      setLoadingImage(true);
      fetchImageUrl(stage.image).then((url) => {
        setImageUrl(url);
        setLoadingImage(false);
      });
    }
  }, [stage.image]);

  // جلب المواد للتعديل
  const fetchEditSubjects = useCallback(async (stageId: number) => {
    if (!stageId) {
      setFilteredSubjects([]);
      return;
    }

    setLoadingSubjects(true);
    try {
      const response = await api.post('/subject/index', {
        perPage: 1000,
        filters: {
          stage_id: stageId
        }
      });
      
      const subjectsData = response.data?.data || [];
      setFilteredSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  useEffect(() => {
    if (isEditing && editStageId) {
      fetchEditSubjects(parseInt(editStageId));
    }
  }, [isEditing, editStageId, fetchEditSubjects]);

  // رفع الصورة في التعديل
  const handleEditImageUpload = async (id: number) => {
    setEditImageId(id);
    const url = await fetchImageUrl(id);
    setEditImagePreview(url);
    setUploadKey(Date.now());
  };

  // ✅ اختيار/إلغاء اختيار مادة في التعديل
  const toggleEditSubject = (subjectId: string) => {
    setEditSubjectIds(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  // ✅ حفظ التعديلات
  const handleSaveEdit = () => {
    setError(null);
    
    if (!editStageId) {
      setError('Please select a stage');
      return;
    }

    if (editSubjectIds.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    const newStageId = parseInt(editStageId);
    const newSubjectIds = editSubjectIds.map(id => parseInt(id));

    // ✅ تحديث المرحلة
    onEdit(index, newStageId, newSubjectIds, editImageId || 0);

    // ✅ تحديث الصورة لو اتغيرت
    if (editImageId && editImageId !== stage.image) {
      onUpdateImage(newStageId, editImageId);
    }

    setIsEditing(false);
    setEditImagePreview(null);
    
    toast({
      title: "Success",
      description: "Stage and subjects updated successfully",
    });
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

  const getSubjectDisplay = (subject: any) => {
    if (lang === 'ar' && subject?.name_ar) return subject.name_ar;
    return subject?.name || `Subject ${subject.id}`;
  };

  // ✅ عرض التعديل
  if (isEditing) {
    return (
      <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-400 dark:border-blue-500 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Editing Stage #{index + 1}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setEditImagePreview(null);
              setError(null);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Stage Select */}
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Stage</Label>
            <SearchableSelect
              value={editStageId}
              onChange={setEditStageId}
              options={allStages}
              getDisplayName={getStageDisplayWithTeacher}
              placeholder="Select stage..."
              searchPlaceholder={lang === 'ar' ? 'بحث عن مرحلة...' : 'Search stage...'}
            />
          </div>

          {/* Subjects Multi Select */}
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Subjects</Label>
            {loadingSubjects ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 border border-gray-200 dark:border-gray-700 rounded-lg">
                {filteredSubjects.map((subject: any) => {
                  const id = subject.id.toString();
                  const name = lang === 'ar' && subject.name_ar ? subject.name_ar : subject.name;
                  const isSelected = editSubjectIds.includes(id);
                  
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleEditSubject(id)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border transition-all",
                        isSelected 
                          ? "bg-purple-500 text-white border-purple-500" 
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-400"
                      )}
                    >
                      <BookMarked className="w-3 h-3" />
                      {name}
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
                {filteredSubjects.length === 0 && (
                  <span className="text-xs text-gray-400 p-1">No subjects available</span>
                )}
              </div>
            )}
            <span className="text-xs text-gray-400 mt-1 block">
              Selected: {editSubjectIds.length} subjects
            </span>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Image</Label>
            <div className="flex items-center gap-2">
              <FileUploader
                key={`edit-upload-${index}-${uploadKey}`}
                label=""
                onUploadSuccess={handleEditImageUpload}
                multiple={false}
                accept="image/*"
                maxFiles={1}
                uniqueId={`edit-image-${index}-${uploadKey}`}
                className="flex-1"
                defaultImageUrl={imageUrl}
                defaultImageId={stage.image}
                onRemoveImage={() => {
                  setEditImageId(null);
                  setEditImagePreview(null);
                  setUploadKey(Date.now());
                }}
              />
              {(editImagePreview || imageUrl) && (
                <div className="relative flex-shrink-0">
                  <img
                    src={editImagePreview || imageUrl || ''}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      console.error('❌ Preview image failed to load:', editImagePreview || imageUrl);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditImageId(null);
                      setEditImagePreview(null);
                      setUploadKey(Date.now());
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              setEditImagePreview(null);
              setError(null);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveEdit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>
    );
  }

  // ✅ عرض عادي
  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all hover:border-purple-400 dark:hover:border-purple-500 group">
      <div className="flex items-center justify-between">
        {/* Stage */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <School className="w-4 h-4 text-blue-500" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {getStageDisplayName(stage.stage_id)}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {subjects.length} subjects
          </span>
        </div>

        {/* Image preview */}
        {loadingImage ? (
          <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          </div>
        ) : imageUrl ? (
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
        ) : (
          <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-4 h-4 text-gray-400" />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all opacity-0 group-hover:opacity-100"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ */}
      {/* ✅ Subjects - بنستخدم getSubjectDisplayName اللي بتجيب الاسم */}
      {/* ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ */}
      <div className="flex flex-wrap gap-1.5 mt-2 pl-11 max-h-32 overflow-y-auto">
        {subjects.map((subject, idx) => (
          <span 
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
          >
            <BookMarked className="w-3 h-3" />
            {getSubjectDisplayName(subject.subject_id)}
          </span>
        ))}
      </div>
    </div>
  );
};

export function StagesSubjectsModal({ open, onClose, initialStages, initialSubjects, onSave }: Props) {
  const { t, dir, lang } = useApp();
  
  const [stages, setStages] = useState<TeacherStagePayload[]>(initialStages);
  const [subjects, setSubjects] = useState<TeacherSubjectPayload[]>(initialSubjects);
  
  // ✅ State للإضافة
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [uploadKey, setUploadKey] = useState<number>(Date.now());

  const [subjectSearch, setSubjectSearch] = useState<string>('');

  const [stagesMap, setStagesMap] = useState<Map<number, any>>(new Map());
  const [subjectsMap, setSubjectsMap] = useState<Map<number, any>>(new Map());
  const [allStages, setAllStages] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([]);

  // جلب المراحل
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

  // جلب المواد حسب المرحلة المختارة
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
        filters: {
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
      
      // ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅
      // ✅ تحديث subjectsMap بكل المواد
      // ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅
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

  // عند تغيير المرحلة
  useEffect(() => {
    if (selectedStageId) {
      fetchSubjectsByStage(parseInt(selectedStageId));
      setSelectedSubjectIds([]);
    } else {
      setAllSubjects([]);
      setFilteredSubjects([]);
    }
  }, [selectedStageId, fetchSubjectsByStage]);

  // فلترة المواد حسب البحث
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

  // تحديث صورة المرحلة
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

  // رفع الصورة للإضافة
  const handleImageUpload = async (id: number) => {
    setSelectedImageId(id);
    const url = await fetchImageUrl(id);
    setSelectedImagePreview(url);
    setUploadKey(Date.now());
  };

  // ✅ اختيار/إلغاء اختيار مادة للإضافة
  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  // ✅ عرض المواد المختارة للإضافة
  const renderSelectedSubjects = () => {
    if (selectedSubjectIds.length === 0) {
      return <span className="text-xs text-gray-400">No subjects selected</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5 mt-1">
        {selectedSubjectIds.map(id => {
          const subject = subjectsMap.get(parseInt(id));
          const name = lang === 'ar' && subject?.name_ar ? subject.name_ar : subject?.name || `Subject ${id}`;
          return (
            <span 
              key={id}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
            >
              <BookMarked className="w-3 h-3" />
              {name}
              <button
                type="button"
                onClick={() => toggleSubject(id)}
                className="hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
      </div>
    );
  };

  // ✅ إضافة Stage مع Subjects
  const addCombination = () => {
    setError(null);
    
    if (!selectedStageId) {
      setError('Please select a stage');
      return;
    }

    if (selectedSubjectIds.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    const stageId = parseInt(selectedStageId);

    if (stages.some(s => s.stage_id === stageId)) {
      setError('This stage is already added');
      return;
    }

    setStages(prev => [...prev, { 
      stage_id: stageId, 
      image: selectedImageId || 0 
    }]);

    const newSubjects = selectedSubjectIds.map(id => ({ subject_id: parseInt(id) }));
    setSubjects(prev => [...prev, ...newSubjects]);

    setSelectedStageId('');
    setSelectedSubjectIds([]);
    setSelectedImageId(null);
    setSelectedImagePreview(null);
    setError(null);
    setSubjectSearch('');
    setAllSubjects([]);
    setFilteredSubjects([]);
    setUploadKey(Date.now());

    toast({
      title: "Success",
      description: `Added stage with ${newSubjects.length} subject(s)`,
    });
  };

  // ✅ حذف Stage مع Subjects
  const removeStageGroup = (index: number) => {
    const subjectsPerStage = Math.ceil(subjects.length / stages.length);
    const start = index * subjectsPerStage;
    const end = Math.min(start + subjectsPerStage, subjects.length);
    
    setStages(prev => prev.filter((_, i) => i !== index));
    setSubjects(prev => prev.filter((_, i) => i < start || i >= end));
  };

  // ✅ تحديث Stage مع Subjects
  const updateStageGroup = (index: number, newStageId: number, newSubjectIds: number[], newImageId: number) => {
    // ✅ تحديث المرحلة
    setStages(prev => {
      const newStages = [...prev];
      newStages[index] = { 
        ...newStages[index], 
        stage_id: newStageId,
        image: newImageId || newStages[index].image || 0
      };
      return newStages;
    });

    // ✅ تحديث المواد
    const subjectsPerStage = Math.ceil(subjects.length / stages.length);
    const start = index * subjectsPerStage;
    const end = Math.min(start + subjectsPerStage, subjects.length);
    
    // ✅ حذف المواد القديمة
    const remainingSubjects = subjects.filter((_, i) => i < start || i >= end);
    
    // ✅ إضافة المواد الجديدة
    const newSubjects = newSubjectIds.map(id => ({ subject_id: id }));
    const updatedSubjects = [...remainingSubjects];
    updatedSubjects.splice(start, 0, ...newSubjects);
    
    setSubjects(updatedSubjects);
  };

  // ✅ جلب المواد التابعة لمرحلة
  const getSubjectsForStage = (index: number): TeacherSubjectPayload[] => {
    const totalStages = stages.length;
    if (totalStages === 0 || subjects.length === 0) return [];
    
    const subjectsPerStage = Math.ceil(subjects.length / totalStages);
    const start = index * subjectsPerStage;
    const end = Math.min(start + subjectsPerStage, subjects.length);
    
    return subjects.slice(start, end);
  };

  // حفظ البيانات
  const handleSave = () => {
    onSave(stages, subjects);
    onClose();
  };

  // ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅
  // ✅ دالة جلب اسم المادة - بتجيب من subjectsMap
  // ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅
  const getSubjectDisplayName = (subjectId: number) => {
    const subject = subjectsMap.get(subjectId);
    if (!subject) return `Subject #${subjectId}`;
    
    if (lang === 'ar' && subject.name_ar) {
      return subject.name_ar;
    }
    return subject.name || `Subject #${subjectId}`;
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

  const handleStageSelectChange = (value: string) => {
    setSelectedStageId(value);
    setSelectedSubjectIds([]);
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
                Add stages with multiple subjects
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
          {/* صف الإضافة */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900 dark:text-white">
              Add New Stage with Subjects
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

              {/* Subject Select - Multi Select */}
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
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                      {filteredSubjects.map((subject: any) => {
                        const id = subject.id.toString();
                        const name = lang === 'ar' && subject.name_ar ? subject.name_ar : subject.name;
                        const isSelected = selectedSubjectIds.includes(id);
                        
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => toggleSubject(id)}
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border transition-all",
                              isSelected 
                                ? "bg-purple-500 text-white border-purple-500 hover:bg-purple-600" 
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-400"
                            )}
                          >
                            <BookMarked className="w-3 h-3" />
                            {name}
                            {isSelected && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="text-xs">
                      <span className="text-gray-500">Selected: </span>
                      {renderSelectedSubjects()}
                    </div>
                    
                    {filteredSubjects.length === 0 && (
                      <p className="text-xs text-gray-400">No subjects available for this stage</p>
                    )}
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="flex items-center gap-2">
                <FileUploader
                  key={`add-upload-${uploadKey}`}
                  label=""
                  onUploadSuccess={handleImageUpload}
                  multiple={false}
                  accept="image/*"
                  maxFiles={1}
                  uniqueId={`add-image-${uploadKey}`}
                  className="flex-1"
                />
                {selectedImagePreview && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={selectedImagePreview}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        console.error('❌ Preview image failed to load:', selectedImagePreview);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageId(null);
                        setSelectedImagePreview(null);
                        setUploadKey(Date.now());
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
                disabled={!selectedStageId || selectedSubjectIds.length === 0}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add ({selectedSubjectIds.length})
              </Button>

              {error && (
                <div className="md:col-span-4 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* ✅ القسم التاني: العناصر المختارة مع Edit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-purple-500" />
                <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                  Selected Combinations
                </Label>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {stages.length} stages · {subjects.length} subjects
                </span>
              </div>
              {stages.length > 0 && (
                <span className="text-xs text-gray-400">Hover to show actions</span>
              )}
            </div>

            {stages.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stages.map((stage, index) => {
                  const stageSubjects = getSubjectsForStage(index);
                  if (stageSubjects.length === 0) return null;
                  
                  return (
                    <StageGroup
                      key={`stage-group-${index}`}
                      stage={stage}
                      subjects={stageSubjects}
                      index={index}
                      onRemove={removeStageGroup}
                      onEdit={updateStageGroup}
                      getStageDisplayName={getStageDisplayName}
                      getSubjectDisplayName={getSubjectDisplayName}
                      stagesMap={stagesMap}
                      allStages={allStages}
                      allSubjects={allSubjects}
                      lang={lang}
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
                <p className="text-xs text-gray-400 dark:text-gray-500">Select a stage and multiple subjects then click add</p>
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