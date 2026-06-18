// src/components/StudentAttendance/AttendanceHeader.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw, Calendar, Clock } from 'lucide-react';

interface AttendanceHeaderProps {
  isRTL: boolean;
  onRefresh: () => void;
  title?: string;
  subtitle?: string;
  lastUpdated?: string;
}

export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  isRTL,
  onRefresh,
  title,
  subtitle,
  lastUpdated,
}) => {
  const defaultTitle = isRTL ? '📝 تسجيل حضور الطلاب' : '📝 Student Attendance';
  const defaultSubtitle = isRTL
    ? 'اختر الكورس ← الدرس ← أدخل ID الطالب أو اسكان QR لتسجيل الحضور'
    : 'Select Course → Lesson → Enter Student ID or scan QR to record attendance';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 p-6 rounded-2xl border border-primary/10"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {title || defaultTitle}
        </h1>
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-primary" />
          {subtitle || defaultSubtitle}
        </p>
        {lastUpdated && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isRTL ? `آخر تحديث: ${lastUpdated}` : `Last updated: ${lastUpdated}`}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onRefresh}
          className="gap-2 hover:bg-primary/10 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4" />
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
      </div>
    </motion.div>
  );
};