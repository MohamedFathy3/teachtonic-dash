/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/FeaturesPage.tsx

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
import { useFeatures } from '@/hooks/useFeatures';
import { FeatureStatusToggle } from '@/components/admin/features/FeatureStatusToggle';
import { FeatureForm } from '@/components/admin/features/FeatureForm';
import { FeatureDeleteDialog } from '@/components/admin/features/FeatureDeleteDialog';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';

export function FeaturesPage() {
  const { dir, lang } = useApp();
  const navigate = useNavigate();

  const {
    features,
    loading,
    total,
    currentPage,
    lastPage,
    showDeleted,
    setShowDeleted,
    selectedFeatures,
    setSelectedFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
    forceDeleteFeature,
    restoreFeature,
    toggleActive,
    goToPage,
    bulkDelete,
    bulkForceDelete,
    bulkRestore
  } = useFeatures();

  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<number | null>(null);
  const [deletingFeature, setDeletingFeature] = useState<any>(null);
  const [restoringFeature, setRestoringFeature] = useState<any>(null);
  const [forceDeletingFeature, setForceDeletingFeature] = useState<any>(null);
  const [bulkActionDialog, setBulkActionDialog] = useState<{ type: 'delete' | 'restore' | 'forceDelete' | null; open: boolean }>({ type: null, open: false });
  const [actionLoading, setActionLoading] = useState(false);
  const [showingFeatureId, setShowingFeatureId] = useState<number | null>(null);

  const text = {
    searchPlaceholder: dir === 'rtl' ? 'البحث بالاسم...' : 'Search by name...',
    addFeature: dir === 'rtl' ? 'إضافة ميزة' : 'Add Feature',
    featureName: dir === 'rtl' ? 'الاسم' : 'Name',
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
    features: dir === 'rtl' ? 'ميزة' : 'features',
    activeFeatures: dir === 'rtl' ? 'الميزات النشطة' : 'Active Features',
    deletedFeatures: dir === 'rtl' ? 'الميزات المحذوفة' : 'Deleted Features',
    showDeleted: dir === 'rtl' ? 'عرض المحذوفات' : 'Show Deleted',
    showActive: dir === 'rtl' ? 'عرض النشطة' : 'Show Active',
    selected: dir === 'rtl' ? 'محدد' : 'Selected',
    items: dir === 'rtl' ? 'عناصر' : 'items',
  };

  const filteredFeatures = useMemo(() => {
    if (!searchQuery) return features;
    const query = searchQuery.toLowerCase();
    return features.filter(
      (feature) =>
        (feature.name && feature.name.toLowerCase().includes(query)) ||
        (feature.name_ar && feature.name_ar.toLowerCase().includes(query))
    );
  }, [features, searchQuery]);

  const handleSelectAll = () => {
    if (selectedFeatures.size === filteredFeatures.length) {
      setSelectedFeatures(new Set());
    } else {
      setSelectedFeatures(new Set(filteredFeatures.map(f => f.id)));
    }
  };

  const handleSelectFeature = (id: number, checked: boolean) => {
    setSelectedFeatures(prev => {
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
      await createFeature(data);
      setFormOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingFeatureId) return;
    setActionLoading(true);
    try {
      await updateFeature(editingFeatureId, data);
      setEditingFeatureId(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (featureId: number) => {
    setEditingFeatureId(featureId);
    setFormOpen(true);
  };

  const handleShowClick = (featureId: number) => {
    setShowingFeatureId(featureId);
  };

  const getFeatureName = (feature: any) => {
    if (!feature) return '';
    if (lang === 'ar' && feature.name_ar) return feature.name_ar;
    return feature.name;
  };

  const getInitials = (feature: any) => {
    const name = getFeatureName(feature);
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
              {showDeleted ? text.deletedFeatures : text.activeFeatures}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {total} {text.features}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ExportExcelButton
            data={filteredFeatures}
            fileName="features-list"
            label={lang === 'ar' ? 'تصدير' : 'Export'}
            disabled={loading || filteredFeatures.length === 0}
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
              setEditingFeatureId(null);
              setFormOpen(true);
            }}
            className="gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Plus className="h-4 w-4" />
            {text.addFeature}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedFeatures.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200"
        >
          <span className="text-sm font-medium text-purple-700">
            {selectedFeatures.size} {text.selected} {text.items}
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
                    checked={filteredFeatures.length > 0 && selectedFeatures.size === filteredFeatures.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{text.featureName}</TableHead>
                <TableHead className="hidden md:table-cell">{text.teacher}</TableHead>
                <TableHead className="text-center w-20">Image</TableHead>
                {!showDeleted && <TableHead className="text-center w-24">{text.status}</TableHead>}
                <TableHead className="text-center hidden lg:table-cell">{text.createdAt}</TableHead>
                <TableHead className="text-center w-28">{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {filteredFeatures.map((feature, index) => (
                  <motion.tr
                    key={feature.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className="border-gray-200 dark:border-gray-800 hover:bg-gray-50 group"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedFeatures.has(feature.id)}
                        onCheckedChange={(checked) => handleSelectFeature(feature.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarBadge
                          initials={getInitials(feature)}
                          size="sm"
                          variant={showDeleted ? "muted" : "primary"}
                        />
                        <div>
                          <div className={showDeleted ? 'text-gray-500 line-through' : 'font-medium'}>
                            {getFeatureName(feature)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                            {feature.description?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">Teacher ID: {feature.teacher_id}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {feature.image?.fullUrl ? (
                        <img
                          src={feature.image.fullUrl}
                          alt={feature.name}
                          className="h-8 w-8 rounded object-cover mx-auto"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-gray-400 mx-auto" />
                      )}
                    </TableCell>
                    {!showDeleted && (
                      <TableCell>
                        <FeatureStatusToggle featureId={feature.id} active={feature.active} onToggle={toggleActive} />
                      </TableCell>
                    )}
                    <TableCell className="text-center text-gray-500 text-sm hidden lg:table-cell">
                      {feature.createdAt}
                    </TableCell>
                    <TableCell className="text-center">
                      {showDeleted ? (
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRestoringFeature(feature)}
                            className="text-green-600"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setForceDeletingFeature(feature)}
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
                            onClick={() => handleShowClick(feature.id)}
                            className="text-blue-600"
                            title={text.show}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(feature.id)}
                            className="text-amber-600"
                            title={text.edit}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingFeature(feature)}
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

        {filteredFeatures.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {showDeleted ? 'لا توجد ميزات محذوفة' : 'لا توجد نتائج'}
            </p>
          </div>
        )}

        {total > 0 && (
          <div className="flex items-center justify-between border-t p-4 flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              {text.showing} {filteredFeatures.length} {text.of} {total} {text.features}
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
      <FeatureForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingFeatureId(null);
        }}
        onSubmit={editingFeatureId ? handleUpdate : handleCreate}
        featureId={editingFeatureId}
        loading={actionLoading}
      />


      <FeatureForm
        open={showingFeatureId !== null}
        onClose={() => setShowingFeatureId(null)}
        onSubmit={async () => { }}
        featureId={showingFeatureId}
        loading={false}
        readOnly={true}
      />


      <FeatureDeleteDialog
        open={!!deletingFeature}
        onClose={() => setDeletingFeature(null)}
        onConfirm={async () => {
          await deleteFeature(deletingFeature.id);
          setDeletingFeature(null);
        }}
        featureName={getFeatureName(deletingFeature)}
        loading={actionLoading}
      />

      <FeatureDeleteDialog
        open={!!restoringFeature}
        onClose={() => setRestoringFeature(null)}
        onConfirm={async () => {
          await restoreFeature(restoringFeature.id);
          setRestoringFeature(null);
        }}
        featureName={getFeatureName(restoringFeature)}
        loading={actionLoading}
        title="Restore Feature"
        confirmText="Restore"
        confirmClassName="bg-green-600"
      />

      <FeatureDeleteDialog
        open={!!forceDeletingFeature}
        onClose={() => setForceDeletingFeature(null)}
        onConfirm={async () => {
          await forceDeleteFeature(forceDeletingFeature.id);
          setForceDeletingFeature(null);
        }}
        featureName={getFeatureName(forceDeletingFeature)}
        loading={actionLoading}
        title="Permanent Delete"
        confirmText="Permanently Delete"
        confirmClassName="bg-red-700"
      />

      <FeatureDeleteDialog
        open={bulkActionDialog.open}
        onClose={() => setBulkActionDialog({ type: null, open: false })}
        onConfirm={async () => {
          const ids = Array.from(selectedFeatures);
          if (bulkActionDialog.type === 'delete') {
            await bulkDelete(ids);
          } else if (bulkActionDialog.type === 'restore') {
            await bulkRestore(ids);
          } else if (bulkActionDialog.type === 'forceDelete') {
            await bulkForceDelete(ids);
          }
          setBulkActionDialog({ type: null, open: false });
        }}
        featureName={`${selectedFeatures.size} items`}
        loading={actionLoading}
        title={bulkActionDialog.type === 'delete' ? 'Delete Selected' : bulkActionDialog.type === 'restore' ? 'Restore Selected' : 'Permanently Delete Selected'}
        confirmText={bulkActionDialog.type === 'delete' ? 'Delete' : bulkActionDialog.type === 'restore' ? 'Restore' : 'Permanently Delete'}
        confirmClassName={bulkActionDialog.type === 'delete' ? 'bg-red-600' : bulkActionDialog.type === 'restore' ? 'bg-green-600' : 'bg-red-700'}
      />
    </div>
  );
}