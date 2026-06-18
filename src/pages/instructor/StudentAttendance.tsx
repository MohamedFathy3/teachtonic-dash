import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RefreshCw,
  Users,
  UserPlus,
  Barcode,
  ScanLine,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  BookOpen,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hash,
  User,
  Phone,
  Mail,
  StickyNote,
  Save,
  X,
  ListChecks,
  Trash2,
  Send,
  Camera,
  Smartphone,
  Vibrate,
  Check,
  ArrowRight,
  Circle,
  Volume2,
  Info,
  Lightbulb,
  ArrowRightCircle,
  Sparkles,
  Zap,
  Repeat,
} from 'lucide-react';
import { toast } from 'sonner';
import { AttendanceHeader } from '@/components/StudentAttendance/AttendanceHeader';
import { CourseSelector } from '@/components/StudentAttendance/CourseSelector';
import { LessonSelector } from '@/components/StudentAttendance/LessonSelector';
import { StudentAttendanceModal } from '@/components/StudentAttendance/StudentAttendanceModal';

import { useCourses } from '@/hooks/useCourseattens';
import { useLessons } from '@/hooks/useLessons';
import { useAttendance } from '@/hooks/useAttendance';
import { Lesson, Student } from '@/types/attendance.types';
import api from '@/lib/api';

// ============================================
// 📷 Auto-Scan QR/Barcode Scanner with Vibration
// ============================================

interface CameraScannerProps {
  lessonId: number;
  teacherId: number;
  onAttendanceRecorded: (studentIds: number[], notes?: string) => void;
  isRTL: boolean;
  onClose?: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({
  lessonId,
  teacherId,
  onAttendanceRecorded,
  isRTL,
  onClose,
}) => {
  const [scannedStudents, setScannedStudents] = useState<Student[]>([]);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [note, setNote] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scannerMode, setScannerMode] = useState<'qr' | 'barcode'>('qr');
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [recordedCount, setRecordedCount] = useState<number>(0);
  
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scannedIdsRef = useRef<Set<string>>(new Set());
  const vibrationRef = useRef<boolean>(true);
  const isProcessingRef = useRef<boolean>(false);
  const errorCountRef = useRef<number>(0);

  // 🎯 Vibrate function
  const vibratePhone = useCallback((pattern: number | number[] = 200) => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      // ignore
    }
  }, []);

  const playSuccessFeedback = useCallback(() => {
    vibratePhone([100, 50, 100, 50, 200]);
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 200);
    } catch (error) {
      // Audio not supported
    }
  }, [vibratePhone]);

  const playErrorFeedback = useCallback(() => {
    vibratePhone([300, 100, 300]);
  }, [vibratePhone]);

  const recordStudentInstantly = useCallback(async (studentId: number, studentName: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      await api.post('/course-detail-attendance', {
        course_detail_id: lessonId,
        student_id: studentId,
        note: note.trim() || undefined,
      });

      setRecordedCount(prev => prev + 1);
      playSuccessFeedback();
      
      toast.success(
        isRTL 
          ? `✅ تم تسجيل: ${studentName}` 
          : `✅ Recorded: ${studentName}`,
        {
          icon: '✅',
          duration: 1500,
        }
      );

      setScannedStudents(prev => [...prev, { 
        id: studentId, 
        name: studentName,
        barcode: String(studentId)
      } as Student]);

      if (scannedStudents.length === 0) {
        setShowNoteInput(true);
      }

    } catch (error: any) {
      console.error('Error recording student:', error);
      toast.error(
        error.response?.data?.message || (isRTL ? '❌ فشل التسجيل' : '❌ Recording failed'),
        {
          duration: 2000,
        }
      );
      playErrorFeedback();
    } finally {
      isProcessingRef.current = false;
    }
  }, [lessonId, note, isRTL, playSuccessFeedback, playErrorFeedback, scannedStudents.length]);

  // Start scanner - مع فلترة الأخطاء
  const startScanner = useCallback(async () => {
    try {
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
      const scannerId = 'camera-scanner-' + Date.now();

      if (containerRef.current) {
        containerRef.current.id = scannerId;
      }

      // Override console error temporarily to filter scanner errors
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        // Filter out specific scanner errors
        if (
          message.includes('NoMultiFormatReaders') ||
          message.includes('QR code parse error') ||
          message.includes('NotFoundException') ||
          message.includes('D: No MultiFormat Readers')
        ) {
          return; // Ignore these errors
        }
        originalConsoleError.apply(console, args);
      };

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      const formats = scannerMode === 'qr' 
        ? { qrbox: { width: 280, height: 280 } }
        : { 
            qrbox: { width: 400, height: 100 },
            formatsToSupport: [
              Html5Qrcode.ALL_FORMATS.CODE_128,
              Html5Qrcode.ALL_FORMATS.CODE_39,
              Html5Qrcode.ALL_FORMATS.EAN_13,
              Html5Qrcode.ALL_FORMATS.EAN_8,
              Html5Qrcode.ALL_FORMATS.UPC_A,
              Html5Qrcode.ALL_FORMATS.UPC_E,
              Html5Qrcode.ALL_FORMATS.QR_CODE,
            ]
          };

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          ...formats,
          aspectRatio: 1.0,
        },
        async (decodedText: string) => {
          let studentId = decodedText.trim();
          
          try {
            const parsed = JSON.parse(studentId);
            studentId = String(parsed.id || parsed.student_id || parsed.studentId || parsed.barcode || studentId);
          } catch {
            // Not JSON
          }

          const urlMatch = studentId.match(/(?:id=|\/students?\/|barcode=)(\d+)/i);
          if (urlMatch) studentId = urlMatch[1];

          if (!/^\d+$/.test(studentId)) {
            toast.error(isRTL ? 'QR/باركود غير صالح' : 'Invalid QR/Barcode');
            playErrorFeedback();
            return;
          }

          if (scannedIdsRef.current.has(studentId)) {
            toast.info(isRTL ? 'تم تسجيل هذا الطالب بالفعل' : 'Student already recorded');
            vibratePhone(100);
            return;
          }

          setLastScanned(studentId);
          scannedIdsRef.current.add(studentId);
          setLoading(true);

          try {
            const response = await api.post('/student/index', {
              filters: {
                barcode: studentId,
                teacher_id: teacherId,
              },
              orderBy: 'id',
              orderByDirection: 'desc',
              perPage: 1,
              page: 1,
              paginate: true,
              delete: false,
            });

            const student = response.data?.data?.[0] || response.data?.data;

            if (!student) {
              toast.error(isRTL ? 'الطالب غير موجود' : 'Student not found');
              playErrorFeedback();
              scannedIdsRef.current.delete(studentId);
              setLoading(false);
              return;
            }

            if (autoMode) {
              await recordStudentInstantly(Number(studentId), student.name);
            } else {
              playSuccessFeedback();
              setScannedStudents(prev => [...prev, student]);
              toast.success(
                isRTL 
                  ? `✅ تم سكان: ${student.name}` 
                  : `✅ Scanned: ${student.name}`,
                {
                  icon: '📳',
                  duration: 2000,
                }
              );
              if (scannedStudents.length === 0) {
                setShowNoteInput(true);
              }
            }

          } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
            playErrorFeedback();
            scannedIdsRef.current.delete(studentId);
          } finally {
            setLoading(false);
          }
        },
        (error: any) => {
          // ✅ فلترة الأخطاء - منع ظهور Error: D: No MultiFormat Readers
          const errorMessage = error?.message || '';
          if (
            errorMessage.includes('NoMultiFormatReaders') ||
            errorMessage.includes('QR code parse error') ||
            errorMessage.includes('NotFoundException') ||
            errorMessage.includes('D: No MultiFormat Readers')
          ) {
            return; // تجاهل هذه الأخطاء تماماً
          }
          // سجل الأخطاء الأخرى فقط
          console.warn('Scanner warning:', error);
        }
      );

      // Restore console error
      console.error = originalConsoleError;

      setScannerReady(true);
      toast.success(
        isRTL 
          ? `✅ الكاميرا جاهزة - وضع ${autoMode ? 'تلقائي' : 'يدوي'}` 
          : `✅ Camera ready - ${autoMode ? 'Auto' : 'Manual'} mode`
      );

    } catch (err: any) {
      console.error('Scanner error:', err);
      if (err?.message?.includes('NotAllowedError') || err?.name === 'NotAllowedError') {
        setScannerError(isRTL ? 'تم رفض الوصول للكاميرا' : 'Camera access denied');
      } else if (err?.message?.includes('NotFoundError') || err?.name === 'NotFoundError') {
        setScannerError(isRTL ? 'لا توجد كاميرا على هذا الجهاز' : 'No camera found');
      } else {
        setScannerError(isRTL ? 'تعذر تشغيل الكاميرا' : 'Could not start camera');
      }
      playErrorFeedback();
    }
  }, [isRTL, teacherId, scannerMode, autoMode, playSuccessFeedback, playErrorFeedback, vibratePhone, recordStudentInstantly]);

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
  }, []);

  const handleRemoveStudent = (studentId: number) => {
    setScannedStudents(prev => prev.filter(s => s.id !== studentId));
    scannedIdsRef.current.delete(String(studentId));
    vibratePhone(50);
  };

  const handleRecordAll = async () => {
    if (scannedStudents.length === 0) {
      toast.error(isRTL ? 'لا يوجد طلاب لتسجيلهم' : 'No students to record');
      return;
    }

    setRecording(true);
    try {
      const studentIds = scannedStudents.map(s => s.id);
      
      for (const studentId of studentIds) {
        await api.post('/course-detail-attendance', {
          course_detail_id: lessonId,
          student_id: studentId,
          note: note.trim() || undefined,
        });
      }

      vibratePhone([200, 100, 200, 100, 400]);
      
      toast.success(
        isRTL 
          ? `✅ تم تسجيل ${scannedStudents.length} طالب بنجاح${note ? ' مع ملاحظة' : ''}` 
          : `✅ ${scannedStudents.length} students recorded successfully${note ? ' with note' : ''}`,
        {
          icon: '🎉',
          duration: 4000,
        }
      );

      onAttendanceRecorded(studentIds, note.trim() || undefined);
      
      setScannedStudents([]);
      scannedIdsRef.current.clear();
      setNote('');
      setShowNoteInput(false);
      
    } catch (error: any) {
      console.error('Error recording attendance:', error);
      toast.error(error.response?.data?.message || (isRTL ? '❌ حدث خطأ' : '❌ An error occurred'));
      playErrorFeedback();
    } finally {
      setRecording(false);
    }
  };

  const handleClearAll = () => {
    if (scannedStudents.length === 0) return;
    setScannedStudents([]);
    scannedIdsRef.current.clear();
    setNote('');
    setShowNoteInput(false);
    vibratePhone(50);
    toast.info(isRTL ? 'تم مسح القائمة' : 'List cleared');
  };

  const toggleVibration = () => {
    vibrationRef.current = !vibrationRef.current;
    toast.info(
      vibrationRef.current 
        ? (isRTL ? '🔊 الاهتزاز مفعل' : '🔊 Vibration enabled')
        : (isRTL ? '🔇 الاهتزاز معطل' : '🔇 Vibration disabled')
    );
  };

  const toggleMode = () => {
    setAutoMode(!autoMode);
    toast.info(
      !autoMode 
        ? (isRTL ? '⚡ وضع التسجيل التلقائي مفعل' : '⚡ Auto-recording mode enabled')
        : (isRTL ? '📋 وضع التسجيل اليدوي مفعل' : '📋 Manual recording mode enabled')
    );
    setScannedStudents([]);
    scannedIdsRef.current.clear();
    setRecordedCount(0);
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  if (scannerError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
          {isRTL ? 'تعذر تشغيل الكاميرا' : 'Camera Error'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">{scannerError}</p>
        <div className="flex gap-3 mt-2">
          <Button 
            variant="outline" 
            onClick={() => { 
              setScannerError(null); 
              startScanner(); 
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {isRTL ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={scannerMode === 'qr' ? 'default' : 'outline'}
            onClick={() => setScannerMode('qr')}
            className="gap-2"
          >
            <ScanLine className="h-4 w-4" />
            QR
          </Button>
          <Button
            size="sm"
            variant={scannerMode === 'barcode' ? 'default' : 'outline'}
            onClick={() => setScannerMode('barcode')}
            className="gap-2"
          >
            <Barcode className="h-4 w-4" />
            Barcode
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={autoMode ? 'default' : 'outline'}
            onClick={toggleMode}
            className={`gap-2 ${autoMode ? 'bg-gradient-to-r from-green-500 to-emerald-600' : ''}`}
          >
            {autoMode ? (
              <Zap className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {autoMode 
              ? (isRTL ? 'تلقائي' : 'Auto')
              : (isRTL ? 'يدوي' : 'Manual')
            }
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleVibration}
            className="gap-2"
          >
            {vibrationRef.current ? (
              <Vibrate className="h-4 w-4 text-primary" />
            ) : (
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative rounded-xl overflow-hidden bg-black" style={{ minHeight: 320 }}>
        {!scannerReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-black/80">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-white/70">
              {isRTL ? 'جاري تشغيل الكاميرا...' : 'Starting camera...'}
            </p>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75" />
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
            </div>
          </div>
        )}
        
        <div ref={containerRef} className="w-full" />
        
        {scannerReady && (
          <>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-[280px] h-[280px]">
                {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                  <div
                    key={i}
                    className={`absolute ${pos} w-8 h-8 border-2 border-primary/80`}
                    style={{
                      borderRight: i % 2 === 0 ? 'none' : undefined,
                      borderLeft: i % 2 !== 0 ? 'none' : undefined,
                      borderBottom: i < 2 ? 'none' : undefined,
                      borderTop: i >= 2 ? 'none' : undefined,
                    }}
                  />
                ))}
                <motion.div
                  className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 opacity-30">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white" />
                </div>

                {autoMode && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {isRTL ? 'تسجيل تلقائي' : 'Auto-Record'}
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center px-4 py-2 rounded-lg bg-black/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
                {isRTL ? 'الكاميرا جاهزة' : 'Camera ready'}
                {autoMode && (
                  <Badge className="bg-green-500/80 text-[8px] px-1.5 py-0">
                    {isRTL ? 'تلقائي' : 'Auto'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-white/80 text-xs">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {autoMode ? recordedCount : scannedStudents.length}
                </span>
                <span className="text-white/50">|</span>
                <span className="flex items-center gap-1">
                  <ScanLine className="h-3 w-3" />
                  {scannerMode === 'qr' ? 'QR' : 'Barcode'}
                </span>
              </div>
            </div>

            {lastScanned && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-4 right-4 px-3 py-1.5 rounded-lg bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isRTL ? `آخر تسجيل: ${lastScanned}` : `Last: ${lastScanned}`}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Note Input */}
      <AnimatePresence>
        {showNoteInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Label className="flex items-center gap-2 text-sm font-medium">
              <StickyNote className="h-4 w-4 text-primary" />
              {isRTL ? 'ملاحظة (اختياري)' : 'Note (Optional)'}
            </Label>
            <div className="relative">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={isRTL ? 'أضف ملاحظة للحضور...' : 'Add attendance note...'}
                className="min-h-[60px] resize-none"
                rows={2}
              />
              {note && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNote('')}
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Mode */}
      {!autoMode && (
        <>
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {isRTL ? `المسكان: ${scannedStudents.length}` : `Scanned: ${scannedStudents.length}`}
                </span>
              </div>
              {note && (
                <Badge variant="secondary" className="gap-1">
                  <StickyNote className="h-3 w-3" />
                  {isRTL ? 'ملاحظة' : 'Note'}
                </Badge>
              )}
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={scannedStudents.length === 0}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleRecordAll}
                disabled={scannedStudents.length === 0 || recording}
                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {recording ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isRTL ? 'تسجيل الكل' : 'Record All'}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {scannedStudents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 max-h-60 overflow-y-auto"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ListChecks className="h-4 w-4" />
                  {isRTL ? 'قائمة الطلاب المسكانين' : 'Scanned Students'}
                  <Badge variant="outline" className="text-xs">
                    {scannedStudents.length}
                  </Badge>
                </div>
                {scannedStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {student.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="h-2.5 w-2.5 text-white" />
                        </motion.div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? `الباركود: ${student.barcode || student.id}` : `Barcode: ${student.barcode || student.id}`}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                        #{index + 1}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStudent(student.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Auto Mode Stats */}
      {autoMode && recordedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-center"
        >
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            {isRTL 
              ? `✅ تم تسجيل ${recordedCount} طالب بنجاح` 
              : `✅ ${recordedCount} students recorded successfully`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isRTL 
              ? 'استمر في مسح الطلاب للتسجيل التلقائي' 
              : 'Continue scanning students for auto-recording'}
          </p>
        </motion.div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Smartphone className="h-3.5 w-3.5" />
          <span>
            {isRTL 
              ? `مسح ${scannerMode === 'qr' ? 'QR' : 'Barcode'} - ${autoMode ? 'تلقائي' : `${scannedStudents.length} طالب`}` 
              : `${scannerMode === 'qr' ? 'QR' : 'Barcode'} Scan - ${autoMode ? 'Auto' : `${scannedStudents.length} students`}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          </div>
          <span>
            {isRTL ? 'جاهز للمسح' : 'Ready to scan'}
          </span>
        </div>
      </div>
    </div>
  );
};
// ============================================
// 🆕 How to Use Component
// ============================================

const HowToUseSection: React.FC<{ isRTL: boolean }> = ({ isRTL }) => {
  const steps = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: isRTL ? 'اختر الواجب' : 'Select Assignment',
      description: isRTL 
        ? 'تأكد من اختيار الواجب أولاً من القائمة المنسدلة' 
        : 'Make sure to select the assignment from the dropdown list',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Camera className="h-5 w-5" />,
      title: isRTL ? 'افتح الكاميرا' : 'Open Camera',
      description: isRTL 
        ? 'اضغط على زر "فتح كاميرا الهاتف للمسح"' 
        : 'Click the "Open Phone Camera to Scan" button',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: isRTL ? 'مسح وتسجيل تلقائي' : 'Scan & Auto-Record',
      description: isRTL 
        ? 'بمجرد مسح الباركود يتم تسجيل الحضور تلقائياً ويهتز الهاتف' 
        : 'Attendance is recorded automatically on scan with vibration feedback',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <Repeat className="h-5 w-5" />,
      title: isRTL ? 'استمر في المسح' : 'Continue Scanning',
      description: isRTL 
        ? 'استمر في مسح الطلاب - الكاميرا جاهزة للتسجيل التلقائي المستمر' 
        : 'Keep scanning students - camera stays ready for continuous auto-recording',
      color: 'from-orange-500 to-amber-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 border border-primary/10"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-secondary">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {isRTL ? '📖 طريقة الاستخدام' : '📖 How to Use'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'اتبع الخطوات التالية لتسجيل حضور الطلاب بسهولة' 
                : 'Follow these steps to easily record student attendance'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="relative group"
            >
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                
                <div className={`mt-1 p-2 rounded-lg bg-gradient-to-r ${step.color} bg-opacity-10`}>
                  <div className="text-white">
                    {step.icon}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-medium">
              {isRTL ? '💡 نصائح سريعة:' : '💡 Quick Tips:'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              {isRTL ? 'وضع تلقائي للتسجيل الفوري' : 'Auto mode for instant recording'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {isRTL ? 'اهتزاز عند نجاح التسجيل' : 'Vibrates on successful recording'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Repeat className="h-3 w-3 text-purple-500" />
              {isRTL ? 'مسح مستمر بدون توقف' : 'Continuous scanning without stopping'}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// 🏠 Main Component
// ============================================

export const StudentAttendance: React.FC = () => {
  const { lang, user } = useApp();
  const isRTL = lang === 'ar';

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  const { courses, loading: coursesLoading, fetchCourses } = useCourses(user?.id);
  const { lessons, loading: lessonsLoading, fetchLessons } = useLessons(selectedCourseId);
  const { recordAttendance } = useAttendance();

  const handleRefresh = () => {
    fetchCourses();
    if (selectedCourseId) fetchLessons();
    toast.info(isRTL ? 'جاري التحديث...' : 'Refreshing...');
  };

  const handleAttendanceRecorded = (studentIds: number[], notes?: string) => {
    console.log('✅ Recorded students:', studentIds, 'Notes:', notes);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <AttendanceHeader
          isRTL={isRTL}
          onRefresh={handleRefresh}
        />

        <HowToUseSection isRTL={isRTL} />

        {/* Selection Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <CourseSelector
            courses={courses}
            loading={coursesLoading}
            selectedId={selectedCourseId}
            onSelect={(id) => {
              setSelectedCourseId(id);
              setSelectedLesson(null);
            }}
            isRTL={isRTL}
          />

          <LessonSelector
            lessons={lessons}
            loading={lessonsLoading}
            selectedId={selectedLesson?.id || null}
            onSelect={setSelectedLesson}
            isRTL={isRTL}
            courseSelected={!!selectedCourseId}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={() => setModalOpen(true)}
            disabled={!selectedLesson}
            className="gap-3 px-8 py-6 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
          >
            <UserPlus className="h-5 w-5" />
            {isRTL ? '📌 إدخال يدوي' : '📌 Manual Entry'}
            {!selectedLesson && (
              <span className="text-xs text-white/70">
                ({isRTL ? 'اختر درساً أولاً' : 'Select a lesson first'})
              </span>
            )}
          </Button>

          <Button
            size="lg"
            onClick={() => setShowCameraScanner(true)}
            disabled={!selectedLesson}
            className="gap-3 px-8 py-6 text-lg rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg transition-all animate-pulse"
          >
            <Camera className="h-5 w-5" />
            {isRTL ? '📷 فتح كاميرا الهاتف للمسح' : '📷 Open Phone Camera to Scan'}
            {!selectedLesson && (
              <span className="text-xs text-white/70">
                ({isRTL ? 'اختر درساً أولاً' : 'Select a lesson first'})
              </span>
            )}
          </Button>
        </motion.div>

        {/* Camera Scanner Modal */}
        <Dialog open={showCameraScanner} onOpenChange={setShowCameraScanner}>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Camera className="h-5 w-5 text-primary" />
                {isRTL ? '📷 مسح QR/Barcode' : '📷 QR/Barcode Scanner'}
              </DialogTitle>
              <DialogDescription>
                {isRTL
                  ? 'قم بمسح QR code أو Barcode للطالب - سيتم التسجيل تلقائياً'
                  : 'Scan student\'s QR code or Barcode - will be recorded automatically'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              {selectedLesson && user?.id && (
                <CameraScanner
                  lessonId={selectedLesson.id}
                  teacherId={user.id}
                  onAttendanceRecorded={handleAttendanceRecorded}
                  isRTL={isRTL}
                  onClose={() => setShowCameraScanner(false)}
                />
              )}
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCameraScanner(false)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manual Attendance Modal */}
        <StudentAttendanceModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedLesson(null);
          }}
          lesson={selectedLesson}
          onRecordAttendance={recordAttendance}
          lang={lang}
          teacherId={user?.id}
        />
      </div>
    </div>
  );
};

export default StudentAttendance;