// src/components/exam/QuestionList.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, Trash2, Edit, FileText, CheckCircle, XCircle } from 'lucide-react';

interface Question {
  id?: number;
  question_type: 'mcq' | 'essay' | 'true_false';
  question: string;
  mark: number;
  options?: string[];
  correct_answer?: string | number;
  image?: number | null;
}

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question, index: number) => void;
  onDelete: (index: number) => void;
  lang: string;
  t: (key: string) => string;
  disabled?: boolean;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onEdit,
  onDelete,
  lang,
  t,
  disabled = false
}) => {
  const isRTL = lang === 'ar';

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">{lang === 'ar' ? 'لا توجد أسئلة' : 'No questions'}</p>
        <p className="text-sm mt-1">
          {lang === 'ar' 
            ? 'ابدأ بإضافة أسئلة للواجب' 
            : 'Start by adding questions to the assignment'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="overflow-hidden border border-border/50 hover:border-primary/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="flex-shrink-0 mt-1">
                  <GripVertical className="h-5 w-5 text-muted-foreground/50 cursor-grab" />
                </div>

                {/* Question Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    
                    {/* Question Type Badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      question.question_type === 'mcq' 
                        ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                        : question.question_type === 'true_false'
                        ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300'
                        : 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                    }`}>
                      {question.question_type === 'mcq' 
                        ? (lang === 'ar' ? 'اختيار من متعدد' : 'MCQ')
                        : question.question_type === 'true_false'
                        ? (lang === 'ar' ? 'صح / خطأ' : 'True/False')
                        : (lang === 'ar' ? 'مقالي' : 'Essay')}
                    </span>

                    {/* Mark */}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                      📝 {question.mark} {lang === 'ar' ? 'درجة' : 'marks'}
                    </span>
                  </div>

                  {/* Question Text */}
                  <p className="text-sm font-medium mt-1.5 line-clamp-2">
                    {question.question}
                  </p>

                  {/* Options for MCQ */}
                  {question.question_type === 'mcq' && question.options && (
                    <div className="mt-2 space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="w-4 text-center font-medium">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className={option === question.correct_answer ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                            {option}
                            {option === question.correct_answer && (
                              <CheckCircle className="h-3 w-3 text-green-500 inline ml-1" />
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* True/False */}
                  {question.question_type === 'true_false' && (
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">
                        {lang === 'ar' ? 'الإجابة الصحيحة:' : 'Correct Answer:'}
                      </span>
                      <span className={question.correct_answer === 'true' 
                        ? 'text-green-600 dark:text-green-400 font-medium' 
                        : 'text-red-600 dark:text-red-400 font-medium'
                      }>
                        {question.correct_answer === 'true' 
                          ? (lang === 'ar' ? '✅ صح' : '✅ True')
                          : (lang === 'ar' ? '❌ خطأ' : '❌ False')}
                      </span>
                    </div>
                  )}

                  {/* Essay */}
                  {question.question_type === 'essay' && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="italic">
                        {lang === 'ar' ? '✍️ سؤال مقالي - إجابة مفتوحة' : '✍️ Essay question - open answer'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!disabled && (
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(question, index)}
                      className="rounded-xl h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(index)}
                      className="rounded-xl h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Summary */}
      <div className="mt-4 p-3 rounded-xl bg-muted/30 text-sm text-muted-foreground">
        {lang === 'ar' 
          ? `إجمالي ${questions.length} سؤال • مجموع الدرجات: ${questions.reduce((sum, q) => sum + (q.mark || 0), 0)}`
          : `Total ${questions.length} questions • Total marks: ${questions.reduce((sum, q) => sum + (q.mark || 0), 0)}`}
      </div>
    </div>
  );
};