// src/components/admin/assistant-teachers/AssistantTeacherDeleteDialog.tsx

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

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  assistantName: string;
  loading?: boolean;
  title?: string;
  confirmText?: string;
  confirmClassName?: string;
}

export function AssistantTeacherDeleteDialog({
  open,
  onClose,
  onConfirm,
  assistantName,
  loading = false,
  title = 'Delete Assistant Teacher',
  confirmText = 'Delete',
  confirmClassName = 'bg-red-600',
}: Props) {
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
            Are you sure you want to delete "{assistantName}"?
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