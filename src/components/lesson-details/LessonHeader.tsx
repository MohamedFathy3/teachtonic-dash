// src/components/lesson-details/LessonHeader.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, Lock, User, Printer, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { LessonDetail } from '@/types/lesson.types';

interface LessonHeaderProps {
  lesson: LessonDetail;
  onBack: () => void;
  onCopyLink: () => void;
  onPrint: () => void;
  onMarkAttendance: () => void;
  lang: string;
  isRTL: boolean;
  copied?: boolean;
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({
  lesson,
  onBack,
  onCopyLink,
  onPrint,
  onMarkAttendance,
  lang,
  isRTL,
  copied = false,
}) => {
  const getTitle = () => {
    if (isRTL && lesson?.titles_ar?.length) return lesson.titles_ar[0];
    if (lesson?.titles?.length) return lesson.titles[0];
    return '—';
  };

  const title = getTitle();
  const courseTitle = isRTL ? lesson.course?.title_ar : lesson.course?.title;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <motion.div whileHover={{ x: -5 }}>
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {lang === 'ar' ? 'رجوع' : 'Back'}
          </Button>
        </motion.div>
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            {title}
          </motion.h1>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              ID: {lesson.id}
            </Badge>
            {courseTitle && (
              <Badge variant="outline" className="text-xs">
                {courseTitle}
              </Badge>
            )}
            {lesson.must_pass_to_unlock && (
              <Badge variant="warning" className="text-xs gap-1 bg-amber-500/20 text-amber-600">
                <Lock className="h-3 w-3" />
                {lang === 'ar' ? 'اجتياز الامتحان مطلوب' : 'Exam required'}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Buttons Group */}
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onCopyLink} className="gap-1">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {lang === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{lang === 'ar' ? 'نسخ رابط الصفحة' : 'Copy page link'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};