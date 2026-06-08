// src/components/admin/teachers/TeacherDeleteDialog.tsx

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { ShieldAlert, Eye, EyeOff } from 'lucide-react';

// 🔐 الـ password الـ static
const DELETE_PASSWORD = 'admin@1234';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  teacherName: string;
  loading?: boolean;
  title?: string;
  confirmText?: string;
  confirmClassName?: string;
}

export function TeacherDeleteDialog({
  open,
  onClose,
  onConfirm,
  teacherName,
  loading = false,
  title = 'Delete Teacher',
  confirmText = 'Delete',
  confirmClassName = 'bg-red-600',
}: Props) {
  const { t } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (password !== DELETE_PASSWORD) {
      setError('Incorrect password. Please try again.');
      return;
    }
    setError('');
    await onConfirm();
    setPassword('');
    setShowPassword(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-gray-500">
            {t('delete_confirmation') || 'Are you sure you want to delete'}{' '}
            <span className="font-semibold text-gray-800">"{teacherName}"</span>?
            {title.toLowerCase().includes('permanent') && (
              <span className="block mt-2 text-red-600 font-semibold">
                ⚠️ This action cannot be undone!
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Password Field */}
        <div className="space-y-2 py-2">
          <Label htmlFor="delete-password" className="text-sm font-medium">
            Enter admin password to confirm
          </Label>
          <div className="relative">
            <Input
              id="delete-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              placeholder="Enter password..."
              className={`pr-10 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              {error}
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={handleClose}>
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            className={`${confirmClassName} text-white`}
            disabled={loading || !password}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}