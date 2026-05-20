/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/StagesPage.tsx
import type { Stage, StageFilters, PaginatedResponse, StageFormData } from '@/types/stage.types';
import { stageService } from '@/services/stage.service';

import { Download, Loader2 } from 'lucide-react';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AvatarBadge } from '@/components/lms/AvatarBadge';
import { Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight, Edit, Trash2, Layers, Trash, Archive, RotateCcw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStages } from '@/hooks/useStages';
import { StageStatusToggle } from '@/components/admin/stages/StageStatusToggle';
import { StageForm } from '@/components/admin/stages/StageForm';
import { StageDeleteDialog } from '@/components/admin/stages/StageDeleteDialog';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    bulkRestore
  } = useStages();

  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<any>(null);
  const [deletingStage, setDeletingStage] = useState<any>(null);
  const [restoringStage, setRestoringStage] = useState<any>(null);
  const [forceDeletingStage, setForceDeletingStage] = useState<any>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState<{ type: 'delete' | 'restore' | 'forceDelete' | null; open: boolean }>({ type: null, open: false });
  const [actionLoading, setActionLoading] = useState(false);

  const text = {
    searchPlaceholder: dir === 'rtl' ? 'البحث باسم المرحلة...' : 'Search by stage name...',
    addStage: dir === 'rtl' ? 'إضافة مرحلة' : 'Add Stage',
    stageName: dir === 'rtl' ? 'اسم المرحلة' : 'Stage Name',
    position: dir === 'rtl' ? 'الترتيب' : 'Position',
    status: dir === 'rtl' ? 'الحالة' : 'Status',
    createdAt: dir === 'rtl' ? 'تاريخ الإنشاء' : 'Created At',
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
  };

  const filteredStages = useMemo(() => {
    if (!searchQuery) return stages;
    const query = searchQuery.toLowerCase();
    return stages.filter(
      (stage) =>
        (stage.name && stage.name.toLowerCase().includes(query)) ||
        (stage.name_ar && stage.name_ar.toLowerCase().includes(query))
    );
  }, [stages, searchQuery]);

  const handleSelectAll = () => {
    if (selectedStages.size === filteredStages.length) {
      setSelectedStages(new Set());
    } else {
      setSelectedStages(new Set(filteredStages.map(s => s.id)));
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
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {/* EXPORT BUTTON */}
          <ExportExcelButton
            data={filteredStages} 
            fileName={showDeleted ? "deleted-stages" : "stages-list"}
            label={loading ? "Exporting..." : "Export"}
            disabled={loading || filteredStages.length === 0}
            icon={
              loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )
            }
            className="
        h-10 rounded-xl
        border border-emerald-200
        bg-emerald-50
        text-emerald-700
        hover:bg-emerald-600
        hover:text-white
        dark:bg-emerald-900/20
        dark:text-emerald-400
        transition-all duration-300
        shadow-sm
      "
          />

          {/* TOGGLE DELETED */}
          <Button
            onClick={() => setShowDeleted(!showDeleted)}
            variant={showDeleted ? "default" : "outline"}
            className={`gap-2 rounded-xl h-10 ${showDeleted
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'border-gray-200 dark:border-gray-700'
              }`}
          >
            {showDeleted ? (
              <>
                <Archive className="h-4 w-4" />
                {text.showActive}
              </>
            ) : (
              <>
                <Trash className="h-4 w-4" />
                {text.showDeleted}
              </>
            )}
          </Button>

          {/* ADD BUTTON */}
          <Button
            onClick={() => setFormOpen(true)}
            className="
        gap-2 h-10 rounded-xl
        bg-gradient-to-r from-purple-600 to-indigo-600
        hover:from-purple-700 hover:to-indigo-700
        shadow-md
      "
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
                    checked={filteredStages.length > 0 && selectedStages.size === filteredStages.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{text.stageName}</TableHead>
                <TableHead className="text-center w-24">{text.position}</TableHead>
                {!showDeleted && <TableHead className="text-center w-32">{text.status}</TableHead>}
                <TableHead className="text-center hidden lg:table-cell">{text.createdAt}</TableHead>
                <TableHead className="text-center w-20">{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {filteredStages.map((stage, index) => (
                  <motion.tr
                    key={stage.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 group"
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
                    <TableCell className="text-center">
                      <span className="px-3 py-1 rounded-md bg-gray-100 text-sm">{stage.position}</span>
                    </TableCell>
                    {!showDeleted && (
                      <TableCell>
                        <StageStatusToggle stageId={stage.id} active={stage.active} onToggle={toggleActive} />
                      </TableCell>
                    )}
                    <TableCell className="text-center text-gray-500 text-sm">{stage.createdAt}</TableCell>
                    <TableCell className="text-center">
                      {showDeleted ? (
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setRestoringStage(stage)} className="text-green-600">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setForceDeletingStage(stage)} className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingStage(stage)}>
                              <Edit className="mr-2 h-4 w-4 text-blue-500" /> {text.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingStage(stage)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> {text.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {filteredStages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">{showDeleted ? 'لا توجد مراحل محذوفة' : 'لا توجد نتائج'}</p>
          </div>
        )}

        {total > 0 && (
          <div className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-gray-500">{text.showing} {filteredStages.length} {text.of} {total} {text.stages}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </Button>
              <span className="px-3 text-sm">{currentPage}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === lastPage}>
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