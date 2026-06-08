/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/exams/QuestionBuilder.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { examService } from '@/services/exam.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FileUploader from '@/components/FileUploader';
import { Loader2, Plus, Trash2, Save, HelpCircle, CheckCircle, List, FileText, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionBuilderProps {
  examId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Question {
  id: string;
  question_type: 'true_false' | 'multiple_choice' | 'essay';
  question: string;
  mark: number;
  correct_answer?: string;
  options?: { option_text: string; is_correct: boolean }[];
  image?: number | null;
}

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({ examId, onSuccess, onCancel }) => {
  const { t, lang, user } = useApp();
  const isRTL = lang === 'ar';
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question_type: 'multiple_choice',
        question: '',
        mark: 1,
        image: null,
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ],
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const saveQuestions = async () => {
    if (questions.length === 0) {
      toast.error(lang === 'ar' ? 'يرجى إضافة أسئلة أولاً' : 'Please add questions first');
      return;
    }

    setSaving(true);
    try {
      await examService.addQuestions(examId, questions);
      toast.success(lang === 'ar' ? 'تم حفظ الأسئلة بنجاح' : 'Questions saved successfully');
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء حفظ الأسئلة' : 'Error saving questions');
    } finally {
      setSaving(false);
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'true_false': return <CheckCircle className="h-3 w-3" />;
      case 'multiple_choice': return <List className="h-3 w-3" />;
      case 'essay': return <FileText className="h-3 w-3" />;
      default: return <HelpCircle className="h-3 w-3" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'true_false': return lang === 'ar' ? 'صح/خطأ' : 'True/False';
      case 'multiple_choice': return lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice';
      case 'essay': return lang === 'ar' ? 'مقالي' : 'Essay';
      default: return type;
    }
  };

  const totalMarks = questions.reduce((sum, q) => sum + q.mark, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex w-full items-start justify-between gap-4 flex-nowrap min-w-0">
        <Button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
          <ChevronLeft className="h-4 w-4" />
          {t('backToExams')}
        </Button>
        <Button onClick={saveQuestions} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t('saveQuestions')}
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('questionBuilder')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {questions.length} {t('questions')} • {lang === 'ar' ? 'إجمالي الدرجات' : 'Total Marks'}: {totalMarks}
          </p>
        </div>
        <Button onClick={addQuestion} className="gap-2 rounded-full shadow-lg">
          <Plus className="h-4 w-4" />
          {t('addQuestion')}
        </Button>
      </div>

      <LayoutGroup>
        <AnimatePresence mode="popLayout">
          {questions.length === 0 && (
            <Card className="p-16 text-center">
              <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">{t('noQuestionsYet')}</p>
              <Button variant="link" onClick={addQuestion}>{t('addYourFirstQuestion')}</Button>
            </Card>
          )}
          
          {questions.map((q, idx) => (
            <motion.div
              key={q.id}
              layout
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Card className="p-6 border-2 hover:border-primary/50 transition-all shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <select
                      value={q.question_type}
                      onChange={(e) => updateQuestion(q.id, { question_type: e.target.value as any })}
                      className="text-sm border rounded-lg px-3 py-2 bg-background"
                    >
                      <option value="multiple_choice">📝 {t('multipleChoice')}</option>
                      <option value="true_false">✓✗ {t('trueFalse')}</option>
                      <option value="essay">📄 {t('essay')}</option>
                    </select>
                  </div>
                  <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <Input
                    value={q.question}
                    onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                    placeholder={t('enterQuestion')}
                    className="rounded-xl text-base"
                  />
                  
                  <div className="space-y-2">
                    <Label>{lang === 'ar' ? 'صورة السؤال (اختياري)' : 'Question Image (Optional)'}</Label>
                    <FileUploader
                      label={lang === 'ar' ? 'رفع صورة للسؤال' : 'Upload question image'}
                      onUploadSuccess={(id) => updateQuestion(q.id, { image: id })}
                      onRemoveImage={() => updateQuestion(q.id, { image: null })}
                      multiple={false}
                      accept="image/*"
                      preview
                      uniqueId={`question-image-${q.id}`}
                      maxFiles={1}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label>{t('marks')}</Label>
                      <Input
                        type="number"
                        value={q.mark}
                        onChange={(e) => updateQuestion(q.id, { mark: parseInt(e.target.value) || 0 })}
                        className="w-24 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* True/False */}
                  {q.question_type === 'true_false' && (
                    <div className="flex gap-6 p-4 bg-muted/30 rounded-xl">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`tf-${q.id}`}
                          checked={q.correct_answer === 'true'}
                          onChange={() => updateQuestion(q.id, { correct_answer: 'true' })}
                          className="w-4 h-4 accent-green-500"
                        />
                        <span>✅ True</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`tf-${q.id}`}
                          checked={q.correct_answer === 'false'}
                          onChange={() => updateQuestion(q.id, { correct_answer: 'false' })}
                          className="w-4 h-4 accent-red-500"
                        />
                        <span>❌ False</span>
                      </label>
                    </div>
                  )}

                  {/* Multiple Choice */}
                  {q.question_type === 'multiple_choice' && q.options && (
                    <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`mc-${q.id}`}
                            checked={opt.is_correct}
                            onChange={() => {
                              const newOptions = q.options!.map((o, i) => ({ ...o, is_correct: i === optIdx }));
                              updateQuestion(q.id, { options: newOptions });
                            }}
                            className="w-4 h-4 accent-primary"
                          />
                          <Input
                            value={opt.option_text}
                            onChange={(e) => {
                              const newOptions = [...q.options!];
                              newOptions[optIdx].option_text = e.target.value;
                              updateQuestion(q.id, { options: newOptions });
                            }}
                            placeholder={`${t('option')} ${optIdx + 1}`}
                            className="flex-1 rounded-xl"
                          />
                          {opt.is_correct && (
                            <span className="text-green-500 text-sm">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </LayoutGroup>
    </motion.div>
  );
};