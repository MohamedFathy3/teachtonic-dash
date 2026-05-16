// src/components/admin/stages/StageDeleteDialog.tsx

import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StageDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  stageName?: string;
  loading?: boolean;
  isDeleted?: boolean;  // ✅ أضفنا الخاصية دي
  title?: string;
  description?: string;
  confirmText?: string;
  confirmClassName?: string;
}

export function StageDeleteDialog({
  open,
  onClose,
  onConfirm,
  stageName,
  loading,
  isDeleted = false,  // ✅ قيمة افتراضية
  title,
  description,
  confirmText,
  confirmClassName,
}: StageDeleteDialogProps) {
  const { dir } = useApp();

  const getDefaultTitle = () => {
    if (title) return title;
    if (isDeleted) return dir === 'rtl' ? 'استعادة المرحلة' : 'Restore Stage';
    return dir === 'rtl' ? 'حذف المرحلة' : 'Delete Stage';
  };

  const getDefaultDescription = () => {
    if (description) return description;
    if (isDeleted) {
      return dir === 'rtl'
        ? `هل أنت متأكد من استعادة "${stageName}"؟`
        : `Are you sure you want to restore "${stageName}"?`;
    }
    return dir === 'rtl'
      ? `هل أنت متأكد من حذف "${stageName}"؟`
      : `Are you sure you want to delete "${stageName}"?`;
  };

  const getDefaultConfirmText = () => {
    if (confirmText) return confirmText;
    if (isDeleted) return dir === 'rtl' ? 'استعادة' : 'Restore';
    return dir === 'rtl' ? 'حذف' : 'Delete';
  };

  const getDefaultConfirmClass = () => {
    if (confirmClassName) return confirmClassName;
    if (isDeleted) return 'bg-green-600 hover:bg-green-700';
    return 'bg-red-600 hover:bg-red-700';
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            {getDefaultTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {getDefaultDescription()}
          </AlertDialogDescription>
          {isDeleted && (
            <AlertDialogDescription className="text-yellow-600 dark:text-yellow-500 text-sm mt-2">
              {dir === 'rtl'
                ? '⚠️ هذه المرحلة محذوفة بالفعل. يمكنك استعادتها أو حذفها نهائياً.'
                : '⚠️ This stage is already deleted. You can restore it or delete permanently.'}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-xl" disabled={loading}>
            {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl ${getDefaultConfirmClass()}`}
          >
            {loading
              ? (dir === 'rtl' ? 'جاري...' : 'Processing...')
              : getDefaultConfirmText()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}