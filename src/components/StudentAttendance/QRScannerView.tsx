/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/StudentAttendance/components/QRScannerView.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ScanLine, XCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { QRScannerViewProps } from '@/types/attendance.types';

export const QRScannerView: React.FC<QRScannerViewProps> = ({
  onScan,
  isRTL,
  active,
}) => {
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

          // Extract numeric ID
          let studentId = decodedText.trim();
          
          try {
            const parsed = JSON.parse(studentId);
            studentId = String(parsed.id || parsed.student_id || parsed.studentId || studentId);
          } catch {
            // Not JSON, use as-is
          }

          const urlMatch = studentId.match(/(?:id=|\/students?\/)(\d+)/i);
          if (urlMatch) studentId = urlMatch[1];

          if (!/^\d+$/.test(studentId)) {
            toast.error(isRTL ? 'QR غير صالح - يجب أن يحتوي على ID الطالب' : 'Invalid QR - must contain student ID');
            return;
          }

          scannedRef.current = decodedText;
          setLastScanned(studentId);
          onScan(studentId);
        },
        () => {} // Error handler
      );

      setScannerReady(true);
    } catch (err: any) {
      console.error('QR Scanner error:', err);
      if (err?.message?.includes('NotAllowedError') || err?.name === 'NotAllowedError') {
        setScannerError(isRTL ? 'تم رفض الوصول للكاميرا. يرجى السماح باستخدام الكاميرا.' : 'Camera access denied. Please allow camera access.');
      } else if (err?.message?.includes('NotFoundError') || err?.name === 'NotFoundError') {
        setScannerError(isRTL ? 'لا توجد كاميرا على هذا الجهاز' : 'No camera found on this device');
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { 
            setScannerError(null); 
            startScanner(); 
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {isRTL ? 'إعادة المحاولة' : 'Try Again'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
        
        {scannerReady && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-[220px] h-[220px]">
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
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-primary/80"
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <ScanLine className="h-3.5 w-3.5" />
        {isRTL
          ? 'وجّه الكاميرا نحو QR الطالب للتعرف التلقائي'
          : 'Point camera at student\'s QR code to scan automatically'}
      </p>

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