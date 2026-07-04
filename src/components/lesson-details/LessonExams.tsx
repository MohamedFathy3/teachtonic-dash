// src/components/lesson-details/LessonExams.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileQuestion, Award, Hourglass, Shield, Eye } from 'lucide-react';
import { EmptyState } from './SharedComponents';
import type { Exam } from '@/types/lesson.types';

interface LessonExamsProps {
  exams: Exam[];
  lang: string;
  onViewExam: (examId: number) => void;
}

export const LessonExams: React.FC<LessonExamsProps> = ({ exams, lang, onViewExam }) => {
  if (exams.length === 0) {
    return <EmptyState icon={FileQuestion} message={lang === 'ar' ? 'لا توجد امتحانات لهذا الدرس' : 'No exams for this lesson'} />;
  }

  return (
    <div className="space-y-4 mt-4">
      {exams.map((exam) => (
        <Card key={exam.id} className="rounded-xl hover:shadow-md transition-all cursor-pointer" onClick={() => onViewExam(exam.id)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <FileQuestion className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <h4 className="font-semibold">{exam.title}</h4>
                  <Badge variant={exam.active ? "default" : "secondary"} className="text-[10px]">
                    {exam.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{exam.description}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {lang === 'ar' ? `الدرجة: ${exam.total_marks}` : `Marks: ${exam.total_marks}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Hourglass className="h-3 w-3" />
                    {lang === 'ar' ? `المدة: ${exam.duration_minutes} دقيقة` : `Duration: ${exam.duration_minutes} min`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {lang === 'ar' ? `درجة النجاح: ${exam.total_must_pass_marks}` : `Pass mark: ${exam.total_must_pass_marks}`}
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