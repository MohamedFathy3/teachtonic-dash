/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/AboutsPage.tsx

import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AvatarBadge } from '@/components/lms/AvatarBadge';
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Layers,
  Trash,
  Archive,
  RotateCcw,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAbouts } from '@/hooks/useAbouts';
import { AboutStatusToggle } from '@/components/admin/about/AboutStatusToggle';
import { AboutForm } from '@/components/admin/about/AboutForm';
import { AboutDeleteDialog } from '@/components/admin/about/AboutDeleteDialog';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';
export function AboutsPage() {
  const { dir, lang } = useApp();
  const navigate = useNavigate();

  const {
    abouts,
    loading,
    total,
    currentPage,
    lastPage,
    showDeleted,
    setShowDeleted,
    selectedAbouts,
    setSelectedAbouts,
    createAbout,
    updateAbout,
    deleteAbout,
    forceDeleteAbout,
    restoreAbout,
    toggleActive,
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore
  } = useAbouts();

  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingAboutId, setEditingAboutId] = useState<number | null>(null);
  const [deletingAbout, setDeletingAbout] = useState<any>(null);
  const [restoringAbout, setRestoringAbout] = useState<any>(null);
  const [forceDeletingAbout, setForceDeletingAbout] = useState<any>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState<{ type: 'delete' | 'restore' | 'forceDelete' | null; open: boolean }>({ type: null, open: false });
  const [actionLoading, setActionLoading] = useState(false);

  const text = {
    searchPlaceholder: dir === 'rtl' ? 'البحث بالاسم...' : 'Search by name...',
    addAbout: dir === 'rtl' ? 'إضافة قسم من نحن' : 'Add About Section',
    aboutName: dir === 'rtl' ? 'الاسم' : 'Name',
    teacher: dir === 'rtl' ? 'المدرس' : 'Teacher',
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
    abouts: dir === 'rtl' ? 'قسم من نحن' : 'about sections',
    activeAbouts: dir === 'rtl' ? 'الأقسام النشطة' : 'Active Sections',
    deletedAbouts: dir === 'rtl' ? 'الأقسام المحذوفة' : 'Deleted Sections',
    showDeleted: dir === 'rtl' ? 'عرض المحذوفات' : 'Show Deleted',
    showActive: dir === 'rtl' ? 'عرض النشطة' : 'Show Active',
    selected: dir === 'rtl' ? 'محدد' : 'Selected',
    items: dir === 'rtl' ? 'عناصر' : 'items',
  };

  const filteredAbouts = useMemo(() => {
    if (!searchQuery) return abouts;
    const query = searchQuery.toLowerCase();
    return abouts.filter(
      (about) =>
        (about.name && about.name.toLowerCase().includes(query)) ||
        (about.name_ar && about.name_ar.toLowerCase().includes(query))
    );
  }, [abouts, searchQuery]);

  const handleSelectAll = () => {
    if (selectedAbouts.size === filteredAbouts.length) {
      setSelectedAbouts(new Set());
    } else {
      setSelectedAbouts(new Set(filteredAbouts.map(a => a.id)));
    }
  };

  const handleSelectAbout = (id: number, checked: boolean) => {
    setSelectedAbouts(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleCreate = async (data: any) => {
    setActionLoading(true);
    try {
      await createAbout(data);
      setFormOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingAboutId) return;
    setActionLoading(true);
    try {
      await updateAbout(editingAboutId, data);
      setEditingAboutId(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (aboutId: number) => {
    setEditingAboutId(aboutId);
    setFormOpen(true);
  };

  const handleShowClick = (aboutId: number) => {
    navigate(`/admin/about/${aboutId}`);
  };

  const getAboutName = (about: any) => {
    if (!about) return '';
    if (lang === 'ar' && about.name_ar) return about.name_ar;
    return about.name;
  };

  const getInitials = (about: any) => {
    const name = getAboutName(about);
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
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {showDeleted ? text.deletedAbouts : text.activeAbouts}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {total} {text.abouts}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* ✅ زرار التصدير */}
          <ExportExcelButton
            data={filteredAbouts}
            fileName="abouts-list"
            label={lang === 'ar' ? 'تصدير' : 'Export'}
            disabled={loading || filteredAbouts.length === 0}
          />
          <Button
            onClick={() => setShowDeleted(!showDeleted)}
            variant={showDeleted ? "default" : "outline"}
            className={`gap-2 rounded-lg ${showDeleted
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
              setEditingAboutId(null);
              setFormOpen(true);
            }}
            className="gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Plus className="h-4 w-4" />
            {text.addAbout}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedAbouts.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200"
        >
          <span className="text-sm font-medium text-purple-700">
            {selectedAbouts.size} {text.selected} {text.items}
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
                  Restore Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkActionDialog({ type: 'forceDelete', open: true })}
                  className="gap-2 text-red-700 border-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Force Delete Selected
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
                Delete Selected
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
                    checked={filteredAbouts.length > 0 && selectedAbouts.size === filteredAbouts.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{text.aboutName}</TableHead>
                <TableHead className="hidden md:table-cell">{text.teacher}</TableHead>
                <TableHead className="text-center w-20">Image</TableHead>
                <TableHead className="hidden xl:table-cell text-center">Facebook</TableHead>
                <TableHead className="hidden xl:table-cell text-center">Google</TableHead>
                <TableHead className="hidden xl:table-cell text-center">TikTok</TableHead>
                <TableHead className="hidden xl:table-cell text-center">YouTube</TableHead>
                {!showDeleted && <TableHead className="text-center w-24">{text.status}</TableHead>}
                <TableHead className="text-center hidden lg:table-cell">{text.createdAt}</TableHead>
                <TableHead className="text-center w-28">{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {filteredAbouts.map((about, index) => (
                  <motion.tr
                    key={about.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 group"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedAbouts.has(about.id)}
                        onCheckedChange={(checked) => handleSelectAbout(about.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarBadge
                          initials={getInitials(about)}
                          size="sm"
                          variant={showDeleted ? "muted" : "primary"}
                        />
                        <div>
                          <div className={showDeleted ? 'text-gray-500 line-through' : 'font-medium'}>
                            {getAboutName(about)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                            {about.description?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">Teacher ID: {about.teacher_id}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {about.image?.fullUrl ? (
                        <img
                          src={about.image.fullUrl}
                          alt={about.name}
                          className="h-8 w-8 rounded object-cover mx-auto"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-gray-400 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-center">
                      <span className="text-xs text-gray-500 truncate max-w-[100px] block mx-auto" title={about.facebook_meta}>
                        {about.facebook_meta ? about.facebook_meta.substring(0, 20) + '...' : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-center">
                      <span className="text-xs text-gray-500 truncate max-w-[100px] block mx-auto" title={about.google_meta}>
                        {about.google_meta ? about.google_meta.substring(0, 20) + '...' : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-center">
                      <span className="text-xs text-gray-500 truncate max-w-[100px] block mx-auto" title={about.tiktok_meta}>
                        {about.tiktok_meta ? about.tiktok_meta.substring(0, 20) + '...' : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-center">
                      <span className="text-xs text-gray-500 truncate max-w-[100px] block mx-auto" title={about.you_tube_meta}>
                        {about.you_tube_meta ? about.you_tube_meta.substring(0, 20) + '...' : '—'}
                      </span>
                    </TableCell>
                    {!showDeleted && (
                      <TableCell>
                        <AboutStatusToggle aboutId={about.id} active={about.active} onToggle={toggleActive} />
                      </TableCell>
                    )}
                    <TableCell className="text-center text-gray-500 text-sm hidden lg:table-cell">
                      {about.createdAt}
                    </TableCell>
                    <TableCell className="text-center">
                      {showDeleted ? (
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRestoringAbout(about)}
                            className="text-green-600"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setForceDeletingAbout(about)}
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
                            onClick={() => handleEditClick(about.id)}
                            className="text-amber-600"
                            title={text.edit}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingAbout(about)}
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

        {filteredAbouts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {showDeleted ? 'لا توجد أقسام محذوفة' : 'لا توجد نتائج'}
            </p>
          </div>
        )}

        {total > 0 && (
          <div className="flex items-center justify-between border-t p-4 flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              {text.showing} {filteredAbouts.length} {text.of} {total} {text.abouts}
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
      <AboutForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingAboutId(null);
        }}
        onSubmit={editingAboutId ? handleUpdate : handleCreate}
        aboutId={editingAboutId}
        loading={actionLoading}
      />

      <AboutDeleteDialog
        open={!!deletingAbout}
        onClose={() => setDeletingAbout(null)}
        onConfirm={async () => {
          await deleteAbout(deletingAbout.id);
          setDeletingAbout(null);
        }}
        aboutName={getAboutName(deletingAbout)}
        loading={actionLoading}
      />

      <AboutDeleteDialog
        open={!!restoringAbout}
        onClose={() => setRestoringAbout(null)}
        onConfirm={async () => {
          await restoreAbout(restoringAbout.id);
          setRestoringAbout(null);
        }}
        aboutName={getAboutName(restoringAbout)}
        loading={actionLoading}
        title="Restore About Section"
        confirmText="Restore"
        confirmClassName="bg-green-600"
      />

      <AboutDeleteDialog
        open={!!forceDeletingAbout}
        onClose={() => setForceDeletingAbout(null)}
        onConfirm={async () => {
          await forceDeleteAbout(forceDeletingAbout.id);
          setForceDeletingAbout(null);
        }}
        aboutName={getAboutName(forceDeletingAbout)}
        loading={actionLoading}
        title="Permanent Delete"
        confirmText="Permanently Delete"
        confirmClassName="bg-red-700"
      />

      <AboutDeleteDialog
        open={bulkActionDialog.open}
        onClose={() => setBulkActionDialog({ type: null, open: false })}
        onConfirm={async () => {
          const ids = Array.from(selectedAbouts);
          if (bulkActionDialog.type === 'delete') {
            await bulkDelete(ids);
          } else if (bulkActionDialog.type === 'restore') {
            await bulkRestore(ids);
          } else if (bulkActionDialog.type === 'forceDelete') {
            await bulkForceDelete(ids);
          }
          setBulkActionDialog({ type: null, open: false });
        }}
        aboutName={`${selectedAbouts.size} items`}
        loading={actionLoading}
        title={bulkActionDialog.type === 'delete' ? 'Delete Selected' : bulkActionDialog.type === 'restore' ? 'Restore Selected' : 'Permanently Delete Selected'}
        confirmText={bulkActionDialog.type === 'delete' ? 'Delete' : bulkActionDialog.type === 'restore' ? 'Restore' : 'Permanently Delete'}
        confirmClassName={bulkActionDialog.type === 'delete' ? 'bg-red-600' : bulkActionDialog.type === 'restore' ? 'bg-green-600' : 'bg-red-700'}
      />
    </div>
  );
}