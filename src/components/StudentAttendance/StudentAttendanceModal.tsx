// src/pages/instructor/StudentAttendance/components/StudentAttendanceModal.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Search,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  Hash,
  User,
  Phone,
  Mail,
  QrCode,
  ScanLine,
  KeyboardIcon,
  ListChecks,
} from 'lucide-react';
import { toast  } from "@/hooks/use-toast";
import { AttendanceService } from '@/services/Attendance.Service';
import { QRScannerView } from './QRScannerView';
import { BatchQRScanner } from './BatchQRScanner';
import { Lesson, AttendanceTab } from '@/types/attendance.types';;

interface StudentAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  onRecordAttendance: (studentId: number, attended: boolean) => void;
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
  const [activeTab, setActiveTab] = useState<AttendanceTab>('manual');
  const [studentId, setStudentId] = useState<string>('');
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [attended, setAttended] = useState<boolean>(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!open) {
      setStudentId('');
      setStudentData(null);
      setNotFound(false);
      setAttended(true);
      setActiveTab('manual');
    }
  }, [open]);

  const fetchStudent = useCallback(async (id: string) => {
    if (!id || isNaN(Number(id))) {
      toast.error(isRTL ? 'يرجى إدخال ID صحيح' : 'Please enter a valid ID');
      return;
    }
    if (!teacherId) {
      toast.error(isRTL ? 'لم يتم العثور على المعلم' : 'Teacher not found');
      return;
    }

    setLoading(true);
    setNotFound(false);
    setStudentData(null);

    try {
      const data = await AttendanceService.getStudentById(Number(id), teacherId);
      const student = data?.data?.[0] || data?.data;

      if (!student) {
        setNotFound(true);
        toast.error(isRTL ? 'الطالب غير موجود أو لا يتبع لك' : 'Student not found');
        return;
      }

      setStudentData(student);
      toast.success(isRTL ? 'تم جلب بيانات الطالب' : 'Student data loaded');
    } catch (error: any) {
      console.error('Error fetching student:', error);
      setNotFound(true);
      toast.error(error.response?.data?.message || (isRTL ? 'الطالب غير موجود' : 'Student not found'));
    } finally {
      setLoading(false);
    }
  }, [teacherId, isRTL]);

  const handleQRScan = useCallback((scannedId: string) => {
    setStudentId(scannedId);
    fetchStudent(scannedId);
  }, [fetchStudent]);

  const handleManualSearch = () => fetchStudent(studentId);

  const handleConfirm = () => {
    if (!studentId || isNaN(Number(studentId))) {
      toast.error(isRTL ? 'يرجى إدخال ID الطالب' : 'Please enter student ID');
      return;
    }
    if (!studentData) {
      toast.error(isRTL ? 'يرجى البحث عن الطالب أولاً' : 'Please search for student first');
      return;
    }
    onRecordAttendance(Number(studentId), attended);
    onClose();
  };

  const handleBatchRecorded = () => {
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleManualSearch();
  };

  const tabs: { id: AttendanceTab; label: string; labelAr: string; icon: React.ReactNode }[] = [
    {
      id: 'manual',
      label: 'Manual',
      labelAr: 'يدوي',
      icon: <KeyboardIcon className="h-4 w-4" />,
    },
    {
      id: 'qr',
      label: 'Scan QR',
      labelAr: 'سكان QR',
      icon: <QrCode className="h-4 w-4" />,
    },
    {
      id: 'batch-qr',
      label: 'Batch Scan',
      labelAr: 'سكان دفعة',
      icon: <ListChecks className="h-4 w-4" />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-primary" />
            {isRTL ? 'تسجيل حضور طالب' : 'Student Attendance'}
          </DialogTitle>
          <DialogDescription asChild>
            <div>
              {lesson && (
                <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                      {lesson.image?.fullUrl ? (
                        <img src={lesson.image.fullUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {isRTL ? lesson.titles_ar?.[0] || lesson.titles?.[0] : lesson.titles?.[0] || lesson.titles_ar?.[0]}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {lesson.lession_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.lession_time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex rounded-xl border border-border overflow-hidden bg-muted/40 p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'batch-qr') {
                    setStudentData(null);
                    setNotFound(false);
                    setStudentId('');
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-background shadow-sm text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {tab.icon}
                {isRTL ? tab.labelAr : tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'manual' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    {isRTL ? 'ID الطالب' : 'Student ID'}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={studentId}
                        onChange={(e) => {
                          setStudentId(e.target.value);
                          setNotFound(false);
                          setStudentData(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={isRTL ? 'أدخل ID الطالب' : 'Enter student ID'}
                        className="pl-9"
                      />
                    </div>
                    <Button
                      onClick={handleManualSearch}
                      disabled={loading || !studentId}
                      className="gap-2"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      {isRTL ? 'بحث' : 'Search'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'qr' && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <QRScannerView
                  onScan={handleQRScan}
                  isRTL={isRTL}
                  active={activeTab === 'qr' && open}
                />
                {loading && (
                  <div className="flex items-center justify-center gap-2 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {isRTL ? 'جاري جلب بيانات الطالب...' : 'Fetching student data...'}
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'batch-qr' && lesson && teacherId && (
              <motion.div
                key="batch"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <BatchQRScanner
                  lessonId={lesson.id}
                  teacherId={teacherId}
                  onAttendanceRecorded={handleBatchRecorded}
                  isRTL={isRTL}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!loading && activeTab !== 'batch-qr' && notFound && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-center"
              >
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {isRTL ? 'الطالب غير موجود' : 'Student not found'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL
                    ? 'تأكد من ID الطالب أو أن الطالب يتبع لك'
                    : 'Check student ID or make sure the student belongs to you'}
                </p>
              </motion.div>
            )}

            {!loading && activeTab !== 'batch-qr' && studentData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {studentData.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{studentData.name || 'Student'}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {studentData.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {studentData.phone}
                        </span>
                      )}
                      {studentData.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {studentData.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-green-500 shrink-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {isRTL ? 'تم العثور' : 'Found'}
                  </Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {studentData && !loading && activeTab !== 'batch-qr' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <Label>{isRTL ? 'حالة الحضور' : 'Attendance Status'}</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={attended ? 'default' : 'outline'}
                  className={attended ? 'bg-green-500 hover:bg-green-600' : ''}
                  onClick={() => setAttended(true)}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {isRTL ? 'حاضر' : 'Present'}
                </Button>
                <Button
                  variant={!attended ? 'default' : 'outline'}
                  className={!attended ? 'bg-red-500 hover:bg-red-600' : ''}
                  onClick={() => setAttended(false)}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  {isRTL ? 'غائب' : 'Absent'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          {activeTab !== 'batch-qr' && (
            <Button
              onClick={handleConfirm}
              disabled={!studentData || !studentId}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isRTL ? 'تسجيل الحضور' : 'Record Attendance'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};