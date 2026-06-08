/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/exams/ExamViewer.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionCard } from '@/components/exams/QuestionCard';
import { Eye, FileText, Clock, Award, ChevronLeft } from 'lucide-react';

interface ExamViewerProps {
  exam: any;
  onBack: () => void;
}

export const ExamViewer: React.FC<ExamViewerProps> = ({ exam, onBack }) => {
  const { t, lang } = useApp();
  const isRTL = lang === 'ar';
  const questions = exam.questions || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-10 px-4"
    >
      <div className="max-w-5xl mx-auto">
        <Button onClick={onBack} variant="outline" className="mb-6 rounded-2xl gap-2">
          <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          {t('back')}
        </Button>

        {/* Exam Header */}
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <Card className="overflow-hidden border-0 shadow-2xl rounded-3xl bg-background/80 backdrop-blur-xl">
            <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center shadow-xl">
                    <Eye className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-3xl font-black tracking-tight">
                        {isRTL && exam.title_ar ? exam.title_ar : exam.title}
                      </h1>
                      <Badge variant="secondary" className="rounded-xl px-3 py-1 text-xs bg-primary/10 text-primary border-primary/20">
                        <Eye className="h-3 w-3 mr-1" />
                        {lang === 'ar' ? 'وضع العرض' : 'Preview Mode'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                      {isRTL && exam.description_ar ? exam.description_ar : exam.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="min-w-[110px] rounded-2xl border bg-muted/30 px-4 py-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">{lang === 'ar' ? 'الأسئلة' : 'Questions'}</div>
                    <div className="font-black text-xl">{questions.length}</div>
                  </div>
                  <div className="min-w-[110px] rounded-2xl border bg-muted/30 px-4 py-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">{lang === 'ar' ? 'الدرجة' : 'Marks'}</div>
                    <div className="font-black text-xl">{exam.total_marks}</div>
                  </div>
                  <div className="min-w-[110px] rounded-2xl border bg-muted/30 px-4 py-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">{lang === 'ar' ? 'الوقت' : 'Duration'}</div>
                    <div className="font-black text-xl">{exam.duration_minutes}</div>
                  </div>
                  {exam.type_exam && (
                    <div className="min-w-[110px] rounded-2xl border bg-muted/30 px-4 py-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">{lang === 'ar' ? 'النوع' : 'Type'}</div>
                      <div className="font-black text-sm">
                        {exam.type_exam === 'center' ? '🏫 مركز' : '💻 أونلاين'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q: any, idx: number) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card className="rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-background/90 backdrop-blur">
                <div className="h-1 bg-gradient-to-r from-primary/70 to-secondary/70" />
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center font-black text-lg shadow-lg">
                        {idx + 1}
                      </div>
                      <div>
                        <h2 className="font-black text-xl">{lang === 'ar' ? `السؤال ${idx + 1}` : `Question ${idx + 1}`}</h2>
                        <p className="text-sm text-muted-foreground">{q.mark} {t('marks')}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-xl px-3 py-1">
                      {q.question_type === 'true_false' && 'صح/خطأ'}
                      {q.question_type === 'multiple_choice' && 'اختيار من متعدد'}
                      {q.question_type === 'essay' && 'مقالي'}
                    </Badge>
                  </div>
                  <QuestionCard question={q} index={idx} readOnly />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10">
          <Card className="rounded-3xl border bg-background/80 backdrop-blur shadow-lg">
            <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-bold text-lg">{lang === 'ar' ? 'معاينة الامتحان' : 'Exam Preview'}</h3>
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar' ? 'هذا العرض للمعاينة فقط ولا يمكن إرسال الإجابات' : 'This is a preview mode only. Answers cannot be submitted.'}
                </p>
              </div>
              <Button variant="outline" className="rounded-2xl" onClick={onBack}>
                {lang === 'ar' ? 'الرجوع' : 'Back'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};