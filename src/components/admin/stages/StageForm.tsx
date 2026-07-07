/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/stages/StageForm.tsx

import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect, useRef } from 'react';
import type { Stage, StageFormData } from '@/types/stage.types';
import { teacherService } from '@/services/teacher.service';
import { Loader2, Search, X, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StageFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Stage | null;
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
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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

export function StageForm({ open, onClose, onSubmit, initialData, loading }: StageFormProps) {
  const { t, dir, lang } = useApp();
  const [formData, setFormData] = useState<StageFormData>({
    name: '',
    name_ar: '',
    position: 0,
    active: true,
    image: null,
    distinctive_mark_for_teacher_id: null,
  });

  const [teachers, setTeachers] = useState<any[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersLoaded, setTeachersLoaded] = useState(false);

  useEffect(() => {
    if (initialData) {
      const teacherId = (initialData as any).distinctive_mark_for_teacher_id || null;
      
      setFormData({
        name: initialData.name,
        name_ar: initialData.name_ar || '',
        position: initialData.position,
        active: initialData.active,
        image: null,
        distinctive_mark_for_teacher_id: teacherId,
      });
    } else {
      setFormData({
        name: '',
        name_ar: '',
        position: 0,
        active: true,
        image: null,
        distinctive_mark_for_teacher_id: null,
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (open && !teachersLoaded) {
      fetchTeachers();
    }
  }, [open, teachersLoaded]);

  const fetchTeachers = async () => {
    setTeachersLoading(true);
    try {
      const response = await teacherService.getAllTeachers(
        { active: true },
        100,
        1,
        '',
        false
      );
      setTeachers(response.data);
      setTeachersLoaded(true);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setTeachersLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = initialData
      ? { ...formData, id: initialData.id }
      : formData;
    await onSubmit(submitData);
    if (!initialData) {
      setFormData({
        name: '',
        name_ar: '',
        position: 0,
        active: true,
        image: null,
        distinctive_mark_for_teacher_id: null,
      });
    }
    onClose();
  };

  const getTeacherName = (teacher: any) => {
    if (lang === 'ar' && teacher.name_ar) return teacher.name_ar;
    return teacher.name;
  };

  const getTeacherDisplayWithEmail = (teacher: any) => {
    const name = getTeacherName(teacher);
    if (teacher.email) {
      return `${name} (${teacher.email})`;
    }
    return name;
  };

  const getSelectedTeacherName = () => {
    if (formData.distinctive_mark_for_teacher_id) {
      const teacher = teachers.find(t => t.id === formData.distinctive_mark_for_teacher_id);
      return teacher ? getTeacherName(teacher) : null;
    }
    
    if (initialData?.distinctiveMarkForTeacherName && !formData.distinctive_mark_for_teacher_id) {
      return initialData.distinctiveMarkForTeacherName;
    }
    
    return null;
  };

  const isFromInitialData = () => {
    return initialData?.distinctiveMarkForTeacherName && 
           !formData.distinctive_mark_for_teacher_id;
  };

  // ✅ تحضير خيارات المعلمين مع خيار "لا يوجد معلم"
  const teacherOptions = [
    { id: null, name: dir === 'rtl' ? 'لا يوجد معلم' : 'No teacher' },
    ...teachers
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {initialData
              ? (dir === 'rtl' ? 'تعديل المرحلة' : 'Edit Stage')
              : (dir === 'rtl' ? 'إضافة مرحلة جديدة' : 'Add New Stage')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'اسم المرحلة (عربي)' : 'Stage Name (Arabic)'}
            </Label>
            <Input
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              placeholder={dir === 'rtl' ? 'أدخل اسم المرحلة بالعربية' : 'Enter stage name in Arabic'}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'اسم المرحلة (إنجليزي)' : 'Stage Name (English)'}
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={dir === 'rtl' ? 'أدخل اسم المرحلة بالإنجليزية' : 'Enter stage name in English'}
              className="rounded-xl"
              required
            />
          </div>

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

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'المعلم المميز' : 'Distinctive Teacher'}
            </Label>
            
            {teachersLoading ? (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-sm text-gray-500">
                  {dir === 'rtl' ? 'جاري تحميل المدرسين...' : 'Loading teachers...'}
                </span>
              </div>
            ) : (
              <SearchableSelect
                value={formData.distinctive_mark_for_teacher_id}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    distinctive_mark_for_teacher_id: value,
                  });
                }}
                options={teacherOptions}
                getDisplayName={getTeacherDisplayWithEmail}
                placeholder={dir === 'rtl' ? 'اختر المعلم...' : 'Select teacher...'}
                searchPlaceholder={dir === 'rtl' ? 'بحث عن معلم...' : 'Search teacher...'}
              />
            )}

            {isFromInitialData() && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <span>⚠️</span>
                {dir === 'rtl' 
                  ? `المعلم الحالي: ${initialData.distinctiveMarkForTeacherName}` 
                  : `Current teacher: ${initialData.distinctiveMarkForTeacherName}`}
              </p>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              {dir === 'rtl' 
                ? 'اختر المعلم الذي سيكون مميزاً لهذه المرحلة (اختياري)' 
                : 'Select the teacher who will be distinctive for this stage (optional)'}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-gray-700 dark:text-gray-300">
              {dir === 'rtl' ? 'الحالة' : 'Status'}
            </Label>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {loading
                ? (dir === 'rtl' ? 'جاري الحفظ...' : 'Saving...')
                : (initialData
                    ? (dir === 'rtl' ? 'تحديث' : 'Update')
                    : (dir === 'rtl' ? 'إضافة' : 'Create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}