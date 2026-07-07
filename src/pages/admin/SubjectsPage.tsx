/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/SubjectsPage.tsx
import { Download, Loader2, User, Users } from "lucide-react";
import { ExportExcelButton } from "@/components/common/ExportExcelButton";
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AvatarBadge } from '@/components/lms/AvatarBadge';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Layers,
  Trash,
  Archive,
  RotateCcw,
  Eye,
  X
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSubjects } from '@/hooks/useSubjects';
import { SubjectStatusToggle } from '@/components/admin/subjects/SubjectStatusToggle';
import { SubjectForm } from '@/components/admin/subjects/SubjectForm';
import { SubjectDeleteDialog } from '@/components/admin/subjects/SubjectDeleteDialog';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { teacherService } from '@/services/teacher.service';

export function SubjectsPage() {
  const { dir, lang } = useApp();
  const navigate = useNavigate();

  const {
    subjects,
    loading,
    total,
    currentPage,
    lastPage,
    showDeleted,
    setShowDeleted,
    selectedSubjects,
    setSelectedSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    forceDeleteSubject,
    restoreSubject,
    toggleActive,
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore
  } = useSubjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<any>(null);
  const [restoringSubject, setRestoringSubject] = useState<any>(null);
  const [forceDeletingSubject, setForceDeletingSubject] = useState<any>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState<{ type: 'delete' | 'restore' | 'forceDelete' | null; open: boolean }>({ type: null, open: false });
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ فلتر المعلم المميز
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  const text = {
    searchPlaceholder: dir === 'rtl' ? 'البحث باسم المادة...' : 'Search by subject name...',
    addSubject: dir === 'rtl' ? 'إضافة مادة' : 'Add Subject',
    subjectName: dir === 'rtl' ? 'اسم المادة' : 'Subject Name',
    position: dir === 'rtl' ? 'الترتيب' : 'Position',
    status: dir === 'rtl' ? 'الحالة' : 'Status',
    createdAt: dir === 'rtl' ? 'تاريخ الإنشاء' : 'Created At',
    actions: dir === 'rtl' ? 'إجراءات' : 'Actions',
    edit: dir === 'rtl' ? 'تعديل' : 'Edit',
    delete: dir === 'rtl' ? 'حذف' : 'Delete',
    restore: dir === 'rtl' ? 'استعادة' : 'Restore',
    forceDelete: dir === 'rtl' ? 'حذف نهائي' : 'Force Delete',
    show: dir === 'rtl' ? 'عرض' : 'Show',
    showing: dir === 'rtl' ? 'عرض' : 'Showing',
    of: dir === 'rtl' ? 'من' : 'of',
    subjects: dir === 'rtl' ? 'مادة' : 'subjects',
    activeSubjects: dir === 'rtl' ? 'المواد النشطة' : 'Active Subjects',
    deletedSubjects: dir === 'rtl' ? 'المواد المحذوفة' : 'Deleted Subjects',
    showDeleted: dir === 'rtl' ? 'عرض المحذوفات' : 'Show Deleted',
    showActive: dir === 'rtl' ? 'عرض النشطة' : 'Show Active',
    selected: dir === 'rtl' ? 'محدد' : 'Selected',
    items: dir === 'rtl' ? 'عناصر' : 'items',
    deleteSelected: dir === 'rtl' ? 'حذف المحدد' : 'Delete Selected',
    restoreSelected: dir === 'rtl' ? 'استعادة المحدد' : 'Restore Selected',
    forceDeleteSelected: dir === 'rtl' ? 'حذف نهائي للمحدد' : 'Force Delete Selected',
    selectAll: dir === 'rtl' ? 'تحديد الكل' : 'Select All',
    stage: dir === 'rtl' ? 'المرحلة' : 'Stage',
    teacher: dir === 'rtl' ? 'المعلم المميز' : 'Distinctive Teacher',
    noTeacher: dir === 'rtl' ? 'لا يوجد معلم' : 'No teacher',
    allTeachers: dir === 'rtl' ? 'جميع المعلمين' : 'All Teachers',
    filterByTeacher: dir === 'rtl' ? 'فلترة حسب المعلم' : 'Filter by Teacher',
    clearFilter: dir === 'rtl' ? 'إزالة الفلتر' : 'Clear Filter',
    selectTeacher: dir === 'rtl' ? 'اختر المعلم' : 'Select Teacher',
  };

  // ✅ جلب قائمة المدرسين للفلتر
  useEffect(() => {
    const fetchTeachersForFilter = async () => {
      setTeachersLoading(true);
      try {
        const response = await teacherService.getAllTeachers(
          { active: true },
          100,
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

  // ✅ فلترة المواد حسب المعلم المميز في المرحلة
  const filteredSubjects = useMemo(() => {
    let result = subjects;
    
    // ✅ فلترة حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (subject) =>
          (subject.name && subject.name.toLowerCase().includes(query)) ||
          (subject.name_ar && subject.name_ar.toLowerCase().includes(query)) ||
          (subject.stage?.name && subject.stage.name.toLowerCase().includes(query)) ||
          (subject.stage?.name_ar && subject.stage.name_ar.toLowerCase().includes(query))
      );
    }
    
    // ✅ فلترة حسب المعلم المميز في المرحلة
    if (selectedTeacherId !== 'all') {
      if (selectedTeacherId === 'null') {
        // ✅ عرض المواد التي ليس لها معلم مميز في المرحلة
        result = result.filter(subject => !subject.stage?.distinctiveMarkForTeacherName);
      } else {
        // ✅ عرض المواد التي لها معلم مميز معين في المرحلة
        const selectedTeacher = teachersList.find(t => t.id.toString() === selectedTeacherId);
        if (selectedTeacher) {
          result = result.filter(subject => 
            subject.stage?.distinctiveMarkForTeacherName === selectedTeacher.name
          );
        }
      }
    }
    
    return result;
  }, [subjects, searchQuery, selectedTeacherId, teachersList]);

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

  // ✅ الحصول على اسم المرحلة
  const getStageName = (subject: any) => {
    if (!subject?.stage) return '-';
    if (lang === 'ar' && subject.stage.name_ar) return subject.stage.name_ar;
    return subject.stage.name || '-';
  };

  // ✅ الحصول على اسم المعلم المميز للمرحلة
  const getDistinctiveTeacherName = (subject: any) => {
    return subject?.stage?.distinctiveMarkForTeacherName || null;
  };

  const handleSelectAll = () => {
    if (selectedSubjects.size === filteredSubjects.length) {
      setSelectedSubjects(new Set());
    } else {
      setSelectedSubjects(new Set(filteredSubjects.map(s => s.id)));
    }
  };

  const handleSelectSubject = (id: number, checked: boolean) => {
    setSelectedSubjects(prev => {
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
    const ids = Array.from(selectedSubjects);
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
      await createSubject(data);
      setFormOpen(false);
      setEditingSubjectId(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingSubjectId) return;
    setActionLoading(true);
    try {
      await updateSubject(editingSubjectId, data);
      setEditingSubjectId(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (subjectId: number) => {
    setEditingSubjectId(subjectId);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteSubject(deletingSubject.id);
      setDeletingSubject(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      await restoreSubject(restoringSubject.id);
      setRestoringSubject(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceDelete = async () => {
    setActionLoading(true);
    try {
      await forceDeleteSubject(forceDeletingSubject.id);
      setForceDeletingSubject(null);
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ مسح الفلتر
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTeacherId('all');
  };

  const getSubjectName = (subject: any) => {
    if (!subject) return '';
    if (lang === 'ar' && subject.name_ar) return subject.name_ar;
    if (subject.name) return subject.name;
    return '';
  };

  const getInitials = (subject: any) => {
    const name = getSubjectName(subject);
    return name.charAt(0).toUpperCase() || '?';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
          <div className="absolute inset-0 h-12 w-12 rounded-full bg-purple-600/20 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {showDeleted ? text.deletedSubjects : text.activeSubjects}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {total} {text.subjects}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ExportExcelButton
            data={subjects}
            fileName={showDeleted ? "deleted-subjects" : "subjects-list"}
            label={loading ? "Preparing..." : "Export"}
            icon={
              loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )
            }
            className="h-10 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-900/20 dark:text-emerald-400 transition-all"
          />
          <Button
            onClick={() => {
              setEditingSubjectId(null);
              setFormOpen(true);
            }}
            className="gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            <Plus className="h-4 w-4" />
            {text.addSubject}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedSubjects.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200"
        >
          <span className="text-sm font-medium text-purple-700">
            {selectedSubjects.size} {text.selected} {text.items}
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
              
              {(searchQuery || selectedTeacherId !== 'all') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
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
              {filteredSubjects.length} {text.subjects}
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                <TableHead className="w-10">
                  <Checkbox
                    checked={filteredSubjects.length > 0 && selectedSubjects.size === filteredSubjects.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{text.subjectName}</TableHead>
                <TableHead className="text-center min-w-[150px]">{text.stage}</TableHead>
                <TableHead className="text-center min-w-[150px]">{text.teacher}</TableHead>
                {!showDeleted && <TableHead className="text-center w-32">{text.status}</TableHead>}
                <TableHead className="text-center hidden lg:table-cell">{text.createdAt}</TableHead>
                <TableHead className="text-center w-28">{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {filteredSubjects.map((subject, index) => {
                  const teacherName = getDistinctiveTeacherName(subject);
                  return (
                    <motion.tr
                      key={subject.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 group"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedSubjects.has(subject.id)}
                          onCheckedChange={(checked) => handleSelectSubject(subject.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <AvatarBadge initials={getInitials(subject)} size="sm" variant={showDeleted ? "muted" : "primary"} />
                          <div>
                            <div className={showDeleted ? 'text-gray-500 line-through' : ''}>
                              {getSubjectName(subject)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      {/* ✅ عرض المرحلة */}
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20">
                          {getStageName(subject)}
                        </Badge>
                      </TableCell>
                      
                      {/* ✅ عرض المعلم المميز للمرحلة */}
                      <TableCell className="text-center">
                        {teacherName ? (
                          <Badge 
                            variant="secondary" 
                            className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                          >
                            <User className="h-3 w-3 mr-1" />
                            {teacherName}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">{text.noTeacher}</span>
                        )}
                      </TableCell>
                      
                      {!showDeleted && (
                        <TableCell>
                          <SubjectStatusToggle subjectId={subject.id} active={subject.active} onToggle={toggleActive} />
                        </TableCell>
                      )}
                      <TableCell className="text-center text-gray-500 text-sm hidden lg:table-cell">
                        {subject.createdAt}
                      </TableCell>
                      <TableCell className="text-center">
                        {showDeleted ? (
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setRestoringSubject(subject)} className="text-green-600">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setForceDeletingSubject(subject)} className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(subject.id)}
                              className="text-amber-600"
                              title={text.edit}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingSubject(subject)}
                              className="text-red-600"
                              title={text.delete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {filteredSubjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">{showDeleted ? 'لا توجد مواد محذوفة' : 'لا توجد نتائج'}</p>
            {(searchQuery || selectedTeacherId !== 'all') && (
              <Button
                variant="link"
                onClick={clearFilters}
                className="mt-2 text-purple-600"
              >
                {dir === 'rtl' ? 'إزالة جميع الفلاتر' : 'Clear all filters'}
              </Button>
            )}
          </div>
        )}

        {total > 0 && (
          <div className="flex items-center justify-between border-t p-4 flex-wrap gap-2">
            <p className="text-sm text-gray-500">{text.showing} {filteredSubjects.length} {text.of} {total} {text.subjects}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </Button>
              <span className="px-3 text-sm flex items-center">{currentPage} / {lastPage}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === lastPage}>
                <ChevronRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <SubjectForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingSubjectId(null);
        }}
        onSubmit={editingSubjectId ? handleUpdate : handleCreate}
        subjectId={editingSubjectId}
        loading={actionLoading}
      />

      <SubjectDeleteDialog
        open={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        onConfirm={handleDelete}
        subjectName={getSubjectName(deletingSubject)}
        loading={actionLoading}
      />

      <SubjectDeleteDialog
        open={!!restoringSubject}
        onClose={() => setRestoringSubject(null)}
        onConfirm={handleRestore}
        subjectName={getSubjectName(restoringSubject)}
        loading={actionLoading}
        title="Restore Subject"
        confirmText="Restore"
        confirmClassName="bg-green-600"
      />

      <SubjectDeleteDialog
        open={!!forceDeletingSubject}
        onClose={() => setForceDeletingSubject(null)}
        onConfirm={handleForceDelete}
        subjectName={getSubjectName(forceDeletingSubject)}
        loading={actionLoading}
        title="Permanent Delete"
        confirmText="Permanently Delete"
        confirmClassName="bg-red-700"
      />

      <SubjectDeleteDialog
        open={bulkActionDialog.open}
        onClose={() => setBulkActionDialog({ type: null, open: false })}
        onConfirm={handleBulkAction}
        subjectName={`${selectedSubjects.size} items`}
        loading={actionLoading}
        title={bulkActionDialog.type === 'delete' ? 'Delete Selected' : bulkActionDialog.type === 'restore' ? 'Restore Selected' : 'Permanently Delete Selected'}
        confirmText={bulkActionDialog.type === 'delete' ? 'Delete' : bulkActionDialog.type === 'restore' ? 'Restore' : 'Permanently Delete'}
        confirmClassName={bulkActionDialog.type === 'delete' ? 'bg-red-600' : bulkActionDialog.type === 'restore' ? 'bg-green-600' : 'bg-red-700'}
      />
    </div>
  );
}