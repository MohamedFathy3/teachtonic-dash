// src/components/lesson-details/LessonAssignments.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Award, Calendar as CalendarIcon, Eye } from 'lucide-react';
import { EmptyState } from './SharedComponents';
import type { Assignment } from '@/types/lesson.types';

interface LessonAssignmentsProps {
  assignments: Assignment[];
  lang: string;
  onViewAssignment: (assignmentId: number) => void;
}

export const LessonAssignments: React.FC<LessonAssignmentsProps> = ({ assignments, lang, onViewAssignment }) => {
  if (assignments.length === 0) {
    return <EmptyState icon={ClipboardList} message={lang === 'ar' ? 'لا توجد واجبات لهذا الدرس' : 'No assignments for this lesson'} />;
  }

  return (
    <div className="space-y-4 mt-4">
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="rounded-xl hover:shadow-md transition-all cursor-pointer" onClick={() => onViewAssignment(assignment.id)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <ClipboardList className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <h4 className="font-semibold">{assignment.title}</h4>
                  <Badge variant={assignment.active ? "default" : "secondary"} className="text-[10px]">
                    {assignment.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{assignment.description}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {lang === 'ar' ? `الدرجة: ${assignment.total_marks}` : `Marks: ${assignment.total_marks}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {lang === 'ar' ? `ينتهي: ${new Date(assignment.time_end).toLocaleDateString()}` : `Ends: ${new Date(assignment.time_end).toLocaleDateString()}`}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="shrink-0">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};