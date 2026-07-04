// src/components/lesson-details/LessonAttendanceModal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Student } from '@/types/lesson.types';

export const LessonAttendanceModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentId: string;
  setStudentId: (value: string) => void;
  loading: boolean;
  success: { studentName: string; status: string } | null;
  lessonTitle: string;
  students: Student[];
  lang: string;
}> = ({
  open,
  onClose,
  onConfirm,
  studentId,
  setStudentId,
  loading,
  success,
  lessonTitle,
  students,
  lang,
}) => {
  const foundStudent = students.find(s => s.id === parseInt(studentId));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
            <User className="h-5 w-5 text-green-500" />
            {lang === 'ar' ? 'تسجيل حضور طالب' : 'Mark Student Attendance'}
          </DialogTitle>
          <DialogDescription>
            {lang === 'ar' 
              ? 'أدخل ID الطالب لتسجيل حضوره في هذا الدرس'
              : 'Enter student ID to mark their attendance for this lesson'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          <div className="p-3 rounded-xl bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'الدرس' : 'Lesson'}</p>
            <p className="font-semibold text-base">{lessonTitle}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {lang === 'ar' ? 'ID الطالب' : 'Student ID'} *
            </label>
            <Input
              type="number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder={lang === 'ar' ? 'أدخل رقم الطالب...' : 'Enter student ID...'}
              className="rounded-xl text-center text-lg font-mono"
              autoFocus
            />
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-center"
            >
              <CheckCircle2 className="h-5 w-5 mx-auto mb-1" />
              <p className="font-medium">{success.studentName}</p>
              <p className="text-sm">{success.status}</p>
            </motion.div>
          )}

          {studentId && !success && (
            <div className="p-3 rounded-xl bg-muted/20">
              <p className="text-xs text-muted-foreground mb-2">
                {lang === 'ar' ? 'معلومات الطالب' : 'Student Info'}
              </p>
              {foundStudent ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-100 dark:bg-green-900/20 text-green-600">
                      {foundStudent.name?.charAt(0)?.toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{foundStudent.name}</p>
                    <p className="text-xs text-muted-foreground">{foundStudent.phone}</p>
                  </div>
                  <Badge variant={foundStudent.active ? "default" : "secondary"} className="text-[10px] ml-auto">
                    {foundStudent.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    {lang === 'ar' ? 'لم يتم العثور على طالب بهذا ID' : 'No student found with this ID'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading || !studentId.trim()}
            className="gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <CheckCircle2 className="h-4 w-4" />
            {lang === 'ar' ? 'تسجيل الحضور' : 'Mark Attendance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};