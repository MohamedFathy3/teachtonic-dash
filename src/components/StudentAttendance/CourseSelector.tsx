// src/pages/instructor/StudentAttendance/components/CourseSelector.tsx

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
import { Loader2, BookOpen } from 'lucide-react';
import { CourseSelectorProps } from '@/types/attendance.types';

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  courses,
  loading,
  selectedId,
  onSelect,
  isRTL,
}) => {
  const getCourseTitle = (course: any) =>
    isRTL ? course.title_ar || course.title : course.title || course.title_ar;

  return (
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
            value={selectedId?.toString() || ''}
            onValueChange={(value) => {
              onSelect(value ? parseInt(value) : null);
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
  );
};