// src/pages/admin/StagesPage.tsx

import type { Stage, StageFilters, PaginatedResponse, StageFormData } from '@/types/stage.types';
import { stageService } from '@/services/stage.service';
import { teacherService } from '@/services/teacher.service';

import { Download, Loader2, User, Filter, Users } from 'lucide-react';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AvatarBadge } from '@/components/lms/AvatarBadge';
import { Search, Plus, ChevronLeft, ChevronRight, Edit, Trash2, Layers, Trash, Archive, RotateCcw, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStages } from '@/hooks/useStages';
import { StageStatusToggle } from '@/components/admin/stages/StageStatusToggle';
import { StageForm } from '@/components/admin/stages/StageForm';
import { StageDeleteDialog } from '@/components/admin/stages/StageDeleteDialog';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function StagesPage() {
  const { dir, lang } = useApp();
  const {
    stages,
    loading,
    total,
    currentPage,
    lastPage,
    showDeleted,
    setShowDeleted,
    selectedStages,
    setSelectedStages,
    createStage,
    updateStage,
    deleteStage,
    forceDeleteStage,
    restoreStage,
    toggleActive,
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore,
    updateFilters,
    clearFilters,
    filters,
    searchQuery,
    setSearchQuery,
    fetchStages,
  } = useStages();

  const [formOpen, setFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<any>(null);
  const [deletingStage, setDeletingStage] = useState<any>(null);
  const [restoringStage, setRestoringStage] = useState<any>(null);
  const [forceDeletingStage, setForceDeletingStage] = useState<any>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState<{ type: 'delete' | 'restore' | 'forceDelete' | null; open: boolean }>({ type: null, open: false });
  const [actionLoading, setActionLoading] = useState(false);
  
  // ✅ فلتر المعلم المميز
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  const text = {
    searchPlaceholder: dir === 'rtl' ? 'البحث باسم المرحلة...' : 'Search by stage name...',
    addStage: dir === 'rtl' ? 'إضافة مرحلة' : 'Add Stage',
    stageName: dir === 'rtl' ? 'اسم المرحلة' : 'Stage Name',
    status: dir === 'rtl' ? 'الحالة' : 'Status',
    createdAt: dir === 'rtl' ? 'تاريخ الإنشاء' : 'Created At',
    teacher: dir === 'rtl' ? 'المعلم المميز' : 'Distinctive Teacher',
    actions: dir === 'rtl' ? 'إجراءات' : 'Actions',
    edit: dir === 'rtl' ? 'تعديل' : 'Edit',
    delete: dir === 'rtl' ? 'حذف' : 'Delete',
    restore: dir === 'rtl' ? 'استعادة' : 'Restore',
    forceDelete: dir === 'rtl' ? 'حذف نهائي' : 'Force Delete',
    showing: dir === 'rtl' ? 'عرض' : 'Showing',
    of: dir === 'rtl' ? 'من' : 'of',
    stages: dir === 'rtl' ? 'مرحلة' : 'stages',
    activeStages: dir === 'rtl' ? 'المراحل النشطة' : 'Active Stages',
    deletedStages: dir === 'rtl' ? 'المراحل المحذوفة' : 'Deleted Stages',
    showDeleted: dir === 'rtl' ? 'عرض المحذوفات' : 'Show Deleted',
    showActive: dir === 'rtl' ? 'عرض النشطة' : 'Show Active',
    selected: dir === 'rtl' ? 'محدد' : 'Selected',
    items: dir === 'rtl' ? 'عناصر' : 'items',
    deleteSelected: dir === 'rtl' ? 'حذف المحدد' : 'Delete Selected',
    restoreSelected: dir === 'rtl' ? 'استعادة المحدد' : 'Restore Selected',
    forceDeleteSelected: dir === 'rtl' ? 'حذف نهائي للمحدد' : 'Force Delete Selected',
    selectAll: dir === 'rtl' ? 'تحديد الكل' : 'Select All',
    noTeacher: dir === 'rtl' ? 'لا يوجد معلم' : 'No teacher',
    allTeachers: dir === 'rtl' ? 'جميع المعلمين' : 'All Teachers',
    filterByTeacher: dir === 'rtl' ? 'فلترة حسب المعلم' : 'Filter by Teacher',
    clearFilter: dir === 'rtl' ? 'إزالة الفلتر' : 'Clear Filter',
    selectTeacher: dir === 'rtl' ? 'اختر المعلم' : 'Select Teacher',
    clearAllFilters: dir === 'rtl' ? 'إزالة جميع الفلاتر' : 'Clear All Filters',
    activeFilters: dir === 'rtl' ? 'فلاتر نشطة' : 'Active Filters',
  };

  // ✅ جلب قائمة المعلمين للفلتر
  useEffect(() => {
    const fetchTeachersForFilter = async () => {
      setTeachersLoading(true);
      try {
        const response = await teacherService.getAllTeachers(
          { active: true },
          10000,
          1,
          '',
          false
        );
        setTeachersList(response.data || []);
      } catch (error) {
        console.error('Error fetching teachers for filter:', error);
      } finally {
        setTeachersLoading(false);
      }
    };
    fetchTeachersForFilter();
  }, []);

  // ✅ تطبيق فلتر المعلم على الـ API مع الحفاظ على الفلاتر الأخرى
  useEffect(() => {
    const currentFilters = { ...filters };
    
    // إزالة فلتر المعلم القديم
    delete currentFilters.distinctive_mark_for_teacher_id;
    
    if (selectedTeacherId === 'all') {
      // إذا كان الكل، نزيل الفلتر
      if (Object.keys(currentFilters).length > 0) {
        updateFilters(currentFilters, false); // ✅ لا نعيد للصفحة 1
      } else {
        clearFilters();
      }
    } else if (selectedTeacherId === 'null') {
      // فلتر المعلم = null (بدون معلم مميز)
      updateFilters({ 
        ...currentFilters,
        distinctive_mark_for_teacher_id: null 
      }, false); // ✅ لا نعيد للصفحة 1
    } else {
      // فلتر بمعلم محدد
      updateFilters({ 
        ...currentFilters,
        distinctive_mark_for_teacher_id: parseInt(selectedTeacherId) 
      }, false); // ✅ لا نعيد للصفحة 1
    }
  }, [selectedTeacherId]);

  // ✅ معالجة البحث مع الحفاظ على الفلاتر الأخرى
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const currentFilters = { ...filters };
    
    // إزالة البحث القديم
    delete currentFilters.search;
    
    if (value.trim()) {
      updateFilters({ 
        ...currentFilters,
        search: value.trim() 
      }, true); // ✅ نعيد للصفحة 1 عند البحث
    } else {
      if (Object.keys(currentFilters).length > 0) {
        updateFilters(currentFilters, true);
      } else {
        clearFilters();
      }
    }
  };

  // ✅ الحصول على اسم المعلم للعرض
  const getTeacherName = (teacher: any) => {
    if (lang === 'ar' && teacher.name_ar) return teacher.name_ar;
    return teacher.name;
  };

  // ✅ الحصول على اسم المعلم المختار في الفلتر
  const getSelectedTeacherName = () => {
    if (selectedTeacherId === 'all') return text.allTeachers;
    if (selectedTeacherId === 'null') return text.noTeacher;
    const teacher = teachersList.find(t => t.id.toString() === selectedTeacherId);
    return teacher ? getTeacherName(teacher) : text.selectTeacher;
  };

  // ✅ حساب عدد الفلاتر النشطة
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedTeacherId !== 'all') count++;
    if (showDeleted) count++;
    // إضافة أي فلاتر أخرى
    const filterKeys = Object.keys(filters);
    if (filterKeys.length > 0) {
      // نخصم الفلاتر اللي حسبناها قبل كده
      const extraFilters = filterKeys.filter(key => 
        key !== 'search' && 
        key !== 'distinctive_mark_for_teacher_id' &&
        key !== 'trashed'
      );
      count += extraFilters.length;
    }
    return count;
  }, [searchQuery, selectedTeacherId, showDeleted, filters]);

  const handleSelectAll = () => {
    if (selectedStages.size === stages.length) {
      setSelectedStages(new Set());
    } else {
      setSelectedStages(new Set(stages.map(s => s.id)));
    }
  };

  const handleSelectStage = (id: number, checked: boolean) => {
    setSelectedStages(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleBulkAction = async () => {
    const ids = Array.from(selectedStages);
    setActionLoading(true);
    try {
      if (bulkActionDialog.type === 'delete') {
        await bulkDelete(ids);
      } else if (bulkActionDialog.type === 'restore') {
        await bulkRestore(ids);
      } else if (bulkActionDialog.type === 'forceDelete') {
        await bulkForceDelete(ids);
      }
      setBulkActionDialog({ type: null, open: false });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    setActionLoading(true);
    try {
      await createStage(data);
      setFormOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    setActionLoading(true);
    try {
      await updateStage(editingStage.id, data);
      setEditingStage(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteStage(deletingStage.id);
      setDeletingStage(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      await restoreStage(restoringStage.id);
      setRestoringStage(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceDelete = async () => {
    setActionLoading(true);
    try {
      await forceDeleteStage(forceDeletingStage.id);
      setForceDeletingStage(null);
    } finally {
      setActionLoading(false);
    }
  };

  const getStageName = (stage: any) => {
    if (!stage) return '';
    if (lang === 'ar' && stage.name_ar) return stage.name_ar;
    if (stage.name) return stage.name;
    return '';
  };

  const getInitials = (stage: any) => {
    const name = getStageName(stage);
    return name.charAt(0).toUpperCase() || '?';
  };

  const handleEditStage = async (stage: any) => {
    try {
      setActionLoading(true);
      const stageWithTeacher = await stageService.getStageWithTeacherId(stage.id);
      setEditingStage(stageWithTeacher);
    } catch (error) {
      console.error('Error fetching stage with teacher:', error);
      setEditingStage(stage);
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ مسح جميع الفلاتر
  const handleClearFilters = () => {
    setSelectedTeacherId('all');
    setSearchQuery('');
    clearFilters();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 dark:border-purple-800 dark:border-t-purple-400" />
          <div className="absolute inset-0 h-12 w-12 rounded-full bg-purple-600/20 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Layers className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {showDeleted ? text.deletedStages : text.activeStages}
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {total} {text.stages}
              {getActiveFiltersCount() > 0 && (
                <span className="ml-2 text-purple-600">
                  ({getActiveFiltersCount()} {text.activeFilters})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportExcelButton
            data={stages} 
            fileName={showDeleted ? "deleted-stages" : "stages-list"}
            label={loading ? "Exporting..." : "Export"}
            disabled={loading || stages.length === 0}
            icon={
              loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )
            }
            className="h-10 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-900/20 dark:text-emerald-400 transition-all duration-300 shadow-sm"
          />

          <Button
            onClick={() => setFormOpen(true)}
            className="gap-2 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md"
          >
            <Plus className="h-4 w-4" />
            {text.addStage}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedStages.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200"
        >
          <span className="text-sm font-medium text-purple-700">
            {selectedStages.size} {text.selected} {text.items}
          </span>
          <div className="flex gap-2">
            {showDeleted ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkActionDialog({ type: 'restore', open: true })}
                  className="gap-2 text-green-700 border-green-300"
                >
                  <RotateCcw className="h-4 w-4" />
                  {text.restoreSelected}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkActionDialog({ type: 'forceDelete', open: true })}
                  className="gap-2 text-red-700 border-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  {text.forceDeleteSelected}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkActionDialog({ type: 'delete', open: true })}
                className="gap-2 text-red-700 border-red-300"
              >
                <Trash2 className="h-4 w-4" />
                {text.deleteSelected}
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Card */}
      <Card className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          {/* ✅ البحث والفلتر */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400`} />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={text.searchPlaceholder}
                className={`${dir === 'rtl' ? 'pr-9' : 'pl-9'} rounded-lg`}
              />
            </div>
            
            {/* ✅ Dropdown فلتر المعلم المميز */}
            <div className="flex items-center gap-2 min-w-[200px]">
              <Users className="h-4 w-4 text-purple-500" />
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
              >
                <SelectTrigger className="rounded-lg border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors">
                  <SelectValue placeholder={text.selectTeacher}>
                    <div className="flex items-center gap-2">
                      <span>{getSelectedTeacherName()}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all" className="font-medium text-purple-600">
                    <div className="flex items-center gap-2">
                      <span>📋</span>
                      <span>{text.allTeachers}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="null" className="text-gray-500">
                    <div className="flex items-center gap-2">
                      <span>🚫</span>
                      <span>{text.noTeacher}</span>
                    </div>
                  </SelectItem>
                  
                  {/* ✅ فصل بين الخيارات */}
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                  
                  {teachersLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                      <span className="ml-2 text-sm text-gray-500">
                        {dir === 'rtl' ? 'جاري التحميل...' : 'Loading...'}
                      </span>
                    </div>
                  ) : teachersList.length === 0 ? (
                    <div className="py-4 text-center text-sm text-gray-500">
                      {dir === 'rtl' ? 'لا يوجد مدرسين' : 'No teachers found'}
                    </div>
                  ) : (
                    teachersList.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                              {getTeacherName(teacher).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span>{getTeacherName(teacher)}</span>
                          {teacher.email && (
                            <span className="text-xs text-gray-400 ml-2">
                              ({teacher.email})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {/* ✅ زر مسح الفلتر */}
              {(searchQuery || selectedTeacherId !== 'all') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearFilters}
                  className="h-8 w-8 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  title={text.clearFilter}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* ✅ عرض معلومات الفلتر */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500">
              {stages.length} {text.stages}
            </span>
            
            {selectedTeacherId !== 'all' && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                <Users className="h-3 w-3 mr-1" />
                {getSelectedTeacherName()}
              </Badge>
            )}
            
            {searchQuery && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <Search className="h-3 w-3 mr-1" />
                {searchQuery}
              </Badge>
            )}

            {showDeleted && (
              <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <Archive className="h-3 w-3 mr-1" />
                {dir === 'rtl' ? 'محذوف' : 'Deleted'}
              </Badge>
            )}

            {getActiveFiltersCount() > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <X className="h-3 w-3 mr-1" />
                {text.clearAllFilters}
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                <TableHead className="w-10">
                  <Checkbox
                    checked={stages.length > 0 && selectedStages.size === stages.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{text.stageName}</TableHead>
                {!showDeleted && <TableHead className="text-center w-32">{text.status}</TableHead>}
                <TableHead className="text-center min-w-[150px]">{text.teacher}</TableHead>
                <TableHead className="text-center hidden lg:table-cell">{text.createdAt}</TableHead>
                <TableHead className="text-center w-24">{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {stages.map((stage, index) => (
                  <motion.tr
                    key={stage.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className="border-gray-200 dark:border-gray-800 hover:bg-gray-50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedStages.has(stage.id)}
                        onCheckedChange={(checked) => handleSelectStage(stage.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarBadge initials={getInitials(stage)} size="sm" variant={showDeleted ? "muted" : "primary"} />
                        <span className={showDeleted ? 'text-gray-500 line-through' : ''}>{getStageName(stage)}</span>
                      </div>
                    </TableCell>
                    {!showDeleted && (
                      <TableCell>
                        <StageStatusToggle stageId={stage.id} active={stage.active} onToggle={toggleActive} />
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      {stage.distinctiveMarkForTeacherName ? (
                        <Badge 
                          variant="secondary" 
                          className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                        >
                          <User className="h-3 w-3 mr-1" />
                          {stage.distinctiveMarkForTeacherName}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">{text.noTeacher}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-gray-500 text-sm hidden lg:table-cell">{stage.createdAt}</TableCell>
                    <TableCell className="text-center">
                      {showDeleted ? (
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setRestoringStage(stage)} 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setForceDeletingStage(stage)} 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditStage(stage)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setDeletingStage(stage)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {stages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {showDeleted ? 'لا توجد مراحل محذوفة' : 'لا توجد نتائج'}
            </p>
            {(searchQuery || selectedTeacherId !== 'all') && (
              <Button
                variant="link"
                onClick={handleClearFilters}
                className="mt-2 text-purple-600"
              >
                {dir === 'rtl' ? 'إزالة جميع الفلاتر' : 'Clear all filters'}
              </Button>
            )}
          </div>
        )}

        {total > 0 && (
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-gray-500">
              {text.showing} {stages.length} {text.of} {total} {text.stages}
              {getActiveFiltersCount() > 0 && (
                <span className="ml-2 text-purple-600">
                  ({getActiveFiltersCount()} {text.activeFilters})
                </span>
              )}
            </p>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => goToPage(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                <ChevronLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </Button>
              <span className="px-3 text-sm flex items-center">
                {currentPage} / {lastPage}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => goToPage(currentPage + 1)} 
                disabled={currentPage === lastPage}
              >
                <ChevronRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <StageForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} loading={actionLoading} />
      <StageForm open={!!editingStage} onClose={() => setEditingStage(null)} onSubmit={handleUpdate} initialData={editingStage} loading={actionLoading} />

      <StageDeleteDialog open={!!deletingStage} onClose={() => setDeletingStage(null)} onConfirm={handleDelete} stageName={getStageName(deletingStage)} loading={actionLoading} />
      <StageDeleteDialog open={!!restoringStage} onClose={() => setRestoringStage(null)} onConfirm={handleRestore} stageName={getStageName(restoringStage)} loading={actionLoading} title="استعادة" confirmText="استعادة" confirmClassName="bg-green-600" />
      <StageDeleteDialog open={!!forceDeletingStage} onClose={() => setForceDeletingStage(null)} onConfirm={handleForceDelete} stageName={getStageName(forceDeletingStage)} loading={actionLoading} title="حذف نهائي" confirmText="حذف نهائي" confirmClassName="bg-red-700" />

      <StageDeleteDialog
        open={bulkActionDialog.open}
        onClose={() => setBulkActionDialog({ type: null, open: false })}
        onConfirm={handleBulkAction}
        stageName={`${selectedStages.size} عناصر`}
        loading={actionLoading}
        title={bulkActionDialog.type === 'delete' ? 'حذف المحدد' : bulkActionDialog.type === 'restore' ? 'استعادة المحدد' : 'حذف نهائي للمحدد'}
        confirmText={bulkActionDialog.type === 'delete' ? 'حذف' : bulkActionDialog.type === 'restore' ? 'استعادة' : 'حذف نهائي'}
        confirmClassName={bulkActionDialog.type === 'delete' ? 'bg-red-600' : bulkActionDialog.type === 'restore' ? 'bg-green-600' : 'bg-red-700'}
      />
    </div>
  );
}