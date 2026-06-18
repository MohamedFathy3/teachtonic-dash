/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/StudentAttendance/components/BatchQRScanner.tsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ScanLine,
  CheckCircle2,
  XCircle,
  Users,
  RefreshCw,
  Trash2,
  Send,
  ListChecks,
} from 'lucide-react';
import { toast  } from "@/hooks/use-toast";
import { AttendanceService } from '@/services/Attendance.Service';
import { Student, BatchQRScannerProps } from '@/types/attendance.types';

export const BatchQRScanner: React.FC<BatchQRScannerProps> = ({
  lessonId,
  teacherId,
  onAttendanceRecorded,
  isRTL,
}) => {
  const [scannedStudents, setScannedStudents] = useState<Student[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scannedIdsRef = useRef<Set<string>>(new Set());

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
      const scannerId = 'batch-qr-reader-' + Date.now();

      if (containerRef.current) {
        containerRef.current.id = scannerId;
      }

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText: string) => {
          let studentId = decodedText.trim();
          
          try {
            const parsed = JSON.parse(studentId);
            studentId = String(parsed.id || parsed.student_id || parsed.studentId || studentId);
          } catch {
            // Not JSON
          }

          const urlMatch = studentId.match(/(?:id=|\/students?\/)(\d+)/i);
          if (urlMatch) studentId = urlMatch[1];

          if (!/^\d+$/.test(studentId)) {
            toast.error(isRTL ? 'QR غير صالح' : 'Invalid QR');
            return;
          }

          if (scannedIdsRef.current.has(studentId)) {
            toast.info(isRTL ? 'تم سكان هذا الطالب بالفعل' : 'Student already scanned');
            return;
          }

          setLastScanned(studentId);
          scannedIdsRef.current.add(studentId);

          try {
            const data = await AttendanceService.getStudentById(Number(studentId), teacherId);
            const student = data?.data?.[0] || data?.data;

            if (!student) {
              toast.error(isRTL ? 'الطالب غير موجود' : 'Student not found');
              scannedIdsRef.current.delete(studentId);
              return;
            }

            setScannedStudents(prev => [...prev, student]);
            toast.success(
              isRTL 
                ? `✅ تم سكان: ${student.name}` 
                : `✅ Scanned: ${student.name}`
            );
          } catch (error) {
            console.error('Error fetching student:', error);
            toast.error(isRTL ? 'خطأ في جلب بيانات الطالب' : 'Error fetching student');
            scannedIdsRef.current.delete(studentId);
          }
        },
        () => {}
      );

      setScannerReady(true);
    } catch (err: any) {
      console.error('QR Scanner error:', err);
      if (err?.message?.includes('NotAllowedError')) {
        setScannerError(isRTL ? 'تم رفض الوصول للكاميرا' : 'Camera access denied');
      } else {
        setScannerError(isRTL ? 'تعذر تشغيل الكاميرا' : 'Could not start camera');
      }
    }
  }, [isRTL, teacherId]);

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

  const handleRecordAll = async () => {
    if (scannedStudents.length === 0) {
      toast.error(isRTL ? 'لا يوجد طلاب لتسجيلهم' : 'No students to record');
      return;
    }

    setRecording(true);
    try {
      const studentIds = scannedStudents.map(s => s.id);
      await AttendanceService.recordBatchAttendance(lessonId, studentIds, true);
      
      toast.success(
        isRTL 
          ? `✅ تم تسجيل ${scannedStudents.length} طالب بنجاح` 
          : `✅ ${scannedStudents.length} students recorded successfully`
      );
      
      onAttendanceRecorded(studentIds);
      
      setScannedStudents([]);
      scannedIdsRef.current.clear();
    } catch (error: any) {
      console.error('Error recording batch attendance:', error);
      toast.error(error.response?.data?.message || (isRTL ? '❌ حدث خطأ' : '❌ An error occurred'));
    } finally {
      setRecording(false);
    }
  };

  const handleClearAll = () => {
    setScannedStudents([]);
    scannedIdsRef.current.clear();
    toast.info(isRTL ? 'تم مسح القائمة' : 'List cleared');
  };

  const handleRemoveStudent = (studentId: number) => {
    setScannedStudents(prev => prev.filter(s => s.id !== studentId));
    scannedIdsRef.current.delete(String(studentId));
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

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
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-black" style={{ minHeight: 300 }}>
        {!scannerReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-black/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-white/70">
              {isRTL ? 'جاري تشغيل الكاميرا...' : 'Starting camera...'}
            </p>
          </div>
        )}
        <div ref={containerRef} className="w-full" />
        
        {scannerReady && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-[250px] h-[250px]">
              {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-8 h-8 border-primary border-2`}
                  style={{
                    borderRight: i % 2 === 0 ? 'none' : undefined,
                    borderLeft: i % 2 !== 0 ? 'none' : undefined,
                    borderBottom: i < 2 ? 'none' : undefined,
                    borderTop: i >= 2 ? 'none' : undefined,
                  }}
                />
              ))}
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-primary/80"
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {isRTL ? `المسكان: ${scannedStudents.length}` : `Scanned: ${scannedStudents.length}`}
            </span>
          </div>
          {lastScanned && (
            <Badge variant="outline" className="gap-1">
              <ScanLine className="h-3 w-3" />
              {isRTL ? `آخر سكان: ${lastScanned}` : `Last: ${lastScanned}`}
            </Badge>
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
            className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600"
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
              {isRTL ? 'قائمة الطلاب' : 'Student List'}
            </div>
            {scannedStudents.map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {student.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {student.id}</p>
                  </div>
                  <Badge className="bg-green-500 shrink-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {isRTL ? 'جديد' : 'New'}
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

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <ScanLine className="h-3.5 w-3.5" />
        {isRTL
          ? 'اسكان QR لكل طالب - سيتم إضافتهم للقائمة والتسجيل دفعة واحدة'
          : 'Scan each student\'s QR - they will be added to the list and recorded in batch'}
      </p>
    </div>
  );
};