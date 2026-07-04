// src/components/lesson-details/LessonAssignmentModal.tsx

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, Award, Hourglass, Loader2, 
  Calendar as CalendarIcon, Clock, Shield, Settings
} from 'lucide-react';
import { EmptyState, InfoRow } from './SharedComponents';
import type { Assignment } from '@/types/lesson.types';

interface LessonAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  loading: boolean;
  lang: string;
}

export const LessonAssignmentModal: React.FC<LessonAssignmentModalProps> = ({
  open,
  onClose,
  assignment,
  loading,
  lang,
}) => {
  if (!assignment && !loading) return null;

  const formatDateTime = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {assignment?.title || (lang === 'ar' ? 'تفاصيل الواجب' : 'Assignment Details')}
          </DialogTitle>
          <DialogDescription>
            {assignment?.description}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(80vh-120px)] pr-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : assignment ? (
            <div className="space-y-6">
              {/* Assignment Stats */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/30">
                <div className="text-center">
                  <Award className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold">{assignment.total_marks}</p>
                  <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الدرجة الكلية' : 'Total Marks'}</p>
                </div>
                <div className="text-center">
                  <Hourglass className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-xl font-bold">{assignment.duration_minutes}</p>
                  <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المدة (دقائق)' : 'Duration (min)'}</p>
                </div>
              </div>
              
              {/* Assignment Details */}
              <div className="space-y-2 p-4 rounded-xl bg-muted/30">
                <InfoRow 
                  icon={CalendarIcon} 
                  label={lang === 'ar' ? 'يبدأ' : 'Starts'} 
                  value={formatDateTime(assignment.time_start)} 
                />
                <InfoRow 
                  icon={Clock} 
                  label={lang === 'ar' ? 'ينتهي' : 'Ends'} 
                  value={formatDateTime(assignment.time_end)} 
                />
                <InfoRow 
                  icon={Shield} 
                  label={lang === 'ar' ? 'درجة النجاح' : 'Pass Mark'} 
                  value={assignment.total_must_pass_marks} 
                />
                <InfoRow 
                  icon={Settings} 
                  label={lang === 'ar' ? 'الحالة' : 'Status'} 
                  value={
                    <Badge variant={assignment.active ? "default" : "secondary"}>
                      {assignment.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                    </Badge>
                  } 
                />
              </div>

              {/* Assignment Description (if any) */}
              {assignment.description && (
                <div className="p-4 rounded-xl bg-muted/20">
                  <h4 className="font-semibold mb-2">
                    {lang === 'ar' ? 'الوصف' : 'Description'}
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {assignment.description}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-muted/20">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {lang === 'ar' ? 'نوع الواجب' : 'Assignment Type'}
                  </p>
                  <p className="font-medium">
                    {assignment.type_exam === 'online' ? (lang === 'ar' ? 'أونلاين' : 'Online') : (lang === 'ar' ? 'سنتر' : 'Center')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {lang === 'ar' ? 'ترتيب عشوائي' : 'Random Order'}
                  </p>
                  <p className="font-medium">
                    {assignment.random_questions ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState icon={ClipboardList} message={lang === 'ar' ? 'لا توجد بيانات' : 'No data available'} />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};