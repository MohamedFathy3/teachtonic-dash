/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/StudentAttendance/components/LessonSelector.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, GraduationCap } from 'lucide-react';
import { LessonSelectorProps } from '@/types/attendance.types';

export const LessonSelector: React.FC<LessonSelectorProps> = ({
  lessons,
  loading,
  selectedId,
  onSelect,
  isRTL,
  courseSelected,
}) => {
  const getLessonTitle = (lesson: any) =>
    isRTL
      ? lesson.titles_ar?.[0] || lesson.titles?.[0] || `Lesson ${lesson.id}`
      : lesson.titles?.[0] || lesson.titles_ar?.[0] || `Lesson ${lesson.id}`;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          {isRTL ? 'اختر الدرس' : 'Select Lesson'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!courseSelected ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {isRTL ? '⚠️ يرجى اختيار الكورس أولاً' : '⚠️ Please select a course first'}
          </p>
        ) : loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {isRTL ? '📭 لا توجد دروس في هذا الكورس' : '📭 No lessons in this course'}
          </p>
        ) : (
          <Select
            value={selectedId?.toString() || ''}
            onValueChange={(value) => {
              const lesson = lessons.find(l => l.id === parseInt(value));
              onSelect(lesson || null);
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
  );
};