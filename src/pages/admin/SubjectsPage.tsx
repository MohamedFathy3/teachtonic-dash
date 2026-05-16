/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/SubjectsPage.tsx

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
  Eye // 🔥 أيقونة Show
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
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function SubjectsPage() {
  const { dir, lang } = useApp();
  const navigate = useNavigate(); // 🔥 للتنقل
  
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
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null); // 🔥 ID بس
  const [deletingSubject, setDeletingSubject] = useState<any>(null);
  const [restoringSubject, setRestoringSubject] = useState<any>(null);
  const [forceDeletingSubject, setForceDeletingSubject] = useState<any>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState<{ type: 'delete' | 'restore' | 'forceDelete' | null; open: boolean }>({ type: null, open: false });
  const [actionLoading, setActionLoading] = useState(false);

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
  };

  const filteredSubjects = useMemo(() => {
    if (!searchQuery) return subjects;
    const query = searchQuery.toLowerCase();
    return subjects.filter(
      (subject) =>
        (subject.name && subject.name.toLowerCase().includes(query)) ||
        (subject.name_ar && subject.name_ar.toLowerCase().includes(query))
    );
  }, [subjects, searchQuery]);

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

  // 🔥 Create
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

  // 🔥 Update
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

  // 🔥 Open edit modal - بنفتحه بالـ ID
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
          <Button
            onClick={() => setShowDeleted(!showDeleted)}
            variant={showDeleted ? "default" : "outline"}
            className={`gap-2 rounded-lg ${
              showDeleted 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {showDeleted ? (
              <><Archive className="h-4 w-4" />{text.showActive}</>
            ) : (
              <><Trash className="h-4 w-4" />{text.showDeleted}</>
            )}
          </Button>
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
          <div className="relative">
            <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400`} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={text.searchPlaceholder}
              className={`${dir === 'rtl' ? 'pr-9' : 'pl-9'} rounded-lg`}
            />
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
                <TableHead className="text-center w-24">{text.position}</TableHead>
                {!showDeleted && <TableHead className="text-center w-32">{text.status}</TableHead>}
                <TableHead className="text-center hidden lg:table-cell">{text.createdAt}</TableHead>
                <TableHead className="text-center w-28">{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {filteredSubjects.map((subject, index) => (
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
                          <div className="text-xs text-gray-400 mt-1">
                            {subject.stage_id && (
                              <span>Stage ID: {subject.stage_id}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="px-3 py-1 rounded-md bg-gray-100 text-sm">{subject.position}</span>
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
                       
                          {/* 🔥 زر Edit */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditClick(subject.id)} 
                            className="text-amber-600"
                            title={text.edit}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* 🔥 زر Delete */}
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
                ))}
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