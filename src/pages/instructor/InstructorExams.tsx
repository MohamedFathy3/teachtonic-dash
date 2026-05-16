/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/InstructorExams.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { examService } from '@/services/exam.service';
import { PageHeader } from '@/components/lms/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuestionCard } from '@/components/exams/QuestionCard'; // ✅ أضف هذا الاستيراد
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, Save, Clock, FileText, HelpCircle, X, CheckCircle, Sparkles, GraduationCap, Trophy, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// ✅ Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

const cardHover = {
  scale: 1.02,
  transition: { type: "spring", stiffness: 400, damping: 10 },
};

const glowPulse = {
  scale: [1, 1.05, 1],
  boxShadow: [
    "0 0 0 0 rgba(99, 102, 241, 0.4)",
    "0 0 0 20px rgba(99, 102, 241, 0)",
    "0 0 0 0 rgba(99, 102, 241, 0)",
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: "loop" as const,
  },
};

// ✅ Types for question builder
interface QuestionBuilder {
  id: string;
  question_type: 'true_false' | 'multiple_choice' | 'essay';
  question: string;
  mark: number;
  correct_answer?: string;
  options?: { option_text: string; is_correct: boolean }[];
}

export const InstructorExams: React.FC = () => {
  const { t, lang } = useApp();
  const isRTL = lang === 'ar';
  
  // ✅ State
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('exams');
  
  // ✅ Form State
  const [showExamForm, setShowExamForm] = useState(false);
  const [examFormData, setExamFormData] = useState({
    title: '',
    description: '',
    total_marks: 0,
    duration_minutes: 0,
    course_detail_id: 1,
    stage_id: 1,
  });
  
  // ✅ Questions Builder State
  const [questions, setQuestions] = useState<QuestionBuilder[]>([]);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  
  // ✅ Taking Exam State
  const [takingExam, setTakingExam] = useState(false);
  const [currentExam, setCurrentExam] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // ✅ جلب الامتحانات
  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const response = await examService.getTeacherExams(1);
      setExams(response.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // ✅ إضافة سؤال جديد
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question_type: 'multiple_choice',
        question: '',
        mark: 1,
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ],
      },
    ]);
  };

  // ✅ حذف سؤال
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // ✅ تحديث سؤال
  const updateQuestion = (id: string, updates: Partial<QuestionBuilder>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  // ✅ حفظ الأسئلة
  const saveQuestions = async () => {
    if (!selectedExamId) return;
    
    setSavingQuestions(true);
    try {
      const formattedQuestions = questions.map(q => ({
        question_type: q.question_type,
        question: q.question,
        mark: q.mark,
        ...(q.question_type === 'true_false' && { correct_answer: q.correct_answer }),
        ...(q.question_type === 'multiple_choice' && { options: q.options }),
      }));
      
      await examService.addQuestions(selectedExamId, formattedQuestions);
      alert('✨ Questions saved successfully!');
      setQuestions([]);
      setSelectedExamId(null);
      setActiveTab('exams');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingQuestions(false);
    }
  };

  // ✅ بدء الامتحان
  const startExam = async (exam: any) => {
    const fullExam = await examService.getExam(exam.id);
    setCurrentExam(fullExam);
    setTakingExam(true);
    setAnswers({});
    setResult(null);
    setCurrentQuestionIndex(0);
  };

  // ✅ إرسال الإجابات
  const submitExam = async () => {
    setSubmitting(true);
    setTimeout(() => {
      setResult({ score: Math.floor(Math.random() * currentExam.total_marks) + 1, total: currentExam?.total_marks });
      setSubmitting(false);
    }, 1500);
  };

  // ✅ Create Exam Form with animation
  if (showExamForm) {
    return (
      <motion.div
        initial={{ opacity: 0, x: isRTL ? -100 : 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isRTL ? 100 : -100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <motion.div whileHover={{ x: -5 }}>
          <Button variant="ghost" onClick={() => setShowExamForm(false)} className="gap-2 group">
            <motion.span animate={{ x: [-3, 0, -3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              ←
            </motion.span>
            {t('back')}
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Card className="relative overflow-hidden border-2 shadow-xl">
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-2xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <CardHeader className="relative">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center mb-3"
              >
                <Sparkles className="h-6 w-6 text-white" />
              </motion.div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('createNewExam')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Label>{t('title')}</Label>
                <Input
                  value={examFormData.title}
                  onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })}
                  placeholder="e.g., Midterm Exam"
                  className="rounded-xl transition-all focus:ring-2 focus:ring-primary"
                />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Label>{t('description')}</Label>
                <Textarea
                  value={examFormData.description}
                  onChange={(e) => setExamFormData({ ...examFormData, description: e.target.value })}
                  placeholder="Exam description"
                  className="rounded-xl transition-all focus:ring-2 focus:ring-primary"
                />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <Label>{t('totalMarks')}</Label>
                  <Input
                    type="number"
                    value={examFormData.total_marks}
                    onChange={(e) => setExamFormData({ ...examFormData, total_marks: parseInt(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label>{t('durationMinutes')}</Label>
                  <Input
                    type="number"
                    value={examFormData.duration_minutes}
                    onChange={(e) => setExamFormData({ ...examFormData, duration_minutes: parseInt(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all" onClick={async () => {
                  const newExam = await examService.createExam({ ...examFormData, teacher_id: 1, type: 'exam' });
                  setSelectedExamId(newExam.id);
                  setShowExamForm(false);
                  setActiveTab('questions');
                }}>
                  <Sparkles className="h-4 w-4" />
                  {t('createAndAddQuestions')}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // ✅ Questions Builder with amazing animations
  if (activeTab === 'questions') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <motion.div whileHover={{ x: -5 }}>
            <Button variant="ghost" onClick={() => setActiveTab('exams')} className="gap-2">
              <motion.span animate={{ x: [-3, 0, -3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                ←
              </motion.span>
              {t('backToExams')}
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={saveQuestions} disabled={savingQuestions} className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg">
              {savingQuestions ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t('saveQuestions')}
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center"
        >
          <div>
            <motion.h2
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            >
              {t('questionBuilder')}
            </motion.h2>
            <motion.p className="text-muted-foreground text-sm">
              {questions.length} {t('questions')} • Total Marks: {questions.reduce((sum, q) => sum + q.mark, 0)}
            </motion.p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button onClick={addQuestion} className="gap-2 rounded-full shadow-lg">
              <Plus className="h-4 w-4" />
              {t('addQuestion')}
            </Button>
          </motion.div>
        </motion.div>

        <LayoutGroup>
          <AnimatePresence mode="popLayout">
            {questions.length === 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Card className="p-16 text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  </motion.div>
                  <p className="text-muted-foreground mb-4">{t('noQuestionsYet')}</p>
                  <Button variant="link" onClick={addQuestion} className="mt-2">
                    {t('addYourFirstQuestion')}
                  </Button>
                </Card>
              </motion.div>
            )}

            {questions.map((q, idx) => (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="p-6 border-2 hover:border-primary/50 transition-all shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center text-sm font-bold"
                      >
                        {idx + 1}
                      </motion.span>
                      <motion.select
                        whileHover={{ scale: 1.05 }}
                        value={q.question_type}
                        onChange={(e) => updateQuestion(q.id, { question_type: e.target.value as any })}
                        className="text-sm border rounded-lg px-3 py-2 bg-background"
                      >
                        <option value="multiple_choice">📝 {t('multipleChoice')}</option>
                        <option value="true_false">✓✗ {t('trueFalse')}</option>
                        <option value="essay">📄 {t('essay')}</option>
                      </motion.select>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeQuestion(q.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    <Input
                      value={q.question}
                      onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                      placeholder={t('enterQuestion')}
                      className="rounded-xl text-base focus:ring-2 focus:ring-primary"
                    />
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label>{t('marks')}</Label>
                        <Input
                          type="number"
                          value={q.mark}
                          onChange={(e) => updateQuestion(q.id, { mark: parseInt(e.target.value) })}
                          className="w-24 rounded-xl"
                        />
                      </div>
                    </div>

                    {q.question_type === 'true_false' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex gap-6 p-4 bg-muted/30 rounded-xl"
                      >
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
                      </motion.div>
                    )}

                    {q.question_type === 'multiple_choice' && q.options && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-3 p-4 bg-muted/30 rounded-xl"
                      >
                        {q.options.map((opt, optIdx) => (
                          <motion.div
                            key={optIdx}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: optIdx * 0.1 }}
                            className="flex items-center gap-3"
                          >
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
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-green-500 text-sm"
                              >
                                ✓ Correct
                              </motion.span>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </LayoutGroup>
      </motion.div>
    );
  }

  // ✅ Taking Exam with amazing animations
  if (takingExam && currentExam) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div className="flex justify-between items-center">
          <motion.div whileHover={{ x: -5 }}>
            <Button variant="ghost" onClick={() => setTakingExam(false)}>← {t('back')}</Button>
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Badge variant="outline" className="gap-2 px-3 py-1.5">
                <Clock className="h-3 w-3 animate-pulse" />
                {currentExam.duration_minutes} {t('minutes')}
              </Badge>
            </motion.div>
            <Badge variant="outline" className="gap-2 px-3 py-1.5">
              <Trophy className="h-3 w-3 text-yellow-500" />
              {currentExam.total_marks} {t('marks')}
            </Badge>
          </div>
        </div>

        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Card className="p-8 shadow-xl border-2">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block"
              >
                <GraduationCap className="h-12 w-12 text-primary mx-auto mb-3" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {currentExam.title}
              </h1>
              <p className="text-muted-foreground mt-2">{currentExam.description}</p>
            </motion.div>

            <div className="space-y-6">
              {currentExam.questions?.map((q: any, idx: number) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, type: "spring" }}
                >
                  <QuestionCard
                    question={q}
                    index={idx}
                    answer={answers[q.id]}
                    onAnswerChange={(ans) => setAnswers({ ...answers, [q.id]: ans })}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8"
            >
              <Button
                className="w-full gap-3 py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl transition-all"
                size="lg"
                onClick={submitExam}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                {t('submitExam')}
              </Button>
            </motion.div>
          </Card>
        </motion.div>

        {result && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            <Card className="p-8 text-center bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-2 border-yellow-200">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-4">{t('examSubmitted')}</h3>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600"
              >
                {result.score} / {result.total}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-muted-foreground"
              >
                {result.score >= result.total / 2 ? "🎉 Great job! 🎉" : "💪 Keep practicing! 💪"}
              </motion.p>
            </Card>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // ✅ Main Exams List with awesome animations
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={t('exams')}
          description={t('manageAndCreateExams')}
          actions={
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button onClick={() => setShowExamForm(true)} className="gap-2 shadow-lg rounded-full px-6">
                <Plus className="h-4 w-4" />
                {t('createExam')}
              </Button>
            </motion.div>
          }
        />
      </motion.div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 text-primary" />
          </motion.div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring" }}
        >
          <Alert variant="destructive" className="rounded-xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {!loading && !error && exams.length === 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
        >
          <Card className="p-16 text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            </motion.div>
            <p className="text-muted-foreground mb-4">{t('noExamsFound')}</p>
            <Button onClick={() => setShowExamForm(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              {t('createYourFirstExam')}
            </Button>
          </Card>
        </motion.div>
      )}

      <LayoutGroup>
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam, idx) => (
            <motion.div
              key={exam.id}
              variants={itemVariants}
              custom={idx}
              whileHover={cardHover}
              layout
            >
              <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 shadow-lg">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <motion.h3
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="font-bold text-xl line-clamp-1"
                      >
                        {exam.title}
                      </motion.h3>
                      <motion.p
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.05 }}
                        className="text-sm text-muted-foreground line-clamp-2 mt-1"
                      >
                        {exam.description}
                      </motion.p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Badge variant={exam.active === 1 ? "success" : "secondary"} className="gap-1">
                        {exam.active === 1 ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {exam.active === 1 ? t('active') : t('inactive')}
                      </Badge>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-6 mt-4 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{exam.total_marks}</span>
                      <span className="text-muted-foreground">marks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{exam.duration_minutes}</span>
                      <span className="text-muted-foreground">min</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex gap-3 mt-6"
                  >
                    <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1 rounded-lg"
                        onClick={() => {
                          setSelectedExamId(exam.id);
                          setActiveTab('questions');
                        }}
                      >
                        <Plus className="h-3 w-3" />
                        {t('addQuestions')}
                      </Button>
                    </motion.div>
                    <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        className="w-full gap-1 rounded-lg bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
                        onClick={() => startExam(exam)}
                      >
                        <Zap className="h-3 w-3" />
                        {t('takeExam')}
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </LayoutGroup>
    </motion.div>
  );
};