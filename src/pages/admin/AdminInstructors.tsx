/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/TeachersPage.tsx

import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Users, 
  Trash, 
  Archive, 
  RotateCcw,
  Mail,
  Phone,
  Globe,
  Eye
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTeachers } from '@/hooks/useTeachers';
import { TeacherStatusToggle } from '@/components/admin/teachers/TeacherStatusToggle';
import { TeacherForm } from '@/components/admin/teachers/TeacherForm';
import { TeacherDeleteDialog } from '@/components/admin/teachers/TeacherDeleteDialog';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function TeachersPage() {
  const { dir, lang, t } = useApp();
  const navigate = useNavigate();
  
  const { 
    teachers, 
    loading, 
    total, 
    currentPage, 
    lastPage, 
    showDeleted,
    setShowDeleted,
    selectedTeachers,
    setSelectedTeachers,
    createTeacher, 
    updateTeacher, 
    deleteTeacher, 
    forceDeleteTeacher,
    restoreTeacher,
    toggleActive, 
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore,
    refetch
  } = useTeachers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<any>(null);
  const [restoringTeacher, setRestoringTeacher] = useState<any>(null);
  const [forceDeletingTeacher, setForceDeletingTeacher] = useState<any>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState<{ type: 'delete' | 'restore' | 'forceDelete' | null; open: boolean }>({ type: null, open: false });
  const [actionLoading, setActionLoading] = useState(false);

  const text = {
    searchPlaceholder: dir === 'rtl' ? 'البحث باسم المدرس أو البريد...' : 'Search by teacher name or email...',
    addTeacher: dir === 'rtl' ? 'إضافة مدرس' : 'Add Teacher',
    teacherName: dir === 'rtl' ? 'اسم المدرس' : 'Teacher Name',
    email: dir === 'rtl' ? 'البريد الإلكتروني' : 'Email',
    phone: dir === 'rtl' ? 'الهاتف' : 'Phone',
    subDomain: dir === 'rtl' ? 'النطاق الفرعي' : 'Sub Domain',
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
    teachers: dir === 'rtl' ? 'مدرس' : 'teachers',
    activeTeachers: dir === 'rtl' ? 'المدرسين النشطين' : 'Active Teachers',
    deletedTeachers: dir === 'rtl' ? 'المدرسين المحذوفين' : 'Deleted Teachers',
    showDeleted: dir === 'rtl' ? 'عرض المحذوفين' : 'Show Deleted',
    showActive: dir === 'rtl' ? 'عرض النشطين' : 'Show Active',
    selected: dir === 'rtl' ? 'محدد' : 'Selected',
    items: dir === 'rtl' ? 'عناصر' : 'items',
    deleteSelected: dir === 'rtl' ? 'حذف المحدد' : 'Delete Selected',
    restoreSelected: dir === 'rtl' ? 'استعادة المحدد' : 'Restore Selected',
    forceDeleteSelected: dir === 'rtl' ? 'حذف نهائي للمحدد' : 'Force Delete Selected',
    selectAll: dir === 'rtl' ? 'تحديد الكل' : 'Select All',
  };

  // Filter teachers based on search
  const filteredTeachers = useMemo(() => {
    if (!searchQuery) return teachers;
    const query = searchQuery.toLowerCase();
    return teachers.filter(
      (teacher) =>
        (teacher.name && teacher.name.toLowerCase().includes(query)) ||
        (teacher.email && teacher.email.toLowerCase().includes(query)) ||
        (teacher.phone && teacher.phone.includes(query))
    );
  }, [teachers, searchQuery]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedTeachers.size === filteredTeachers.length) {
      setSelectedTeachers(new Set());
    } else {
      setSelectedTeachers(new Set(filteredTeachers.map(t => t.id)));
    }
  };

  // Handle select single teacher
  const handleSelectTeacher = (id: number, checked: boolean) => {
    setSelectedTeachers(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  // Handle bulk action
  const handleBulkAction = async () => {
    const ids = Array.from(selectedTeachers);
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
      setSelectedTeachers(new Set());
    } finally {
      setActionLoading(false);
    }
  };

  // Handle create teacher
  const handleCreate = async (data: any) => {
    setActionLoading(true);
    try {
      await createTeacher(data);
      setFormOpen(false);
      setEditingTeacherId(null);
      refetch();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle update teacher
  const handleUpdate = async (data: any) => {
    if (!editingTeacherId) return;
    setActionLoading(true);
    try {
      await updateTeacher(editingTeacherId, data);
      setEditingTeacherId(null);
      setFormOpen(false);
      refetch();
    } finally {
      setActionLoading(false);
    }
  };

  // Open edit modal
  const handleEditClick = (teacherId: number) => {
    setEditingTeacherId(teacherId);
    setFormOpen(true);
  };

  // Handle show teacher profile
  const handleShowClick = (teacherId: number) => {
    navigate('/admin/teachers/profile', { 
      state: { selectedInstructor: teacherId } 
    });
  };

  // Handle delete
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteTeacher(deletingTeacher.id);
      setDeletingTeacher(null);
      setSelectedTeachers(new Set());
      refetch();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle restore
  const handleRestore = async () => {
    setActionLoading(true);
    try {
      await restoreTeacher(restoringTeacher.id);
      setRestoringTeacher(null);
      setSelectedTeachers(new Set());
      refetch();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle force delete
  const handleForceDelete = async () => {
    setActionLoading(true);
    try {
      await forceDeleteTeacher(forceDeletingTeacher.id);
      setForceDeletingTeacher(null);
      setSelectedTeachers(new Set());
      refetch();
    } finally {
      setActionLoading(false);
    }
  };

  // Get teacher name based on language
  const getTeacherName = (teacher: any) => {
    if (!teacher) return '';
    if (lang === 'ar' && teacher.name_ar) return teacher.name_ar;
    if (teacher.name) return teacher.name;
    return '';
  };

  const getInitials = (teacher: any) => {
    const name = getTeacherName(teacher);
    return name.charAt(0).toUpperCase() || '?';
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(lastPage, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <div className="absolute inset-0 h-12 w-12 rounded-full bg-blue-600/20 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {showDeleted ? text.deletedTeachers : text.activeTeachers}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {total} {text.teachers}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* <Button
            onClick={() => {
              setShowDeleted(!showDeleted);
              setSelectedTeachers(new Set());
            }}
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
          </Button> */}
          <Button
            onClick={() => {
              setEditingTeacherId(null);
              setFormOpen(true);
            }}
            className="gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            <Plus className="h-4 w-4" />
            {text.addTeacher}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedTeachers.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200"
        >
          <span className="text-sm font-medium text-blue-700">
            {selectedTeachers.size} {text.selected} {text.items}
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
                    checked={filteredTeachers.length > 0 && selectedTeachers.size === filteredTeachers.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{text.teacherName}</TableHead>
                <TableHead className="hidden md:table-cell">{text.email}</TableHead>
                <TableHead className="hidden lg:table-cell">{text.phone}</TableHead>
                <TableHead className="hidden xl:table-cell">{text.subDomain}</TableHead>
                {!showDeleted && <TableHead className="text-center w-24">{text.status}</TableHead>}
                <TableHead className="text-center hidden lg:table-cell">{text.createdAt}</TableHead>
                <TableHead className="text-center w-28">{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {filteredTeachers.map((teacher, index) => (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 group"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedTeachers.has(teacher.id)}
                        onCheckedChange={(checked) => handleSelectTeacher(teacher.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={teacher.imageUrl || '/default-avatar.png'} 
                          alt={getTeacherName(teacher)}
                          className="object-cover w-10 h-10 rounded-full"
                         
                        />
                        <div>
                          <div className={showDeleted ? 'text-gray-500 line-through' : 'font-medium'}>
                            {getTeacherName(teacher)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {teacher.website?.stages?.length > 0 && (
                              <span className="mr-2">📚 {teacher.website.stages.length} stages</span>
                            )}
                            {teacher.website?.subjects?.length > 0 && (
                              <span>📖 {teacher.website.subjects.length} subjects</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[150px]">{teacher.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {teacher.phone}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Globe className="h-3 w-3 text-gray-400" />
                        {teacher.sub_domain}
                      </div>
                    </TableCell>
                    {!showDeleted && (
                      <TableCell>
                        <TeacherStatusToggle 
                          teacherId={teacher.id} 
                          active={teacher.active} 
                          onToggle={toggleActive} 
                        />
                      </TableCell>
                    )}
                    <TableCell className="text-center text-gray-500 text-sm hidden lg:table-cell">
                      {teacher.createdAt}
                    </TableCell>
                    <TableCell className="text-center">
                      {showDeleted ? (
                        <div className="flex justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setRestoringTeacher(teacher)} 
                            className="text-green-600 hover:bg-green-50"
                            title={text.restore}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setForceDeletingTeacher(teacher)} 
                            className="text-red-600 hover:bg-red-50"
                            title={text.forceDelete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleShowClick(teacher.id)} 
                            className="text-blue-600 hover:bg-blue-50"
                            title={text.show}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditClick(teacher.id)} 
                            className="text-amber-600 hover:bg-amber-50"
                            title={text.edit}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setDeletingTeacher(teacher)} 
                            className="text-red-600 hover:bg-red-50"
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

        {filteredTeachers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {showDeleted ? 'لا توجد مدرسين محذوفين' : 'لا توجد نتائج'}
            </p>
          </div>
        )}

        {/* 🔥 Pagination Section - Improved */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t p-4 flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              {text.showing} {filteredTeachers.length} {text.of} {total} {text.teachers}
            </p>
            <div className="flex items-center gap-1">
              {/* Previous Button */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => goToPage(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                <ChevronLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* Page Numbers */}
              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={`h-8 w-8 ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              ))}
              
              {/* Next Button */}
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
      <TeacherForm 
        open={formOpen} 
        onClose={() => {
          setFormOpen(false);
          setEditingTeacherId(null);
        }} 
        onSubmit={editingTeacherId ? handleUpdate : handleCreate}
        teacherId={editingTeacherId}
        loading={actionLoading} 
      />
      
      <TeacherDeleteDialog 
        open={!!deletingTeacher} 
        onClose={() => setDeletingTeacher(null)} 
        onConfirm={handleDelete} 
        teacherName={getTeacherName(deletingTeacher)} 
        loading={actionLoading} 
      />
      
      <TeacherDeleteDialog 
        open={!!restoringTeacher} 
        onClose={() => setRestoringTeacher(null)} 
        onConfirm={handleRestore} 
        teacherName={getTeacherName(restoringTeacher)} 
        loading={actionLoading} 
        title="Restore Teacher"
        confirmText="Restore"
        confirmClassName="bg-green-600"
      />
      
      <TeacherDeleteDialog 
        open={!!forceDeletingTeacher} 
        onClose={() => setForceDeletingTeacher(null)} 
        onConfirm={handleForceDelete} 
        teacherName={getTeacherName(forceDeletingTeacher)} 
        loading={actionLoading} 
        title="Permanent Delete"
        confirmText="Permanently Delete"
        confirmClassName="bg-red-700"
      />
      
      <TeacherDeleteDialog
        open={bulkActionDialog.open}
        onClose={() => setBulkActionDialog({ type: null, open: false })}
        onConfirm={handleBulkAction}
        teacherName={`${selectedTeachers.size} items`}
        loading={actionLoading}
        title={bulkActionDialog.type === 'delete' ? 'Delete Selected' : bulkActionDialog.type === 'restore' ? 'Restore Selected' : 'Permanently Delete Selected'}
        confirmText={bulkActionDialog.type === 'delete' ? 'Delete' : bulkActionDialog.type === 'restore' ? 'Restore' : 'Permanently Delete'}
        confirmClassName={bulkActionDialog.type === 'delete' ? 'bg-red-600' : bulkActionDialog.type === 'restore' ? 'bg-green-600' : 'bg-red-700'}
      />
    </div>
  );
}