/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/exams/QuestionBuilder.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { examService } from '@/services/exam.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FileUploader from '@/components/FileUploader';
import { Loader2, Plus, Trash2, Save, HelpCircle, CheckCircle, List, FileText, ChevronLeft, X, Maximize2, Minimize2, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const { t, lang } = useApp();
  const isRTL = lang === 'ar';
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ فرم السؤال الجديد
  const [questionForm, setQuestionForm] = useState<Question>({
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
  });

  // ✅ فتح Modal لإضافة سؤال جديد
  const openAddModal = () => {
    setQuestionForm({
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
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // ✅ فتح Modal لتعديل سؤال
  const openEditModal = (question: Question) => {
    setQuestionForm({ ...question });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // ✅ حفظ السؤال (إضافة أو تعديل)
  const saveQuestion = () => {
    if (!questionForm.question.trim()) {
      toast.error(lang === 'ar' ? 'يرجى إدخال نص السؤال' : 'Please enter question text');
      return;
    }

    if (questionForm.question_type === 'true_false' && !questionForm.correct_answer) {
      toast.error(lang === 'ar' ? 'يرجى اختيار الإجابة الصحيحة' : 'Please select correct answer');
      return;
    }

    if (questionForm.question_type === 'multiple_choice') {
      const hasCorrect = questionForm.options?.some(opt => opt.is_correct);
      if (!hasCorrect) {
        toast.error(lang === 'ar' ? 'يرجى تحديد إجابة صحيحة واحدة على الأقل' : 'Please select at least one correct answer');
        return;
      }
      const hasEmptyOption = questionForm.options?.some(opt => !opt.option_text.trim());
      if (hasEmptyOption) {
        toast.error(lang === 'ar' ? 'يرجى ملء جميع الخيارات' : 'Please fill all options');
        return;
      }
    }

    if (isEditing) {
      setQuestions(prev => prev.map(q => q.id === questionForm.id ? questionForm : q));
      toast.success(lang === 'ar' ? 'تم تعديل السؤال بنجاح' : 'Question updated successfully');
    } else {
      setQuestions(prev => [...prev, { ...questionForm, id: Date.now().toString() }]);
      toast.success(lang === 'ar' ? 'تم إضافة السؤال بنجاح' : 'Question added successfully');
    }

    setIsModalOpen(false);
    
    if (!isEditing) {
      setTimeout(() => {
        openAddModal();
      }, 300);
    }
  };

  // ✅ حذف سؤال
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast.success(lang === 'ar' ? 'تم حذف السؤال' : 'Question deleted');
  };

  // ✅ حفظ جميع الأسئلة في الامتحان
  const saveAllQuestions = async () => {
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

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'true_false': return lang === 'ar' ? 'صح/خطأ' : 'True/False';
      case 'multiple_choice': return lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice';
      case 'essay': return lang === 'ar' ? 'مقالي' : 'Essay';
      default: return type;
    }
  };

  const totalMarks = questions.reduce((sum, q) => sum + q.mark, 0);

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(questionForm.options || [])];
    newOptions[index].option_text = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const setCorrectOption = (index: number) => {
    const newOptions = questionForm.options?.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const addOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...(questionForm.options || []), { option_text: '', is_correct: false }],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = questionForm.options?.filter((_, i) => i !== index);
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const hasCorrectOption = questionForm.options?.some(opt => opt.is_correct) || false;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex w-full items-start justify-between gap-4 flex-nowrap min-w-0">
        <Button onClick={onCancel} variant="outline" className="flex items-center gap-2 px-4 py-2 rounded-xl">
          <ChevronLeft className="h-4 w-4" />
          {t('backToExams')}
        </Button>
        <Button onClick={saveAllQuestions} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t('saveQuestions')}
        </Button>
      </div>

      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('questionBuilder')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {questions.length} {t('questions')} • {lang === 'ar' ? 'إجمالي الدرجات' : 'Total Marks'}: {totalMarks}
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2 rounded-xl shadow-lg">
          <Plus className="h-4 w-4" />
          {t('addQuestion')}
        </Button>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card className="p-16 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-4">{t('noQuestionsYet')}</p>
          <Button variant="link" onClick={openAddModal}>{t('addYourFirstQuestion')}</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {questions.map((q, idx) => (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Card className="p-5 border-2 hover:border-primary/50 transition-all shadow-lg cursor-pointer hover:shadow-xl" onClick={() => openEditModal(q)}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </span>
                        <Badge variant="outline">{getQuestionTypeLabel(q.question_type)}</Badge>
                        <Badge variant="secondary" className="text-xs">🔖 {q.mark} {lang === 'ar' ? 'درجات' : 'marks'}</Badge>
                      </div>
                      <p className="font-medium">{q.question || (lang === 'ar' ? 'سؤال جديد' : 'New question')}</p>
                      {q.image && <p className="text-xs text-muted-foreground mt-1">📷 {lang === 'ar' ? 'يوجد صورة' : 'Has image'}</p>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestion(q.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ✅ Modal كبير الحجم */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl p-0">
          {/* Header with gradient */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b rounded-t-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
                {isEditing ? (
                  <><Edit3 className="h-6 w-6 text-primary" /> {lang === 'ar' ? 'تعديل السؤال' : 'Edit Question'}</>
                ) : (
                  <><Plus className="h-6 w-6 text-primary" /> {lang === 'ar' ? 'إضافة سؤال جديد' : 'Add New Question'}</>
                )}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* نوع السؤال - تصميم محسن */}
            <div>
              <Label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {lang === 'ar' ? 'نوع السؤال' : 'Question Type'}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'multiple_choice', label: lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice', icon: List, desc: lang === 'ar' ? 'اختر الإجابة من بين عدة خيارات' : 'Choose answer from options' },
                  { value: 'true_false', label: lang === 'ar' ? 'صح/خطأ' : 'True/False', icon: CheckCircle, desc: lang === 'ar' ? 'حدد صحة العبارة' : 'Determine if statement is true or false' },
                  { value: 'essay', label: lang === 'ar' ? 'مقالي' : 'Essay', icon: FileText, desc: lang === 'ar' ? 'إجابة كتابية مفتوحة' : 'Open written answer' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setQuestionForm({ ...questionForm, question_type: type.value as any })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      questionForm.question_type === type.value
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${questionForm.question_type === type.value ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <type.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* نص السؤال */}
            <div>
              <Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {lang === 'ar' ? 'نص السؤال' : 'Question Text'}
              </Label>
              <textarea
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                placeholder={lang === 'ar' ? 'أدخل نص السؤال هنا...' : 'Enter question text here...'}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                rows={3}
              />
            </div>

            {/* صورة السؤال */}
            <div>
              <Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {lang === 'ar' ? 'صورة السؤال (اختياري)' : 'Question Image (Optional)'}
              </Label>
              <FileUploader
                label={lang === 'ar' ? 'رفع صورة للسؤال' : 'Upload question image'}
                onUploadSuccess={(id) => setQuestionForm({ ...questionForm, image: id })}
                onRemoveImage={() => setQuestionForm({ ...questionForm, image: null })}
                multiple={false}
                accept="image/*"
                preview
                uniqueId={`question-image-${questionForm.id}`}
                maxFiles={1}
                defaultImageId={questionForm.image as number | undefined}
              />
            </div>

            {/* الدرجة */}
            <div>
              <Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {lang === 'ar' ? 'درجة السؤال' : 'Question Marks'}
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={questionForm.mark}
                  onChange={(e) => setQuestionForm({ ...questionForm, mark: parseFloat(e.target.value) || 0 })}
                  className="w-32 rounded-xl text-center text-lg font-semibold"
                  min="0.5"
                  step="0.5"
                />
                <span className="text-sm text-muted-foreground">{lang === 'ar' ? 'درجة' : 'marks'}</span>
              </div>
            </div>

            {/* True/False Options */}
            {questionForm.question_type === 'true_false' && (
              <div>
                <Label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {lang === 'ar' ? 'الإجابة الصحيحة' : 'Correct Answer'}
                </Label>
                <div className="flex gap-6 p-4 bg-muted/30 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition-all flex-1 justify-center">
                    <input
                      type="radio"
                      name="tf"
                      checked={questionForm.correct_answer === 'true'}
                      onChange={() => setQuestionForm({ ...questionForm, correct_answer: 'true' })}
                      className="w-4 h-4 accent-green-500"
                    />
                    <span className="text-lg">✅ {lang === 'ar' ? 'صحيح' : 'True'}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex-1 justify-center">
                    <input
                      type="radio"
                      name="tf"
                      checked={questionForm.correct_answer === 'false'}
                      onChange={() => setQuestionForm({ ...questionForm, correct_answer: 'false' })}
                      className="w-4 h-4 accent-red-500"
                    />
                    <span className="text-lg">❌ {lang === 'ar' ? 'خطأ' : 'False'}</span>
                  </label>
                </div>
              </div>
            )}

            {/* Multiple Choice Options */}
            {questionForm.question_type === 'multiple_choice' && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {lang === 'ar' ? 'الخيارات' : 'Options'}
                  </Label>
                  <Button type="button" size="sm" variant="outline" onClick={addOption} className="gap-1 rounded-xl">
                    <Plus className="h-3 w-3" /> {lang === 'ar' ? 'إضافة خيار' : 'Add Option'}
                  </Button>
                </div>
                <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
                  {questionForm.options?.map((opt, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="mc"
                          checked={opt.is_correct}
                          onChange={() => setCorrectOption(idx)}
                          className="w-4 h-4 accent-primary shrink-0"
                        />
                        <div className="flex-1">
                          <Input
                            value={opt.option_text}
                            onChange={(e) => updateOption(idx, e.target.value)}
                            placeholder={`${lang === 'ar' ? 'خيار' : 'Option'} ${idx + 1}`}
                            className="rounded-lg"
                          />
                        </div>
                        {questionForm.options!.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {opt.is_correct && (
                        <p className="text-xs text-green-600 mt-2 mr-7">
                          ✓ {lang === 'ar' ? 'هذا هو الخيار الصحيح' : 'This is the correct option'}
                        </p>
                      )}
                    </div>
                  ))}
                  {!hasCorrectOption && questionForm.options && questionForm.options.length > 0 && (
                    <p className="text-xs text-amber-600 mt-2 text-center">
                      ⚠️ {lang === 'ar' ? 'يرجى تحديد خيار صحيح واحد على الأقل' : 'Please select at least one correct option'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Essay placeholder */}
            {questionForm.question_type === 'essay' && (
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl text-center border border-amber-200 dark:border-amber-800">
                <FileText className="h-12 w-12 mx-auto text-amber-500 mb-3" />
                <p className="text-amber-700 dark:text-amber-400 font-medium">
                  {lang === 'ar' ? 'السؤال المقالي' : 'Essay Question'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar' ? 'سيتم تصحيح هذا السؤال يدوياً من قبل المعلم' : 'This question will be graded manually by the teacher'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-0 gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6">
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={saveQuestion} className="rounded-xl px-6 bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg transition-all">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? (lang === 'ar' ? 'تحديث السؤال' : 'Update Question') : (lang === 'ar' ? 'إضافة السؤال' : 'Add Question')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};