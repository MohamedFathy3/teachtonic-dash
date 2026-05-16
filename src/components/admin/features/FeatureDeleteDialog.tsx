// src/components/admin/features/FeatureDeleteDialog.tsx

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
import { useApp } from '@/contexts/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  featureName: string;
  loading?: boolean;
  title?: string;
  confirmText?: string;
  confirmClassName?: string;
}

export function FeatureDeleteDialog({
  open,
  onClose,
  onConfirm,
  featureName,
  loading = false,
  title = 'Delete Feature',
  confirmText = 'Delete',
  confirmClassName = 'bg-red-600',
}: Props) {
  const { t, dir } = useApp();

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('delete_confirmation') || 'Are you sure you want to delete'} "{featureName}"?
            {title.includes('permanent') && (
              <span className="block mt-2 text-red-600 font-semibold">
                ⚠️ This action cannot be undone!
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={confirmClassName}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}