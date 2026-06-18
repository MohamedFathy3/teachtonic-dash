/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/StudentAttendance.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Search,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Hash,
  User,
  Phone,
  Mail,
  QrCode,
  ScanLine,
  KeyboardIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

// ============================================
// 📦 Types
// ============================================

interface Course {
  id: number;
  title: string;
  title_ar: string;
  type: string;
  count_student: number;
  image?: { fullUrl: string };
}

interface Lesson {
  id: number;
  course_id: number;
  titles: string[];
  titles_ar: string[];
  description: string;
  description_ar: string;
  lession_date: string;
  lession_time: string;
  price: string;
  attended: boolean;
  course?: Course;
  image?: { fullUrl: string };
}

type AttendanceTab = 'manual' | 'qr';

// ============================================
// 🎯 Service Layer
// ============================================

class AttendanceService {
  static async getCourses(teacherId: number, page: number = 1, perPage: number = 10) {
    const response = await api.post('/course/index', {
      filters: { teacher_id: teacherId, type: 'center' },
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage,
      page,
      paginate: true,
      delete: false,
    });
    return response.data;
  }

  static async getLessons(courseId: number, page: number = 1, perPage: number = 10) {
    const response = await api.post('/course-detail/index', {
      filters: { course_id: courseId },
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage,
      page,
      paginate: true,
      delete: false,
    });
    return response.data;
  }

  static async recordAttendance(lessonId: number, studentId: number, attended: boolean) {
    const response = await api.post('/course-detail-attendance', {
      course_detail_id: lessonId,
      student_id: studentId,
    });
    return response.data;
  }

  static async getStudentById(studentId: number, teacherId: number) {
    const response = await api.post('/student/index', {
      filters: {
        id: studentId,
        teacher_id: teacherId,
      },
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage: 1,
      page: 1,
      paginate: true,
      delete: false,
    });
    return response.data;
  }
}

// ============================================
// 📷 QR Scanner Component
// ============================================

const QRScannerView: React.FC<{
  onScan: (studentId: string) => void;
  isRTL: boolean;
  active: boolean;
}> = ({ onScan, isRTL, active }) => {
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const scannedRef = useRef<string | null>(null);

  const startScanner = useCallback(async () => {
    try {
      // Dynamically load html5-qrcode
      if (!(window as any).Html5Qrcode) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load QR library'));
          document.head.appendChild(script);
        });
      }

      const Html5Qrcode = (window as any).Html5Qrcode;
      const scannerId = 'qr-reader-' + Date.now();

      if (containerRef.current) {
        containerRef.current.id = scannerId;
      }

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          // Prevent duplicate scans
          if (scannedRef.current === decodedText) return;

          // Extract numeric ID - QR can contain just the number or a JSON/URL with the ID
          let studentId = decodedText.trim();
          
          // Try to extract ID from JSON format: {"id": 123} or {"student_id": 123}
          try {
            const parsed = JSON.parse(studentId);
            studentId = String(parsed.id || parsed.student_id || parsed.studentId || studentId);
          } catch {
            // Not JSON, use as-is
          }

          // Try to extract from URL: /students/123 or ?id=123
          const urlMatch = studentId.match(/(?:id=|\/students?\/)(\d+)/i);
          if (urlMatch) studentId = urlMatch[1];

          // Must be numeric
          if (!/^\d+$/.test(studentId)) {
            toast.error(isRTL ? 'QR غير صالح - يجب أن يحتوي على ID الطالب' : 'Invalid QR - must contain student ID');
            return;
          }

          scannedRef.current = decodedText;
          setLastScanned(studentId);
          onScan(studentId);
        },
        () => {} // Error handler (suppress frame errors)
      );

      setScannerReady(true);
    } catch (err: any) {
      console.error('QR Scanner error:', err);
      if (err?.message?.includes('NotAllowedError') || err?.name === 'NotAllowedError') {
        setScannerError(isRTL ? 'تم رفض الوصول للكاميرا. يرجى السماح باستخدام الكاميرا.' : 'Camera access denied. Please allow camera access.');
      } else {
        setScannerError(isRTL ? 'تعذر تشغيل الكاميرا' : 'Could not start camera');
      }
    }
  }, [isRTL, onScan]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setScannerReady(false);
    scannedRef.current = null;
  }, []);

  useEffect(() => {
    if (active) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [active, startScanner, stopScanner]);

  if (scannerError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <XCircle className="h-10 w-10 text-red-500" />
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{scannerError}</p>
        <Button variant="outline" size="sm" onClick={() => { setScannerError(null); startScanner(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {isRTL ? 'إعادة المحاولة' : 'Try Again'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Camera viewfinder */}
      <div className="relative rounded-xl overflow-hidden bg-black" style={{ minHeight: 260 }}>
        {!scannerReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-black/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-white/70">
              {isRTL ? 'جاري تشغيل الكاميرا...' : 'Starting camera...'}
            </p>
          </div>
        )}
        <div ref={containerRef} className="w-full" />
        
        {/* Scanning animation overlay */}
        {scannerReady && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-[220px] h-[220px]">
              {/* Corner markers */}
              {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-6 h-6 border-primary border-2`}
                  style={{
                    borderRight: i % 2 === 0 ? 'none' : undefined,
                    borderLeft: i % 2 !== 0 ? 'none' : undefined,
                    borderBottom: i < 2 ? 'none' : undefined,
                    borderTop: i >= 2 ? 'none' : undefined,
                  }}
                />
              ))}
              {/* Scanning line */}
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-primary/80"
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Instruction */}
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <ScanLine className="h-3.5 w-3.5" />
        {isRTL
          ? 'وجّه الكاميرا نحو QR الطالب للتعرف التلقائي'
          : 'Point camera at student\'s QR code to scan automatically'}
      </p>

      {/* Last scanned feedback */}
      {lastScanned && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20"
        >
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs font-medium text-primary">
            {isRTL ? `تم سكان ID: ${lastScanned}` : `Scanned ID: ${lastScanned}`}
          </p>
        </motion.div>
      )}
    </div>
  );
};

// ============================================
// 🎯 Student Attendance Modal
// ============================================

const StudentAttendanceModal: React.FC<{
  open: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  onRecordAttendance: (studentId: number, attended: boolean) => void;
  lang: string;
  teacherId?: number;
}> = ({ open, onClose, lesson, onRecordAttendance, lang, teacherId }) => {
  const isRTL = lang === 'ar';
  const [activeTab, setActiveTab] = useState<AttendanceTab>('manual');
  const [studentId, setStudentId] = useState<string>('');
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [attended, setAttended] = useState<boolean>(true);
  const [notFound, setNotFound] = useState(false);

  // Reset state when modal opens/closes
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
        toast.error(isRTL ? 'الطالب غير موجود أو لا يتبع لك' : 'Student not found or does not belong to you');
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

  // Called when QR scanner detects a code
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleManualSearch();
  };

  const tabs: { id: AttendanceTab; label: string; labelAr: string; icon: React.ReactNode }[] = [
    {
      id: 'manual',
      label: 'Manual ID',
      labelAr: 'إدخال يدوي',
      icon: <KeyboardIcon className="h-4 w-4" />,
    },
    {
      id: 'qr',
      label: 'Scan QR',
      labelAr: 'سكان QR',
      icon: <QrCode className="h-4 w-4" />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
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
                      <p className="font-semibold text-sm truncate text-foreground">
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
          {/* ✅ Tab Switcher */}
          <div className="flex rounded-xl border border-border overflow-hidden bg-muted/40 p-1 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setStudentData(null);
                  setNotFound(false);
                  setStudentId('');
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

          {/* ✅ Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'manual' ? (
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
            ) : (
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
                {/* Show loading after QR scan triggers fetch */}
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
          </AnimatePresence>

          {/* ✅ Student Data Display (shared between both tabs) */}
          <AnimatePresence>
            {!loading && notFound && (
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

            {!loading && studentData && (
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

          {/* ✅ Attendance Status */}
          {studentData && !loading && (
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
          <Button
            onClick={handleConfirm}
            disabled={!studentData || !studentId}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isRTL ? 'تسجيل الحضور' : 'Record Attendance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// 🏠 Main Component
// ============================================

export const StudentAttendance: React.FC = () => {
  const { t, lang, user } = useApp();
  const isRTL = lang === 'ar';

  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [coursePage] = useState(1);
  const [lessonPage, setLessonPage] = useState(1);
  const perPage = 10;

  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await AttendanceService.getCourses(user.id, coursePage, perPage);
      setCourses(data?.data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error(isRTL ? 'حدث خطأ في جلب الكورسات' : 'Error fetching courses');
    } finally {
      setLoading(false);
    }
  }, [user?.id, coursePage, isRTL]);

  const fetchLessons = useCallback(async () => {
    if (!selectedCourseId) {
      setLessons([]);
      return;
    }
    setLoadingLessons(true);
    try {
      const data = await AttendanceService.getLessons(selectedCourseId, lessonPage, perPage);
      setLessons(data?.data || []);
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      toast.error(isRTL ? 'حدث خطأ في جلب الدروس' : 'Error fetching lessons');
    } finally {
      setLoadingLessons(false);
    }
  }, [selectedCourseId, lessonPage, isRTL]);

  const handleRecordAttendance = async (studentId: number, attended: boolean) => {
    if (!selectedLesson) return;
    try {
      await AttendanceService.recordAttendance(selectedLesson.id, studentId, attended);
      toast.success(
        isRTL
          ? attended ? '✅ تم تسجيل الحضور بنجاح' : '✅ تم تسجيل الغياب بنجاح'
          : attended ? '✅ Attendance recorded successfully' : '✅ Absence recorded successfully'
      );
    } catch (error: any) {
      console.error('Error recording attendance:', error);
      toast.error(error.response?.data?.message || (isRTL ? '❌ حدث خطأ' : '❌ An error occurred'));
    }
  };

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { fetchLessons(); }, [fetchLessons]);
  useEffect(() => { setLessonPage(1); }, [selectedCourseId]);

  const getLessonTitle = (lesson: Lesson) =>
    isRTL
      ? lesson.titles_ar?.[0] || lesson.titles?.[0] || `Lesson ${lesson.id}`
      : lesson.titles?.[0] || lesson.titles_ar?.[0] || `Lesson ${lesson.id}`;

  const getCourseTitle = (course: Course) =>
    isRTL ? course.title_ar || course.title : course.title || course.title_ar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {isRTL ? '📝 تسجيل حضور الطلاب' : '📝 Student Attendance'}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {isRTL
                ? 'اختر الكورس ← الدرس ← أدخل ID الطالب أو اسكان QR لتسجيل الحضور'
                : 'Select Course → Lesson → Enter Student ID or scan QR to record attendance'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => { fetchCourses(); fetchLessons(); }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </motion.div>

        {/* Steps Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5"
        >
          <div className="flex items-center gap-2 flex-1">
            {[
              { label: isRTL ? 'الكورس' : 'Course', active: !!selectedCourseId },
              { label: isRTL ? 'الدرس' : 'Lesson', active: !!selectedLesson },
              { label: isRTL ? 'التسجيل' : 'Record', active: modalOpen },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-2 ${step.active ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step.active ? 'bg-primary text-white' : 'bg-muted'}`}>
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 ${step.active ? 'bg-primary' : 'bg-muted'}`} />}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Selection Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                {isRTL ? 'اختر الكورس' : 'Select Course'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Select
                  value={selectedCourseId?.toString() || ''}
                  onValueChange={(value) => {
                    setSelectedCourseId(value ? parseInt(value) : null);
                    setSelectedLesson(null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isRTL ? 'اختر الكورس' : 'Select a course'} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {getCourseTitle(course)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                {isRTL ? 'اختر الدرس' : 'Select Lesson'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedCourseId ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isRTL ? '⚠️ يرجى اختيار الكورس أولاً' : '⚠️ Please select a course first'}
                </p>
              ) : loadingLessons ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isRTL ? '📭 لا توجد دروس في هذا الكورس' : '📭 No lessons in this course'}
                </p>
              ) : (
                <Select
                  value={selectedLesson?.id?.toString() || ''}
                  onValueChange={(value) => {
                    const lesson = lessons.find(l => l.id === parseInt(value));
                    setSelectedLesson(lesson || null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isRTL ? 'اختر الدرس' : 'Select a lesson'} />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id.toString()}>
                        {getLessonTitle(lesson)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            onClick={() => setModalOpen(true)}
            disabled={!selectedLesson}
            className="gap-3 px-8 py-6 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
          >
            <UserPlus className="h-5 w-5" />
            {isRTL ? '📌 تسجيل حضور طالب' : '📌 Record Student Attendance'}
            {!selectedLesson && (
              <span className="text-xs text-white/70">
                ({isRTL ? 'اختر درساً أولاً' : 'Select a lesson first'})
              </span>
            )}
          </Button>
        </motion.div>

        {/* Attendance Modal */}
        <StudentAttendanceModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedLesson(null);
          }}
          lesson={selectedLesson}
          onRecordAttendance={handleRecordAttendance}
          lang={lang}
          teacherId={user?.id}
        />
      </div>
    </div>
  );
};

export default StudentAttendance;