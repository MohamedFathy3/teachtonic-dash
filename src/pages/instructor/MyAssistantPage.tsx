/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/AssistantTeachersPage.tsx

import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AvatarBadge } from '@/components/lms/AvatarBadge';
import { AssistantPermissionsModal } from '@/components/admin/assistant-teachers/AssistantPermissionsModal';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Shield ,
  Trash2, 
  Users, 
  RotateCcw,
  Mail,
  Phone,
  UserCog
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAssistantTeachers } from '@/hooks/useAssistantTeachers copy';
import { AssistantTeacherStatusToggle } from '@/components/admin/assistant-teachers/AssistantTeacherStatusToggle';
import { AssistantTeacherForm } from '@/components/admin/assistant-teachers/AssistantTeacherForm';
import { AssistantTeacherDeleteDialog } from '@/components/admin/assistant-teachers/AssistantTeacherDeleteDialog';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';

export function MyAssistantPage() {
  const { dir, lang } = useApp();
  const navigate = useNavigate();
  
  const { 
    assistants, 
    loading, 
    total, 
    currentPage, 
    lastPage, 
    showDeleted,
    setShowDeleted,
    selectedAssistants,
    setSelectedAssistants,
    createAssistant, 
    updateAssistant, 
    deleteAssistant, 
    forceDeleteAssistant,
    restoreAssistant,
    toggleActive, 
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore
  } = useAssistantTeachers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingAssistantId, setEditingAssistantId] = useState<number | null>(null);
  const [deletingAssistant, setDeletingAssistant] = useState<any>(null);
  const [restoringAssistant, setRestoringAssistant] = useState<any>(null);
  const [forceDeletingAssistant, setForceDeletingAssistant] = useState<any>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState<{ type: 'delete' | 'restore' | 'forceDelete' | null; open: boolean }>({ type: null, open: false });
  const [actionLoading, setActionLoading] = useState(false);
const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
const [selectedAssistantForPermissions, setSelectedAssistantForPermissions] = useState<any>(null);
  const text = {
    searchPlaceholder: dir === 'rtl' ? 'البحث بالاسم أو البريد...' : 'Search by name or email...',
    addAssistant: dir === 'rtl' ? 'إضافة مساعد' : 'Add Assistant',
    assistantName: dir === 'rtl' ? 'الاسم' : 'Name',
    email: dir === 'rtl' ? 'البريد' : 'Email',
    phone: dir === 'rtl' ? 'الهاتف' : 'Phone',
    mainTeacher: dir === 'rtl' ? 'المدرس الرئيسي' : 'Main Teacher',
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
    assistants: dir === 'rtl' ? 'مساعد' : 'assistants',
    activeAssistants: dir === 'rtl' ? 'المساعدين النشطين' : 'Active Assistants',
    deletedAssistants: dir === 'rtl' ? 'المساعدين المحذوفين' : 'Deleted Assistants',
    showDeleted: dir === 'rtl' ? 'عرض المحذوفين' : 'Show Deleted',
    showActive: dir === 'rtl' ? 'عرض النشطين' : 'Show Active',
    selected: dir === 'rtl' ? 'محدد' : 'Selected',
    items: dir === 'rtl' ? 'عناصر' : 'items',
  };

  const filteredAssistants = useMemo(() => {
    if (!searchQuery) return assistants;
    const query = searchQuery.toLowerCase();
    return assistants.filter(
      (assistant) =>
        (assistant.name && assistant.name.toLowerCase().includes(query)) ||
        (assistant.email && assistant.email.toLowerCase().includes(query)) ||
        (assistant.phone && assistant.phone.includes(query))
    );
  }, [assistants, searchQuery]);

  const handleSelectAll = () => {
    if (selectedAssistants.size === filteredAssistants.length) {
      setSelectedAssistants(new Set());
    } else {
      setSelectedAssistants(new Set(filteredAssistants.map(a => a.id)));
    }
  };

  const handleSelectAssistant = (id: number, checked: boolean) => {
    setSelectedAssistants(prev => {
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
    const ids = Array.from(selectedAssistants);
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
      await createAssistant(data);
      setFormOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingAssistantId) return;
    setActionLoading(true);
    try {
      await updateAssistant(editingAssistantId, data);
      setEditingAssistantId(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (id: number) => {
    setEditingAssistantId(id);
    setFormOpen(true);
  };

  // const handleShowClick = (id: number) => {
  //   navigate(`/admin/assistant-teachers/${id}`);
  // };

  const getInitials = (name: string) => {
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
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <UserCog className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {showDeleted ? text.deletedAssistants : text.activeAssistants}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {total} {text.assistants}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <ExportExcelButton
            data={filteredAssistants}
            fileName="assistant-teachers-list"
            label={lang === 'ar' ? 'تصدير' : 'Export'}
            disabled={loading || filteredAssistants.length === 0}
          />
          {/* <Button
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
          </Button> */}
          {/* <Button
            onClick={() => {
              setEditingAssistantId(null);
              setFormOpen(true);
            }}
            className="gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Plus className="h-4 w-4" />
            {text.addAssistant}
          </Button> */}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedAssistants.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200"
        >
          <span className="text-sm font-medium text-purple-700">
            {selectedAssistants.size} {text.selected} {text.items}
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
                    checked={filteredAssistants.length > 0 && selectedAssistants.size === filteredAssistants.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{text.assistantName}</TableHead>
                <TableHead className="hidden md:table-cell">{text.email}</TableHead>
                <TableHead className="hidden lg:table-cell">{text.phone}</TableHead>
                <TableHead className="hidden xl:table-cell">{text.mainTeacher}</TableHead>
                {!showDeleted && <TableHead className="text-center w-24">{text.status}</TableHead>}
                <TableHead className="text-center hidden lg:table-cell">{text.createdAt}</TableHead>
                <TableHead className="text-center w-28">{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {filteredAssistants.map((assistant, index) => (
                  <motion.tr
                    key={assistant.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 group"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedAssistants.has(assistant.id)}
                        onCheckedChange={(checked) => handleSelectAssistant(assistant.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarBadge 
                          initials={getInitials(assistant.name)} 
                          size="sm" 
                          variant={showDeleted ? "muted" : "primary"} 
                        />
                        <div className={showDeleted ? 'text-gray-500 line-through' : 'font-medium'}>
                          {assistant.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[150px]">{assistant.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {assistant.phone}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3 text-gray-400" />
                        {/* 🔥 هنا هنعرض اسم المدرس الرئيسي - لما الـ API ترجعه */}
                        {assistant.teacher_name || `Teacher ID: ${assistant.teacher_id}`}
                      </div>
                    </TableCell>
                    {!showDeleted && (
                      <TableCell>
                        <AssistantTeacherStatusToggle 
                          assistantId={assistant.id} 
                          active={assistant.active} 
                          onToggle={toggleActive} 
                        />
                      </TableCell>
                    )}
                    <TableCell className="text-center text-gray-500 text-sm hidden lg:table-cell">
                      {assistant.createdAt}
                    </TableCell>
                    <TableCell className="text-center">
                      {showDeleted ? (
                        <div className="flex justify-center gap-1">
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setRestoringAssistant(assistant)} 
                            className="text-green-600"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setForceDeletingAssistant(assistant)} 
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-1">
                        <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => {
        setSelectedAssistantForPermissions(assistant);
        setPermissionsModalOpen(true);
      }} 
      className="text-purple-600"
      title={lang === 'ar' ? 'الصلاحيات' : 'Permissions'}
    >
      <Shield className="h-4 w-4" />
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

        {filteredAssistants.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {showDeleted ? 'لا توجد مساعدين محذوفين' : 'لا توجد نتائج'}
            </p>
          </div>
        )}

        {total > 0 && (
          <div className="flex items-center justify-between border-t p-4 flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              {text.showing} {filteredAssistants.length} {text.of} {total} {text.assistants}
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
      <AssistantPermissionsModal
  open={permissionsModalOpen}
  onClose={() => {
    setPermissionsModalOpen(false);
    setSelectedAssistantForPermissions(null);
  }}
  assistantId={selectedAssistantForPermissions?.id}
  assistantName={selectedAssistantForPermissions?.name || ''}
  onSuccess={() => {
  }}/>
      <AssistantTeacherForm 
        open={formOpen} 
        onClose={() => {
          setFormOpen(false);
          setEditingAssistantId(null);
        }} 
        onSubmit={editingAssistantId ? handleUpdate : handleCreate}
        assistantId={editingAssistantId}
        loading={actionLoading} 
      />
      
      <AssistantTeacherDeleteDialog 
        open={!!deletingAssistant} 
        onClose={() => setDeletingAssistant(null)} 
        onConfirm={async () => {
          await deleteAssistant(deletingAssistant.id);
          setDeletingAssistant(null);
        }} 
        assistantName={deletingAssistant?.name || ''} 
        loading={actionLoading} 
      />
      
      <AssistantTeacherDeleteDialog 
        open={!!restoringAssistant} 
        onClose={() => setRestoringAssistant(null)} 
        onConfirm={async () => {
          await restoreAssistant(restoringAssistant.id);
          setRestoringAssistant(null);
        }} 
        assistantName={restoringAssistant?.name || ''} 
        loading={actionLoading} 
        title="Restore Assistant"
        confirmText="Restore"
        confirmClassName="bg-green-600"
      />
      
      <AssistantTeacherDeleteDialog 
        open={!!forceDeletingAssistant} 
        onClose={() => setForceDeletingAssistant(null)} 
        onConfirm={async () => {
          await forceDeleteAssistant(forceDeletingAssistant.id);
          setForceDeletingAssistant(null);
        }} 
        assistantName={forceDeletingAssistant?.name || ''} 
        loading={actionLoading} 
        title="Permanent Delete"
        confirmText="Permanently Delete"
        confirmClassName="bg-red-700"
      />
      
      <AssistantTeacherDeleteDialog
        open={bulkActionDialog.open}
        onClose={() => setBulkActionDialog({ type: null, open: false })}
        onConfirm={handleBulkAction}
        assistantName={`${selectedAssistants.size} items`}
        loading={actionLoading}
        title={bulkActionDialog.type === 'delete' ? 'Delete Selected' : bulkActionDialog.type === 'restore' ? 'Restore Selected' : 'Permanently Delete Selected'}
        confirmText={bulkActionDialog.type === 'delete' ? 'Delete' : bulkActionDialog.type === 'restore' ? 'Restore' : 'Permanently Delete'}
        confirmClassName={bulkActionDialog.type === 'delete' ? 'bg-red-600' : bulkActionDialog.type === 'restore' ? 'bg-green-600' : 'bg-red-700'}
      />
    </div>
  );
}