// src/components/StudentAttendance/StudentAttendanceModal.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Barcode, 
  Search, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  BookOpen,
  StickyNote,
  X,
  Users,
  AlertCircle,
  ScanLine,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AttendanceService } from '@/services/Attendance.Service';
import { Lesson, Student } from '@/types/attendance.types';

interface StudentAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  onRecordAttendance: (studentId: number, attended: boolean, lessonId: number, lang: string) => Promise<boolean>;
  lang: string;
  teacherId?: number;
}

export const StudentAttendanceModal: React.FC<StudentAttendanceModalProps> = ({
  open,
  onClose,
  lesson,
  onRecordAttendance,
  lang,
  teacherId,
}) => {
  const isRTL = lang === 'ar';
  
  // ✅ States
  const [searchType, setSearchType] = useState<'barcode' | 'name'>('barcode');
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);

  // ✅ Reset on close
  useEffect(() => {
    if (!open) {
      setSearchValue('');
      setFoundStudent(null);
      setNote('');
      setAttendanceStatus('pending');
      setErrorMessage(null);
      setSearching(false);
    }
  }, [open]);

  // ✅ Search student
  const handleSearch = useCallback(async () => {
    if (!searchValue.trim()) {
      toast.error(isRTL ? '❌ يرجى إدخال الباركود أو الاسم' : '❌ Please enter barcode or name');
      return;
    }

    if (!teacherId) {
      toast.error(isRTL ? '❌ لم يتم تحديد المعلم' : '❌ Teacher not selected');
      return;
    }

    setSearching(true);
    setFoundStudent(null);
    setErrorMessage(null);

    try {
      let response;
      
      if (searchType === 'barcode') {
        // ✅ بحث بالباركود
        response = await AttendanceService.getStudentByBarcode(searchValue.trim(), teacherId);
      } else {
        // ✅ بحث بالاسم (استخدم نفس الـ endpoint مع فلتر name)
        response = await api.post('/student/index', {
          filters: {
            name: searchValue.trim(),
            teacher_id: teacherId,
          },
          perPage: 1,
          page: 1,
          paginate: true,
          delete: false,
        });
      }

      const studentData = response?.data?.[0] || response?.data;

      if (studentData) {
        setFoundStudent(studentData);
        toast.success(
          isRTL 
            ? `✅ تم العثور على: ${studentData.name}` 
            : `✅ Found: ${studentData.name}`
        );
      } else {
        setErrorMessage(isRTL ? '❌ لم يتم العثور على طالب' : '❌ Student not found');
        toast.error(isRTL ? '❌ لم يتم العثور على طالب' : '❌ Student not found');
      }
    } catch (error: any) {
      console.error('❌ Search error:', error);
      setErrorMessage(error.response?.data?.message || (isRTL ? '❌ حدث خطأ في البحث' : '❌ Search error'));
      toast.error(error.response?.data?.message || (isRTL ? '❌ حدث خطأ في البحث' : '❌ Search error'));
    } finally {
      setSearching(false);
    }
  }, [searchValue, searchType, teacherId, isRTL]);

  // ✅ Handle confirm attendance
  const handleConfirm = useCallback(async () => {
    // ✅ التحقق من وجود الطالب
    if (!foundStudent) {
      toast.error(isRTL ? '❌ يرجى البحث عن طالب أولاً' : '❌ Please search for a student first');
      return;
    }

    // ✅ التحقق من وجود الدرس ✅✅✅ المهم جداً
    if (!lesson) {
      toast.error(isRTL ? '❌ لم يتم تحديد الدرس' : '❌ Lesson not selected');
      console.error('❌ Lesson is null or undefined in handleConfirm');
      return;
    }

    // ✅ التحقق من وجود lesson.id ✅✅✅
    if (!lesson.id) {
      toast.error(isRTL ? '❌ معرف الدرس غير صحيح' : '❌ Invalid lesson ID');
      console.error('❌ lesson.id is missing:', lesson);
      return;
    }

    console.log('✅ Confirming attendance with:', {
      studentId: foundStudent.id,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      note: note,
    });

    setIsLoading(true);
    setAttendanceStatus('pending');

    try {
      // ✅ استدعاء الـ API مع lesson.id ✅✅✅
      const success = await onRecordAttendance(
        foundStudent.id,
        true, // attended
        lesson.id, // ✅ هنا الـ lesson.id
        lang
      );

      if (success) {
        setAttendanceStatus('success');
        toast.success(
          isRTL 
            ? `✅ تم تسجيل حضور ${foundStudent.name} بنجاح` 
            : `✅ ${foundStudent.name} attendance recorded successfully`,
          {
            icon: '🎉',
            duration: 3000,
          }
        );
        
        // ✅ إضافة للقائمة الأخيرة
        setRecentStudents(prev => {
          const filtered = prev.filter(s => s.id !== foundStudent.id);
          return [foundStudent, ...filtered].slice(0, 5);
        });

        // ✅ إعادة تعيين بعد 2 ثانية
        setTimeout(() => {
          setFoundStudent(null);
          setSearchValue('');
          setNote('');
          setAttendanceStatus('pending');
          onClose();
        }, 2000);
      } else {
        setAttendanceStatus('error');
      }
    } catch (error: any) {
      console.error('❌ Error confirming attendance:', error);
      setAttendanceStatus('error');
      setErrorMessage(error.message || (isRTL ? '❌ حدث خطأ في تسجيل الحضور' : '❌ An error occurred'));
      toast.error(
        error.message || (isRTL ? '❌ حدث خطأ في تسجيل الحضور' : '❌ An error occurred')
      );
    } finally {
      setIsLoading(false);
    }
  }, [foundStudent, lesson, onRecordAttendance, lang, isRTL, note, onClose]);

  // ✅ Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (foundStudent) {
        handleConfirm();
      } else {
        handleSearch();
      }
    }
  };

  // ✅ Render
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserCheck className="h-5 w-5 text-primary" />
            {isRTL ? 'تسجيل حضور طالب' : 'Record Student Attendance'}
          </DialogTitle>
          <DialogDescription>
            {isRTL 
              ? 'ابحث عن طالب باستخدام الباركود أو الاسم ثم قم بتسجيل حضوره'
              : 'Search for a student by barcode or name then record attendance'}
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Lesson Info */}
        {lesson && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3 w-3" />
                {isRTL ? 'الدرس' : 'Lesson'}
              </Badge>
              <span className="font-medium">{lesson.title || `Lesson #${lesson.id}`}</span>
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                ID: {lesson.id}
              </Badge>
            </div>
          </div>
        )}

        {/* ✅ Search Type Toggle */}
        <div className="flex gap-2 p-1 rounded-xl bg-muted/50">
          <button
            onClick={() => setSearchType('barcode')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              searchType === 'barcode'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'hover:bg-muted'
            }`}
          >
            <Barcode className="h-4 w-4" />
            {isRTL ? 'باركود' : 'Barcode'}
          </button>
          <button
            onClick={() => setSearchType('name')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              searchType === 'name'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'hover:bg-muted'
            }`}
          >
            <User className="h-4 w-4" />
            {isRTL ? 'الاسم' : 'Name'}
          </button>
        </div>

        {/* ✅ Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                searchType === 'barcode'
                  ? isRTL ? 'أدخل الباركود...' : 'Enter barcode...'
                  : isRTL ? 'أدخل اسم الطالب...' : 'Enter student name...'
              }
              className="pr-10 rounded-xl"
              autoFocus
              disabled={isLoading}
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching || !searchValue.trim()}
            className="gap-2 rounded-xl px-6"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isRTL ? 'بحث' : 'Search'}
          </Button>
        </div>

        {/* ✅ Error Message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* ✅ Student Found */}
        {foundStudent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {foundStudent.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold">{foundStudent.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Barcode className="h-3.5 w-3.5" />
                    {foundStudent.barcode || foundStudent.id}
                  </span>
                  {foundStudent.phone && (
                    <span className="flex items-center gap-1">
                      <span>•</span>
                      {foundStudent.phone}
                    </span>
                  )}
                </div>
              </div>
              <Badge className="bg-green-500 text-white">
                {isRTL ? 'تم العثور' : 'Found'}
              </Badge>
            </div>
          </motion.div>
        )}

        {/* ✅ Recent Students */}
        {recentStudents.length > 0 && !foundStudent && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {isRTL ? 'آخر الطلاب المسجلين' : 'Recent Students'}
            </Label>
            <div className="flex flex-wrap gap-2">
              {recentStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setFoundStudent(student)}
                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-colors flex items-center gap-2"
                >
                  <User className="h-3.5 w-3.5" />
                  {student.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Note Input */}
        {foundStudent && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <StickyNote className="h-4 w-4 text-primary" />
              {isRTL ? 'ملاحظة (اختياري)' : 'Note (Optional)'}
            </Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isRTL ? 'أضف ملاحظة للحضور...' : 'Add attendance note...'}
              className="rounded-xl"
            />
          </div>
        )}

        {/* ✅ Status */}
        {attendanceStatus === 'success' && (
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            {isRTL ? '✅ تم تسجيل الحضور بنجاح' : '✅ Attendance recorded successfully'}
          </div>
        )}

        {attendanceStatus === 'error' && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            {isRTL ? '❌ حدث خطأ في تسجيل الحضور' : '❌ An error occurred'}
          </div>
        )}

        {/* ✅ Actions */}
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="gap-2 rounded-xl"
          >
            <X className="h-4 w-4" />
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!foundStudent || isLoading || attendanceStatus === 'success'}
            className="gap-2 rounded-xl px-6 bg-gradient-to-r from-primary to-secondary"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
            {isRTL ? 'تسجيل الحضور' : 'Record Attendance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ✅ Import api for name search
import api from '@/lib/api';

export default StudentAttendanceModal;