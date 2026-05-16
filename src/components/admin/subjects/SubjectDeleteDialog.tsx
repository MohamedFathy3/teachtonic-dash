// src/components/admin/subjects/SubjectDeleteDialog.tsx

import { useApp } from '@/contexts/AppContext';
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

interface SubjectDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  subjectName?: string;
  loading?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  confirmClassName?: string;
}

export function SubjectDeleteDialog({
  open,
  onClose,
  onConfirm,
  subjectName,
  loading,
  title,
  description,
  confirmText,
  confirmClassName,
}: SubjectDeleteDialogProps) {
  const { dir } = useApp();

  const defaultTitle = dir === 'rtl' ? 'تأكيد' : 'Confirm';
  const defaultDescription = dir === 'rtl'
    ? `هل أنت متأكد من هذا الإجراء للمادة "${subjectName}"؟`
    : `Are you sure you want to perform this action on "${subjectName}"?`;
  const defaultConfirmText = dir === 'rtl' ? 'تأكيد' : 'Confirm';

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            {title || defaultTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-xl" disabled={loading}>
            {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl ${confirmClassName || 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading
              ? (dir === 'rtl' ? 'جاري...' : 'Processing...')
              : (confirmText || defaultConfirmText)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}