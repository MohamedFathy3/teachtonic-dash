/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/subjects/SubjectForm.tsx

import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect, useRef, useCallback } from 'react';
import { subjectService } from '@/services/subject.service';
import { subjectToFormData } from '@/types/subject.types';
import type { SubjectFormData } from '@/types/subject.types';
import { Loader2, Search, X, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface SubjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SubjectFormData) => Promise<void>;
  subjectId?: number | null;
  loading?: boolean;
}

// ✅ مكون Searchable Select
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
  value: number | null;
  onChange: (value: number | null) => void;
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

  const selectedOption = options.find((opt) => opt.id === value);

  const handleSelect = (option: any) => {
    onChange(option.id);
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
          "hover:border-purple-400 dark:hover:border-purple-500",
          isOpen && "border-purple-500 ring-2 ring-purple-500/20",
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
              className="w-full h-8 pl-8 pr-3 text-sm bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            {search && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch('');
                  if (onSearchChange) {
                    onSearchChange('');
                  }
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
                <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
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
                    value === option.id && "bg-purple-50 dark:bg-purple-900/20 text-purple-600"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{getDisplayName(option)}</span>
                    {value === option.id && (
                      <Check className="h-4 w-4 text-purple-500 flex-shrink-0" />
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

export function SubjectForm({ open, onClose, onSubmit, subjectId, loading }: SubjectFormProps) {
  const { dir, lang } = useApp();
  
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    name_ar: '',
    stage_id: 0,
    position: 0,
    active: true,
    image: null,
  });
  
  const [fetchingSubject, setFetchingSubject] = useState(false);
  const [stages, setStages] = useState<any[]>([]);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [stagesLoaded, setStagesLoaded] = useState(false);
  const [stageSearch, setStageSearch] = useState('');

  // ✅ جلب المراحل
  const fetchStages = useCallback(async () => {
    setStagesLoading(true);
    try {
      const response = await api.post('/stage/index', {
        perPage: 1000,
      });
      const stagesData = response.data?.data || [];
      setStages(stagesData);
      setStagesLoaded(true);
    } catch (error) {
      console.error('Error fetching stages:', error);
    } finally {
      setStagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !stagesLoaded) {
      fetchStages();
    }
  }, [open, stagesLoaded, fetchStages]);

  // ✅ جلب بيانات المادة عند التعديل
  useEffect(() => {
    const fetchSubjectData = async () => {
      if (!open) return;
      
      if (subjectId) {
        setFetchingSubject(true);
        try {
          const subject = await subjectService.getSubject(subjectId);
          const convertedData = subjectToFormData(subject);
          setFormData(convertedData);
        } catch (error) {
          console.error('Failed to fetch subject:', error);
        } finally {
          setFetchingSubject(false);
        }
      } else {
        setFormData({
          name: '',
          name_ar: '',
          stage_id: 0,
          position: 0,
          active: true,
          image: null,
        });
      }
    };

    fetchSubjectData();
  }, [subjectId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.stage_id || formData.stage_id === 0) {
      console.error('Stage is required');
      return;
    }
    
    await onSubmit(formData);
    if (!subjectId) {
      setFormData({
        name: '',
        name_ar: '',
        stage_id: 0,
        position: 0,
        active: true,
        image: null,
      });
    }
    onClose();
  };

  // ✅ دالة للحصول على اسم المرحلة مع المعلم المميز
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

  if (fetchingSubject) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2">Loading subject data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {subjectId
              ? (dir === 'rtl' ? 'تعديل المادة' : 'Edit Subject')
              : (dir === 'rtl' ? 'إضافة مادة جديدة' : 'Add New Subject')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 🔥 Stage Select with SearchableSelect */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'المرحلة' : 'Stage'} <span className="text-red-500">*</span>
            </Label>
            
            {stagesLoading ? (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-sm text-gray-500">
                  {dir === 'rtl' ? 'جاري تحميل المراحل...' : 'Loading stages...'}
                </span>
              </div>
            ) : (
              <SearchableSelect
                value={formData.stage_id === 0 ? null : formData.stage_id}
                onChange={(value) => setFormData({ ...formData, stage_id: value || 0 })}
                options={stages}
                getDisplayName={getStageDisplayWithTeacher}
                placeholder={dir === 'rtl' ? 'اختر المرحلة...' : 'Select stage...'}
                searchPlaceholder={dir === 'rtl' ? 'بحث عن مرحلة...' : 'Search stage...'}
              />
            )}
            
            {!formData.stage_id && (
              <p className="text-xs text-red-500 mt-1">
                {dir === 'rtl' ? 'المرحلة مطلوبة' : 'Stage is required'}
              </p>
            )}
          </div>

          {/* Subject Name Arabic */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'اسم المادة (عربي)' : 'Subject Name (Arabic)'}
            </Label>
            <Input
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              placeholder={dir === 'rtl' ? 'أدخل اسم المادة بالعربية' : 'Enter subject name in Arabic'}
              className="rounded-xl"
            />
          </div>

          {/* Subject Name English */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'اسم المادة (إنجليزي)' : 'Subject Name (English)'}
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={dir === 'rtl' ? 'أدخل اسم المادة بالإنجليزية' : 'Enter subject name in English'}
              className="rounded-xl"
              required
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'الترتيب' : 'Position'}
            </Label>
            <Input
              type="number"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              placeholder={dir === 'rtl' ? 'أدخل الترتيب' : 'Enter position'}
              className="rounded-xl"
              required
            />
          </div>

          {/* Status Switch */}
          <div className="flex items-center justify-between">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'الحالة' : 'Status'}
            </Label>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
          </div>

          {/* Actions Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.stage_id} 
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {loading
                ? (dir === 'rtl' ? 'جاري الحفظ...' : 'Saving...')
                : (subjectId
                    ? (dir === 'rtl' ? 'تحديث' : 'Update')
                    : (dir === 'rtl' ? 'إضافة' : 'Create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}