/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/lesson-details/LessonExamModal.tsx

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  FileQuestion, Award, Shield, Hourglass, Loader2, 
  Users, CheckCircle2, XCircle, ListChecks, Eye 
} from 'lucide-react';
import { EmptyState } from './SharedComponents';
import type { ExamDetail } from '@/types/lesson.types';

interface LessonExamModalProps {
  open: boolean;
  onClose: () => void;
  exam: ExamDetail | null;
  loading: boolean;
  lang: string;
}

export const LessonExamModal: React.FC<LessonExamModalProps> = ({
  open,
  onClose,
  exam,
  loading,
  lang,
}) => {
  if (!exam && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            {exam?.title || (lang === 'ar' ? 'تفاصيل الامتحان' : 'Exam Details')}
          </DialogTitle>
          <DialogDescription>
            {exam?.description}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : exam ? (
            <div className="space-y-6">
              {/* Exam Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/30">
                <div className="text-center">
                  <Award className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold">{exam.total_marks}</p>
                  <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الدرجة الكلية' : 'Total Marks'}</p>
                </div>
                <div className="text-center">
                  <Shield className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{exam.total_must_pass_marks}</p>
                  <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'درجة النجاح' : 'Pass Mark'}</p>
                </div>
                <div className="text-center">
                  <Hourglass className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{exam.duration_minutes}</p>
                  <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'المدة (دقائق)' : 'Duration (min)'}</p>
                </div>
                <div className="text-center">
                  <Badge variant={exam.active ? "default" : "secondary"} className="mt-2">
                    {exam.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                  </Badge>
                </div>
              </div>

              {/* Questions List */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  {lang === 'ar' ? 'أسئلة الامتحان' : 'Exam Questions'} ({exam.questions?.length || 0})
                </h3>
                <div className="space-y-4">
                  {exam.questions?.map((question, idx) => (
                    <Card key={question.id} className="rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="shrink-0 mt-0.5">
                            #{idx + 1}
                          </Badge>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge variant="secondary" className="text-[10px]">
                                {question.question_type === 'multiple_choice' ? (lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice') :
                                 question.question_type === 'true_false' ? (lang === 'ar' ? 'صح/خطأ' : 'True/False') :
                                 (lang === 'ar' ? 'مقالي' : 'Essay')}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] bg-amber-500/10">
                                <Award className="h-3 w-3 mr-1" />
                                {question.mark} {lang === 'ar' ? 'درجة' : 'marks'}
                              </Badge>
                            </div>
                            <p className="font-medium">{question.question}</p>
                            {question.correct_answer && (
                              <div className="mt-2 p-2 rounded-lg bg-green-500/10 text-green-600 text-sm">
                                <CheckCircle2 className="h-3 w-3 inline mr-1" />
                                {lang === 'ar' ? 'الإجابة الصحيحة:' : 'Correct answer:'} {question.correct_answer}
                              </div>
                            )}
                            {question.image?.fullUrl && (
                              <img 
                                src={question.image.fullUrl} 
                                alt="Question" 
                                className="mt-2 rounded-lg max-h-32 object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Students Who Took Exam */}
              {exam.students && exam.students.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {lang === 'ar' ? 'الطلاب الذين أدوا الامتحان' : 'Students Who Took The Exam'} ({exam.students.length})
                  </h3>
                  <div className="space-y-4">
                    {exam.students.map((student: any) => {
                      const totalStudentMark = student.answers?.reduce((sum: number, ans: any) => sum + (parseFloat(ans.mark) || 0), 0) || 0;
                      const totalQuestions = student.answers?.length || 0;
                      const correctAnswers = student.answers?.filter((ans: any) => ans.is_correct === true).length || 0;
                      const percentage = exam.total_marks > 0 ? (totalStudentMark / exam.total_marks) * 100 : 0;
                      
                      return (
                        <Card key={student.id} className="rounded-xl overflow-hidden hover:shadow-md transition-all">
                          <CardContent className="p-0">
                            {/* Student Header */}
                            <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
                              <div className="flex items-start justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                      {student.name?.charAt(0)?.toUpperCase() || 'S'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold text-lg">{student.name}</p>
                                    <p className="text-xs text-muted-foreground">ID: {student.id}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-center px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/20">
                                    <p className="text-xl font-bold text-green-600">{totalStudentMark}</p>
                                    <p className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'من' : 'out of'} {exam.total_marks}</p>
                                  </div>
                                  <Badge variant={percentage >= 50 ? "default" : "destructive"} className="text-xs">
                                    {percentage.toFixed(1)}%
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="px-4 pt-3">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>{lang === 'ar' ? 'نسبة النجاح' : 'Success Rate'}</span>
                                <span>{percentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                            
                            {/* Answers Summary */}
                            <div className="p-4">
                              <div className="grid grid-cols-3 gap-3 mb-3">
                                <div className="text-center p-2 rounded-lg bg-muted/30">
                                  <p className="text-xl font-bold">{totalQuestions}</p>
                                  <p className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'عدد الإجابات' : 'Answers'}</p>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                                  <p className="text-xl font-bold text-green-600">{correctAnswers}</p>
                                  <p className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'صحيحة' : 'Correct'}</p>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                                  <p className="text-xl font-bold text-red-600">{totalQuestions - correctAnswers}</p>
                                  <p className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'خاطئة' : 'Wrong'}</p>
                                </div>
                              </div>
                              
                              {/* Answers Details */}
                              <details className="mt-2">
                                <summary className="text-sm font-medium cursor-pointer hover:text-primary transition-colors">
                                  {lang === 'ar' ? 'عرض تفاصيل الإجابات' : 'Show Answers Details'}
                                </summary>
                                <div className="mt-3 space-y-2">
                                  {student.answers?.map((answer: any, ansIdx: number) => {
                                    const question = exam.questions?.find((q: any) => q.id === answer.question_id);
                                    return (
                                      <div key={answer.id} className="p-2 rounded-lg bg-muted/20 text-sm">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1">
                                            <span className="text-xs text-muted-foreground">
                                              {lang === 'ar' ? 'سؤال' : 'Q'} {ansIdx + 1}:
                                            </span>
                                            <span className="ml-1">{question?.question || `Question ${answer.question_id}`}</span>
                                          </div>
                                          <Badge variant={answer.is_correct ? "default" : "destructive"} className="text-[10px] shrink-0">
                                            {answer.is_correct ? (lang === 'ar' ? '✓ صحيح' : '✓ Correct') : (lang === 'ar' ? '✗ خطأ' : '✗ Wrong')}
                                          </Badge>
                                        </div>
                                        <div className="mt-1 text-xs">
                                          <span className="text-muted-foreground">
                                            {lang === 'ar' ? 'الإجابة:' : 'Answer:'}
                                          </span>
                                          <span className="ml-1 font-medium">{answer.answer || '—'}</span>
                                          {answer.mark && (
                                            <span className="ml-2 text-green-600">
                                              ({answer.mark} / {question?.mark || 0} {lang === 'ar' ? 'درجة' : 'marks'})
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </details>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState icon={FileQuestion} message={lang === 'ar' ? 'لا توجد بيانات' : 'No data available'} />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};