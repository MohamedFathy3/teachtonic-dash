/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/FootersPage.tsx

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
  Phone
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFooters } from '@/hooks/useFooters';
import { FooterStatusToggle } from '@/components/admin/footer/FooterStatusToggle';
import { FooterForm } from '@/components/admin/footer/FooterForm';
import { FooterDeleteDialog } from '@/components/admin/footer/FooterDeleteDialog';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';

// 🔥 أيقونات مخصصة للسوشيال ميديا (مش من lucide-react)
const FacebookIcon = () => (
  <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.066 0 12 0 12s0 3.934.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.934 24 12 24 12s0-3.934-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-4 w-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
);

export function FootersPage() {
  const { dir, lang } = useApp();
  const navigate = useNavigate();

  const {
    footers,
    loading,
    total,
    currentPage,
    lastPage,
    showDeleted,
    setShowDeleted,
    selectedFooters,
    setSelectedFooters,
    createFooter,
    updateFooter,
    deleteFooter,
    forceDeleteFooter,
    restoreFooter,
    toggleActive,
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore
  } = useFooters();

  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingFooterId, setEditingFooterId] = useState<number | null>(null);
  const [deletingFooter, setDeletingFooter] = useState<any>(null);
  const [restoringFooter, setRestoringFooter] = useState<any>(null);
  const [forceDeletingFooter, setForceDeletingFooter] = useState<any>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState<{ type: 'delete' | 'restore' | 'forceDelete' | null; open: boolean }>({ type: null, open: false });
  const [actionLoading, setActionLoading] = useState(false);

  const text = {
    searchPlaceholder: dir === 'rtl' ? 'البحث بالاسم...' : 'Search by name...',
    addFooter: dir === 'rtl' ? 'إضافة قسم تذييل' : 'Add Footer Section',
    footerName: dir === 'rtl' ? 'الاسم' : 'Name',
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
    footers: dir === 'rtl' ? 'قسم تذييل' : 'footer sections',
    activeFooters: dir === 'rtl' ? 'الأقسام النشطة' : 'Active Sections',
    deletedFooters: dir === 'rtl' ? 'الأقسام المحذوفة' : 'Deleted Sections',
    showDeleted: dir === 'rtl' ? 'عرض المحذوفات' : 'Show Deleted',
    showActive: dir === 'rtl' ? 'عرض النشطة' : 'Show Active',
    selected: dir === 'rtl' ? 'محدد' : 'Selected',
    items: dir === 'rtl' ? 'عناصر' : 'items',
  };

  const filteredFooters = useMemo(() => {
    if (!searchQuery) return footers;
    const query = searchQuery.toLowerCase();
    return footers.filter(
      (footer) =>
        (footer.name && footer.name.toLowerCase().includes(query)) ||
        (footer.name_ar && footer.name_ar.toLowerCase().includes(query))
    );
  }, [footers, searchQuery]);

  const handleSelectAll = () => {
    if (selectedFooters.size === filteredFooters.length) {
      setSelectedFooters(new Set());
    } else {
      setSelectedFooters(new Set(filteredFooters.map(f => f.id)));
    }
  };

  const handleSelectFooter = (id: number, checked: boolean) => {
    setSelectedFooters(prev => {
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
      await createFooter(data);
      setFormOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingFooterId) return;
    setActionLoading(true);
    try {
      await updateFooter(editingFooterId, data);
      setEditingFooterId(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (footerId: number) => {
    setEditingFooterId(footerId);
    setFormOpen(true);
  };

  const handleShowClick = (footerId: number) => {
    navigate(`/admin/footer/${footerId}`);
  };

  const getFooterName = (footer: any) => {
    if (!footer) return '';
    if (lang === 'ar' && footer.name_ar) return footer.name_ar;
    return footer.name;
  };

  const getInitials = (footer: any) => {
    const name = getFooterName(footer);
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
              {showDeleted ? text.deletedFooters : text.activeFooters}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {total} {text.footers}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ExportExcelButton
            data={filteredFooters}
            fileName="footers-list"
            label={lang === 'ar' ? 'تصدير' : 'Export'}
            disabled={loading || filteredFooters.length === 0}
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
              setEditingFooterId(null);
              setFormOpen(true);
            }}
            className="gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Plus className="h-4 w-4" />
            {text.addFooter}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedFooters.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200"
        >
          <span className="text-sm font-medium text-purple-700">
            {selectedFooters.size} {text.selected} {text.items}
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
                    checked={filteredFooters.length > 0 && selectedFooters.size === filteredFooters.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{text.footerName}</TableHead>
                <TableHead className="hidden md:table-cell">{text.teacher}</TableHead>
                <TableHead className="text-center">Social Links</TableHead>
                {!showDeleted && <TableHead className="text-center w-24">{text.status}</TableHead>}
                <TableHead className="text-center w-28">{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {filteredFooters.map((footer, index) => (
                  <motion.tr
                    key={footer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 group"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedFooters.has(footer.id)}
                        onCheckedChange={(checked) => handleSelectFooter(footer.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarBadge
                          initials={getInitials(footer)}
                          size="sm"
                          variant={showDeleted ? "muted" : "primary"}
                        />
                        <div>
                          <div className={showDeleted ? 'text-gray-500 line-through' : 'font-medium'}>
                            {getFooterName(footer)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                            {footer.description?.substring(0, 40)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">Teacher ID: {footer.teacher_id}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1.5">
                        {footer.facebook_link && <FacebookIcon />}
                        {footer.youtube_link && <YoutubeIcon />}
                        {footer.instagram_link && <InstagramIcon />}
                        {footer.tiktok_link && <TikTokIcon />}
                        {footer.whatsapp_link && <Phone className="h-4 w-4 text-green-600" />}
                        {!footer.facebook_link && !footer.youtube_link && !footer.instagram_link && !footer.tiktok_link && !footer.whatsapp_link && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </TableCell>
                    {!showDeleted && (
                      <TableCell>
                        <FooterStatusToggle footerId={footer.id} active={footer.active} onToggle={toggleActive} />
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      {showDeleted ? (
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRestoringFooter(footer)}
                            className="text-green-600"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setForceDeletingFooter(footer)}
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
                            onClick={() => handleShowClick(footer.id)}
                            className="text-blue-600"
                            title={text.show}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(footer.id)}
                            className="text-amber-600"
                            title={text.edit}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingFooter(footer)}
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

        {filteredFooters.length === 0 && (
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
              {text.showing} {filteredFooters.length} {text.of} {total} {text.footers}
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
      <FooterForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingFooterId(null);
        }}
        onSubmit={editingFooterId ? handleUpdate : handleCreate}
        footerId={editingFooterId}
        loading={actionLoading}
      />

      <FooterDeleteDialog
        open={!!deletingFooter}
        onClose={() => setDeletingFooter(null)}
        onConfirm={async () => {
          await deleteFooter(deletingFooter.id);
          setDeletingFooter(null);
        }}
        footerName={getFooterName(deletingFooter)}
        loading={actionLoading}
      />

      <FooterDeleteDialog
        open={!!restoringFooter}
        onClose={() => setRestoringFooter(null)}
        onConfirm={async () => {
          await restoreFooter(restoringFooter.id);
          setRestoringFooter(null);
        }}
        footerName={getFooterName(restoringFooter)}
        loading={actionLoading}
        title="Restore Footer Section"
        confirmText="Restore"
        confirmClassName="bg-green-600"
      />

      <FooterDeleteDialog
        open={!!forceDeletingFooter}
        onClose={() => setForceDeletingFooter(null)}
        onConfirm={async () => {
          await forceDeleteFooter(forceDeletingFooter.id);
          setForceDeletingFooter(null);
        }}
        footerName={getFooterName(forceDeletingFooter)}
        loading={actionLoading}
        title="Permanent Delete"
        confirmText="Permanently Delete"
        confirmClassName="bg-red-700"
      />

      <FooterDeleteDialog
        open={bulkActionDialog.open}
        onClose={() => setBulkActionDialog({ type: null, open: false })}
        onConfirm={async () => {
          const ids = Array.from(selectedFooters);
          if (bulkActionDialog.type === 'delete') {
            await bulkDelete(ids);
          } else if (bulkActionDialog.type === 'restore') {
            await bulkRestore(ids);
          } else if (bulkActionDialog.type === 'forceDelete') {
            await bulkForceDelete(ids);
          }
          setBulkActionDialog({ type: null, open: false });
        }}
        footerName={`${selectedFooters.size} items`}
        loading={actionLoading}
        title={bulkActionDialog.type === 'delete' ? 'Delete Selected' : bulkActionDialog.type === 'restore' ? 'Restore Selected' : 'Permanently Delete Selected'}
        confirmText={bulkActionDialog.type === 'delete' ? 'Delete' : bulkActionDialog.type === 'restore' ? 'Restore' : 'Permanently Delete'}
        confirmClassName={bulkActionDialog.type === 'delete' ? 'bg-red-600' : bulkActionDialog.type === 'restore' ? 'bg-green-600' : 'bg-red-700'}
      />
    </div>
  );
}