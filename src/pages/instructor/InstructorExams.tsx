// src/pages/instructor/InstructorExams.tsx
import { useTeacherMeta } from '@/hooks/useTeacherMeta'; // عدّل المسار حسب مشروعك

import { Variants } from "framer-motion";
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { examService } from '@/services/exam.service';
import { PageHeader } from '@/components/lms/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuestionCard } from '@/components/exams/QuestionCard';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Plus, Trash2, Save, Clock, FileText, HelpCircle, X, CheckCircle,
  Sparkles, GraduationCap, Trophy, Zap, Award,
  ChevronRight, ChevronLeft, Loader2, AlertCircle, Timer, Search,
  XCircle, Shuffle, ListOrdered, Eye, Power, Settings2,
  ChevronDown, ChevronUp, Filter, X as XIcon, BookOpen, Calendar,
  DollarSign, TrendingUp, Star, Users, Grid3x3, List, RefreshCw,
  PowerOff
} from 'lucide-react';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import FileUploader from '@/components/FileUploader';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import { Exam } from "@/types/teacherProfile.types";
import { useSearchParams } from 'react-router-dom';

// ✅ Types
interface QuestionBuilder {
  id: string;
  question_type: 'true_false' | 'multiple_choice' | 'essay';
  question: string;
  mark: number;
  correct_answer?: string;
  options?: { option_text: string; is_correct: boolean }[];
  image?: number | null;
}

// ✅ Filter State Interface
interface ExamFilters {
  stageId: number | null;
  subjectId: number | null;
  semesterId: number | null;
  active: boolean | null;
  marksMin: number | null;
  marksMax: number | null;
}

// ✅ Animations
export const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
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

const statsCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400 } },
  hover: { scale: 1.03, y: -3, transition: { type: "spring", stiffness: 400 } },
};

// ✅ Exam Result Card Component
const ExamResultCard: React.FC<{ result: any; exam: any; onClose: () => void }> = ({ result, exam, onClose }) => {
  const { t, lang } = useApp();
  const isPassed = result.score >= (exam.total_marks_pass_marks || exam.total_marks / 2);
  const percentage = (result.score / exam.total_marks) * 100;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <Card className={`relative overflow-hidden border-4 ${isPassed
          ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 border-green-400'
          : 'bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950/30 dark:to-orange-950/30 border-red-400'
          }`}>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <CardContent className="p-8 text-center relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
              {isPassed ? (
                <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
              ) : (
                <Trophy className="h-20 w-20 text-orange-500 mx-auto mb-4" />
              )}
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">
              {isPassed ? (lang === 'ar' ? '🎉 مبروك! 🎉' : '🎉 Congratulations! 🎉') : (lang === 'ar' ? '💪 استمر في التدريب! 💪' : '💪 Keep Practicing! 💪')}
            </h3>
            <div className="flex justify-center items-center gap-4 my-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="text-center">
                <p className="text-5xl font-bold text-primary">{result.score}</p>
                <p className="text-sm text-muted-foreground">{t('yourScore')}</p>
              </motion.div>
              <div className="text-3xl font-bold text-muted-foreground">/</div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }} className="text-center">
                <p className="text-5xl font-bold">{exam.total_marks}</p>
                <p className="text-sm text-muted-foreground">{t('totalMarks')}</p>
              </motion.div>
            </div>
            <div className="max-w-md mx-auto mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{t('score')}</span>
                <span>{percentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${isPassed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                />
              </div>
            </div>
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.4 }}>
              <Badge className={`gap-2 px-4 py-2 text-base ${isPassed
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-red-500 to-orange-500'
                }`}>
                {isPassed ? (lang === 'ar' ? 'نجاح' : 'Passed') : (lang === 'ar' ? 'رسب' : 'Failed')}
              </Badge>
            </motion.div>
            {exam.total_marks_pass_marks && (
              <p className="text-sm text-muted-foreground mt-4">
                {lang === 'ar' ? 'درجة النجاح' : 'Pass Marks'}: {exam.total_marks_pass_marks} / {exam.total_marks}
              </p>
            )}
            <motion.button
              whileHover={{ scale: 1.05, transition: { type: "spring" as const } }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-medium"
            >
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </motion.button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export const InstructorExams: React.FC = () => {
  const { t, lang, user } = useApp();
  const isRTL = lang === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ State
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('exams');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Filter State
  const [filters, setFilters] = useState<ExamFilters>({
    stageId: null,
    subjectId: null,
    semesterId: null,
    active: null,
    marksMin: null,
    marksMax: null,
  });

  // ✅ Form State
  const [showExamForm, setShowExamForm] = useState(false);
  const [imageId, setImageId] = useState<number | null>(null);
  const [examFormData, setExamFormData] = useState({
    title: '',
    description: '',
    total_marks: 0,
    total_marks_pass_marks: 0,
    duration_minutes: 0,
    course_detail_id: null as number | null,
    stage_id: null as number | null,
  });

  // ✅ Questions Builder State
  const [questions, setQuestions] = useState<(Omit<QuestionBuilder, 'image'> & { image?: string | number | null })[]>([]);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);

  // ✅ Taking Exam State
  const [takingExam, setTakingExam] = useState(false);
  const [currentExam, setCurrentExam] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [examStartedAt, setExamStartedAt] = useState<Date | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showingExam, setShowingExam] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const { stages } = useTeacherMeta(user?.id);
  // ✅ Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 12,
  });

  // ✅ Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ✅ Settings expanded state
  const [expandedSettings, setExpandedSettings] = useState<Record<number, boolean>>({});

  // ✅ Creating state
  const [isCreating, setIsCreating] = useState(false);

  // ✅ Saved Filters from localStorage
  const [savedFilters, setSavedFilters] = useState<ExamFilters | null>(null);

  // ✅ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ Load saved filters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('examFilters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFilters(parsed);
        setSavedFilters(parsed);
      } catch (e) {
        console.error('Error loading saved filters', e);
      }
    }
  }, []);

  // ✅ Sync filters with URL
  useEffect(() => {
    const urlFilters: ExamFilters = {
      stageId: searchParams.get('stage') ? Number(searchParams.get('stage')) : null,
      subjectId: searchParams.get('subject') ? Number(searchParams.get('subject')) : null,
      semesterId: searchParams.get('semester') ? Number(searchParams.get('semester')) : null,
      active: searchParams.get('active') === 'true' ? true : searchParams.get('active') === 'false' ? false : null,
      marksMin: searchParams.get('marksMin') ? Number(searchParams.get('marksMin')) : null,
      marksMax: searchParams.get('marksMax') ? Number(searchParams.get('marksMax')) : null,
    };

    if (urlFilters.stageId || urlFilters.subjectId || urlFilters.semesterId || urlFilters.active !== null) {
      setFilters(urlFilters);
    }
  }, [searchParams]);

  // ✅ Build API filters
  const buildApiFilters = useCallback(() => {
    const apiFilters: Record<string, any> = {
      teacher_id: user?.id || 1,
    };

    if (filters.stageId) apiFilters.stage_id = filters.stageId;
    if (filters.subjectId) apiFilters.subject_id = filters.subjectId;
    if (filters.semesterId) apiFilters.semester_id = filters.semesterId;
    if (filters.active !== null) apiFilters.active = filters.active ? 1 : 0;
    if (filters.marksMin) apiFilters.total_marks = filters.marksMin;

    return apiFilters;
  }, [filters, user?.id]);

  // ✅ Fetch Exams
  const fetchExams = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const apiFilters = buildApiFilters();
      const response = await examService.getAllExams(
        apiFilters,
        pagination.perPage,
        page,
        debouncedSearch
      );

      setExams(response.data || []);
      setPagination(prev => ({
        ...prev,
        currentPage: response.meta?.current_page || 1,
        lastPage: response.meta?.last_page || 1,
        total: response.meta?.total || 0,
        perPage: response.meta?.per_page || 12,
      }));
    } catch (err: any) {
      setError(err.message);
      toast.error(lang === 'ar' ? 'حدث خطأ في جلب الامتحانات' : 'Error fetching exams');
    } finally {
      setLoading(false);
    }
  }, [buildApiFilters, debouncedSearch, lang, pagination.perPage]);

  useEffect(() => {
    fetchExams(1);
  }, [fetchExams]);

  // ✅ Apply filters and reset to page 1
  const applyFilters = () => {
    // Save to localStorage
    localStorage.setItem('examFilters', JSON.stringify(filters));
    setSavedFilters(filters);

    // Update URL
    const newParams = new URLSearchParams();
    if (filters.stageId) newParams.set('stage', String(filters.stageId));
    if (filters.subjectId) newParams.set('subject', String(filters.subjectId));
    if (filters.semesterId) newParams.set('semester', String(filters.semesterId));
    if (filters.active !== null) newParams.set('active', String(filters.active));
    if (filters.marksMin) newParams.set('marksMin', String(filters.marksMin));
    if (filters.marksMax) newParams.set('marksMax', String(filters.marksMax));
    setSearchParams(newParams);

    setShowFilters(false);
    fetchExams(1);
  };

  // ✅ Clear all filters
  const clearFilters = () => {
    setFilters({
      stageId: null,
      subjectId: null,
      semesterId: null,
      active: null,
      marksMin: null,
      marksMax: null,
    });
    setSavedFilters(null);
    localStorage.removeItem('examFilters');
    setSearchParams({});
    fetchExams(1);
  };

  // ✅ Load saved filters
  const loadSavedFilters = () => {
    if (savedFilters) {
      setFilters(savedFilters);
      toast.success(lang === 'ar' ? 'تم تحميل الفلاتر المحفوظة' : 'Saved filters loaded');
    }
  };

  // ✅ Stats
  const stats = useMemo(() => ({
    total: pagination.total || 0,
    active: exams.filter(e => e.active === 1).length,
    inactive: exams.filter(e => e.active === 0).length,
    totalMarks: exams.reduce((sum, e) => sum + (e.total_marks || 0), 0),
    avgMarks: exams.length > 0 ? Math.round(exams.reduce((sum, e) => sum + (e.total_marks || 0), 0) / exams.length) : 0,
  }), [exams, pagination.total]);

  // ✅ Handlers
  const showExam = (exam: Exam) => {
    setTakingExam(false);
    setSelectedExamId(null);
    setCurrentExam(exam);
    setTimeout(() => setShowingExam(true), 50);
  };

  const handleImageUpload = (id: number) => {
    setImageId(id);
    toast.success(lang === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
  };

  const handleRemoveImage = () => {
    setImageId(null);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question_type: 'multiple_choice',
        question: '',
        mark: 1,
        image: '',
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

  const updateQuestion = (id: string, updates: Partial<QuestionBuilder>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const saveQuestions = async () => {
    if (!selectedExamId) return;
    if (questions.length === 0) {
      toast.error("Please add questions first");
      return;
    }

    setSavingQuestions(true);
    try {
      await examService.addQuestions(selectedExamId, questions);
      toast.success(lang === 'ar' ? 'تم حفظ الأسئلة بنجاح' : 'Questions saved successfully');
      setQuestions([]);
      setSelectedExamId(null);
      setActiveTab('exams');
      fetchExams();
    } catch (err) {
      console.error(err);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء حفظ الأسئلة' : 'Error saving questions');
    } finally {
      setSavingQuestions(false);
    }
  };

  const toggleRandomQuestions = async (examId: number, currentValue: boolean) => {
    try {
      await examService.toggleRandomQuestions(examId);
      setExams(prev => prev.map(e => e.id === examId ? { ...e, random_questions: !currentValue } : e));
      toast.success(lang === 'ar' ? 'تم تغيير ترتيب الأسئلة' : 'Random questions toggled');
    } catch (error) {
      console.error('Error toggling random questions:', error);
    }
  };

  const toggleRandomAnswers = async (examId: number, currentValue: boolean) => {
    try {
      await examService.toggleRandomAnswers(examId);
      setExams(prev => prev.map(e => e.id === examId ? { ...e, random_answers: !currentValue } : e));
      toast.success(lang === 'ar' ? 'تم تغيير ترتيب الإجابات' : 'Random answers toggled');
    } catch (error) {
      console.error('Error toggling random answers:', error);
    }
  };

  const toggleShowResult = async (examId: number, currentValue: boolean) => {
    try {
      await examService.toggleShowResult(examId);
      setExams(prev => prev.map(e => e.id === examId ? { ...e, show_result: !currentValue } : e));
      toast.success(lang === 'ar' ? 'تم تغيير إظهار النتيجة' : 'Show result toggled');
    } catch (error) {
      console.error('Error toggling show result:', error);
    }
  };

  const toggleSettings = (examId: number) => {
    setExpandedSettings(prev => ({ ...prev, [examId]: !prev[examId] }));
  };

  const deleteExam = async (id: number) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الامتحان؟' : 'Are you sure you want to delete this exam?')) {
      try {
        await examService.deleteExam(id);
        toast.success(lang === 'ar' ? 'تم حذف الامتحان بنجاح' : 'Exam deleted successfully');
        fetchExams();
      } catch (error) {
        toast.error(lang === 'ar' ? 'حدث خطأ في حذف الامتحان' : 'Error deleting exam');
      }
    }
  };

  const createExamHandler = async () => {
    if (isCreating) return;

    if (!examFormData.title) {
      toast.error(lang === 'ar' ? 'يرجى إدخال عنوان الامتحان' : 'Please enter exam title');
      return;
    }
    if (!examFormData.stage_id) {
      toast.error(lang === 'ar' ? 'يرجى اختيار المرحلة' : 'Please select stage');
      return;
    }
    if (!examFormData.course_detail_id) {
      toast.error(lang === 'ar' ? 'يرجى اختيار الدرس' : 'Please select lesson');
      return;
    }

    setIsCreating(true);
    try {
      const examData = {
        ...examFormData,
        teacher_id: user?.id || 1,
        image: imageId || undefined,
      };

      if (editingExamId) {
        await examService.updateExam(editingExamId, examData);
        toast.success(lang === 'ar' ? 'تم تحديث الامتحان بنجاح' : 'Exam updated successfully');
        resetExamForm();
        setShowExamForm(false);
        fetchExams();
      } else {
        const newExam = await examService.createExam({ ...examData, type: 'exam' });
        if (newExam && newExam.id) {
          setSelectedExamId(newExam.id);
          setShowExamForm(false);
          setActiveTab('exams');
          toast.success(lang === 'ar' ? 'تم إنشاء الامتحان بنجاح' : 'Exam created successfully');
          resetExamForm();
          fetchExams();
        } else {
          console.error("❌ Exam creation returned invalid data:", newExam);
          toast.error(lang === 'ar' ? 'حدث خطأ في إنشاء الامتحان' : 'Error creating exam');
        }
      }
    } catch (error) {
      console.error("❌ Error saving exam:", error);
      toast.error(lang === 'ar' ? 'حدث خطأ في حفظ الامتحان' : 'Error saving exam');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (exam: any) => {
    setEditingExamId(exam.id);
    const stageId = exam.stage_id?.id ?? exam.stage_id ?? null;
    const courseDetailId = exam.course_detail_id?.id ?? exam.course_detail_id ?? null;
    const imageIdResolved = exam.image?.id ?? exam.image_id ?? exam.image ?? null;

    setExamFormData({
      title: exam.title || '',
      description: exam.description || '',
      total_marks: Number(exam.total_marks) || 0,
      total_marks_pass_marks: Number(exam.total_must_pass_marks || exam.total_marks_pass_marks) || 0,
      duration_minutes: Number(exam.duration_minutes) || 0,
      course_detail_id: courseDetailId,
      stage_id: stageId,
    });
    setImageId(imageIdResolved ? Number(imageIdResolved) : null);
    setShowExamForm(true);
  };

  const resetExamForm = () => {
    setExamFormData({
      title: '',
      description: '',
      total_marks: 0,
      total_marks_pass_marks: 0,
      duration_minutes: 0,
      course_detail_id: null,
      stage_id: null,
    });
    setImageId(null);
    setEditingExamId(null);
    setSelectedExamId(null);
  };

  const handleCreateNewExam = () => {
    resetExamForm();
    setShowExamForm(true);
    setEditingExamId(null);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchExams(page);
    }
  };

  // ✅ Render Components (Forms, Question Builder, Exam View, Result Modal)
  if (showExamForm) {
    return (
      <motion.div
        initial={{ opacity: 0, x: isRTL ? -100 : 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isRTL ? 100 : -100 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="max-w-5xl mx-auto px-4 py-6"
      >
        <div className="flex items-center justify-between mb-8">
          <motion.div whileHover={{ x: isRTL ? 5 : -5 }} whileTap={{ scale: 0.96 }}>
            <Button variant="outline" onClick={() => setShowExamForm(false)} className="rounded-2xl gap-2 shadow-sm">
              <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              {t('back')}
            </Button>
          </motion.div>
          <div className="text-end">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {editingExamId ? (lang === 'ar' ? 'تعديل امتحان' : 'Edit Exam') : t('createNewExam')}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {lang === 'ar' ? 'أنشئ امتحان احترافي للطلاب' : 'Create a professional exam for students'}
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        >
          <Card className="overflow-hidden border-none shadow-2xl rounded-3xl bg-background/80 backdrop-blur-xl">
            <div className="relative h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
            <motion.div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 10, repeat: Infinity }} />
            <motion.div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }} transition={{ duration: 12, repeat: Infinity }} />

            <CardHeader className="relative z-10 pb-2">
              <div className="flex items-center gap-4">
                <motion.div initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl font-bold">{lang === 'ar' ? 'بيانات الامتحان' : 'Exam Information'}</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">{lang === 'ar' ? 'أدخل جميع البيانات المطلوبة' : 'Fill all required exam information'}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-8 pt-6">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-dashed p-5 bg-muted/30">
                <Label className="mb-3 block text-sm font-semibold">{lang === 'ar' ? 'صورة الامتحان' : 'Exam Image'}</Label>
                <FileUploader
                  label={lang === 'ar' ? 'ارفع صورة الامتحان' : 'Upload Exam Image'}
                  onUploadSuccess={handleImageUpload}
                  onRemoveImage={handleRemoveImage}
                  multiple={false}
                  accept="image/*"
                  preview
                  uniqueId="exam-image-upload"
                  maxFiles={1}
                  defaultImageId={imageId}
                  defaultImageUrl={editingExamId ? exams.find((e: any) => e.id === editingExamId)?.image?.fullUrl || null : null}
                />
              </motion.div>

              <div className="grid grid-cols-1 gap-6">
                <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
                  <Label>{t('title')}</Label>
                  <Input value={examFormData.title} onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })} placeholder="e.g. Midterm Exam" className="rounded-2xl h-12 w-full" />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                  <Label>{t('description')}</Label>
                  <Textarea value={examFormData.description} onChange={(e) => setExamFormData({ ...examFormData, description: e.target.value })} rows={5} placeholder="Exam Description..." className="rounded-2xl resize-none w-full" />
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card className="rounded-2xl border shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <Label>{t('totalMarks')}</Label>
                    <Input type="number" value={examFormData.total_marks} onChange={(e) => setExamFormData({ ...examFormData, total_marks: parseInt(e.target.value) || 0 })} className="rounded-xl" />
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <Label>{t('durationMinutes')}</Label>
                    <Input type="number" value={examFormData.duration_minutes} onChange={(e) => setExamFormData({ ...examFormData, duration_minutes: parseInt(e.target.value) || 0 })} className="rounded-xl" />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('stage')}</Label>

                  <select
                    value={examFormData.stage_id || ''}
                    onChange={(e) =>
                      setExamFormData({
                        ...examFormData,
                        stage_id: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border bg-background"
                  >
                    <option value="">
                      {lang === 'ar' ? 'اختر المرحلة' : 'Select Stage'}
                    </option>

                    {stages?.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t('lesson')}</Label>
                  <AsyncSelect configKey="lessons" value={examFormData.course_detail_id} onChange={(id) => setExamFormData({ ...examFormData, course_detail_id: id })} placeholder={lang === 'ar' ? 'اختر الدرس' : 'Select Lesson'} required extraFilters={{ course_id: 1 }} />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="pt-4">
                <Button className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:scale-[1.01] transition-all shadow-xl" onClick={createExamHandler} disabled={isCreating}>
                  {isCreating ? (
                    <><Loader2 className="h-5 w-5 animate-spin me-2" />{lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</>
                  ) : editingExamId ? (
                    <><Save className="h-5 w-5 me-2" />{lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}</>
                  ) : (
                    <><Sparkles className="h-5 w-5 me-2" />{t('createAndAddQuestions')}</>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  if (activeTab === 'questions') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <motion.div whileHover={{ x: -5 }}>
            <Button variant="ghost" onClick={() => setActiveTab('exams')} className="gap-2">
              <motion.span animate={{ x: [-3, 0, -3] }} transition={{ repeat: Infinity, duration: 1.5 }}>←</motion.span>
              {t('backToExams')}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={saveQuestions} disabled={savingQuestions} className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg">
              {savingQuestions ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t('saveQuestions')}
            </Button>
          </motion.div>
        </div>

        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-between items-center">
          <div>
            <motion.h2 initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('questionBuilder')}
            </motion.h2>
            <motion.p className="text-muted-foreground text-sm">
              {questions.length} {t('questions')} • Total Marks: {questions.reduce((sum, q) => sum + q.mark, 0)}
            </motion.p>
          </div>
          <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} animate={{ rotate: [0, 360] }} transition={{ duration: 0.5, delay: 0.5 }}>
            <Button onClick={addQuestion} className="gap-2 rounded-full shadow-lg">
              <Plus className="h-4 w-4" />
              {t('addQuestion')}
            </Button>
          </motion.div>
        </motion.div>

        <LayoutGroup>
          <AnimatePresence mode="popLayout">
            {questions.length === 0 && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 400 }}>
                <Card className="p-16 text-center">
                  <motion.div animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  </motion.div>
                  <p className="text-muted-foreground mb-4">{t('noQuestionsYet')}</p>
                  <Button variant="link" onClick={addQuestion} className="mt-2">{t('addYourFirstQuestion')}</Button>
                </Card>
              </motion.div>
            )}
            {questions.map((q, idx) => (
              <motion.div key={q.id} layout initial={{ opacity: 0, x: -50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.9 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} whileHover={{ scale: 1.02, y: -5 }}>
                <Card className="p-6 border-2 hover:border-primary/50 transition-all shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </motion.span>
                      <motion.select whileHover={{ scale: 1.05 }} value={q.question_type} onChange={(e) => updateQuestion(q.id, { question_type: e.target.value as any })} className="text-sm border rounded-lg px-3 py-2 bg-background">
                        <option value="multiple_choice">📝 {t('multipleChoice')}</option>
                        <option value="true_false">✓✗ {t('trueFalse')}</option>
                        <option value="essay">📄 {t('essay')}</option>
                      </motion.select>
                    </div>
                    <motion.button whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                  <div className="space-y-4">
                    <Input value={q.question} onChange={(e) => updateQuestion(q.id, { question: e.target.value })} placeholder={t('enterQuestion')} className="rounded-xl text-base focus:ring-2 focus:ring-primary" />
                    <div className="space-y-2">
                      <Label>{lang === 'ar' ? 'صورة السؤال (اختياري)' : 'Question Image (Optional)'}</Label>
                      <FileUploader label={lang === 'ar' ? 'رفع صورة للسؤال' : 'Upload question image'} onUploadSuccess={(id) => updateQuestion(q.id, { image: id })} onRemoveImage={() => updateQuestion(q.id, { image: null })} multiple={false} accept="image/*" preview={true} uniqueId={`question-image-${q.id}`} maxFiles={1} />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label>{t('marks')}</Label>
                        <Input type="number" value={q.mark} onChange={(e) => updateQuestion(q.id, { mark: parseInt(e.target.value) || 0 })} className="w-24 rounded-xl" />
                      </div>
                    </div>
                    {q.question_type === 'true_false' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex gap-6 p-4 bg-muted/30 rounded-xl">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name={`tf-${q.id}`} checked={q.correct_answer === 'true'} onChange={() => updateQuestion(q.id, { correct_answer: 'true' })} className="w-4 h-4 accent-green-500" />
                          <span>✅ True</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name={`tf-${q.id}`} checked={q.correct_answer === 'false'} onChange={() => updateQuestion(q.id, { correct_answer: 'false' })} className="w-4 h-4 accent-red-500" />
                          <span>❌ False</span>
                        </label>
                      </motion.div>
                    )}
                    {q.question_type === 'multiple_choice' && q.options && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 p-4 bg-muted/30 rounded-xl">
                        {q.options.map((opt, optIdx) => (
                          <motion.div key={optIdx} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: optIdx * 0.1 }} className="flex items-center gap-3">
                            <input type="radio" name={`mc-${q.id}`} checked={opt.is_correct} onChange={() => { const newOptions = q.options!.map((o, i) => ({ ...o, is_correct: i === optIdx })); updateQuestion(q.id, { options: newOptions }); }} className="w-4 h-4 accent-primary" />
                            <Input value={opt.option_text} onChange={(e) => { const newOptions = [...q.options!]; newOptions[optIdx].option_text = e.target.value; updateQuestion(q.id, { options: newOptions }); }} placeholder={`${t('option')} ${optIdx + 1}`} className="flex-1 rounded-xl" />
                            {opt.is_correct && (<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 text-sm">✓ Correct</motion.span>)}
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

  if (showingExam && currentExam) {
    const questions = currentExam.questions || [];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-10 px-4">
        <div className="max-w-5xl mx-auto">
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
                        <h1 className="text-3xl font-black tracking-tight">{currentExam.title}</h1>
                        <Badge variant="secondary" className="rounded-xl px-3 py-1 text-xs bg-primary/10 text-primary border-primary/20">
                          <Eye className="h-3 w-3 mr-1" />
                          {lang === 'ar' ? 'وضع العرض' : 'Preview Mode'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">{currentExam.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="min-w-[110px] rounded-2xl border bg-muted/30 px-4 py-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">{lang === 'ar' ? 'الأسئلة' : 'Questions'}</div>
                      <div className="font-black text-xl">{questions.length}</div>
                    </div>
                    <div className="min-w-[110px] rounded-2xl border bg-muted/30 px-4 py-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">{lang === 'ar' ? 'الدرجة' : 'Marks'}</div>
                      <div className="font-black text-xl">{currentExam.total_marks}</div>
                    </div>
                    <div className="min-w-[110px] rounded-2xl border bg-muted/30 px-4 py-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">{lang === 'ar' ? 'الوقت' : 'Duration'}</div>
                      <div className="font-black text-xl">{currentExam.duration_minutes}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <div className="space-y-6">
            {questions.map((q: any, idx: number) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
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
                      <Badge variant="outline" className="rounded-xl px-3 py-1">{q.type || 'Question'}</Badge>
                    </div>
                    <QuestionCard question={q} index={idx} readOnly />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10">
            <Card className="rounded-3xl border bg-background/80 backdrop-blur shadow-lg">
              <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-lg">{lang === 'ar' ? 'معاينة الامتحان' : 'Exam Preview'}</h3>
                  <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'هذا العرض للمعاينة فقط ولا يمكن إرسال الإجابات' : 'This is a preview mode only. Answers cannot be submitted.'}</p>
                </div>
                <Button variant="outline" className="rounded-2xl" onClick={() => { setShowingExam(false); setCurrentExam(null); }}>
                  {lang === 'ar' ? 'الرجوع' : 'Back'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (showResult && result && currentExam) {
    return <ExamResultCard result={result} exam={currentExam} onClose={() => { setShowResult(false); setTakingExam(false); setCurrentExam(null); fetchExams(); }} />;
  }

  // ✅ Main Exams List with Advanced Filters
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* ✅ Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-xl opacity-60" />
                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('exams')}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Sparkles className="h-3 w-3" />
                  {pagination.total} {t('exams')} • {stats.totalMarks} {t('totalMarks')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-muted/50 rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 px-3 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-primary shadow-md' : 'hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('table')} className={`p-2 px-3 rounded-lg transition-all duration-300 ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 text-primary shadow-md' : 'hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Export Button */}
            <ExportExcelButton data={exams} fileName="exams-list" label={lang === 'ar' ? 'تصدير' : 'Export'} disabled={loading || exams.length === 0} />

            {/* Create Button */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCreateNewExam} className="px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
              <Plus className="h-4 w-4" />
              {t('createExam')}
            </motion.button>
          </div>
        </motion.div>

        {/* ✅ Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('totalExams'), value: stats.total, icon: FileText, color: 'from-blue-500 to-cyan-500', delay: 0 },
            { label: t('activeExams'), value: stats.active, icon: Eye, color: 'from-green-500 to-emerald-500', delay: 0.1 },
            { label: t('inactiveExams'), value: stats.inactive, icon: Power, color: 'from-orange-500 to-red-500', delay: 0.2 },
            { label: t('avgMarks'), value: stats.avgMarks, icon: TrendingUp, color: 'from-purple-500 to-pink-500', delay: 0.3 },
          ].map((stat, idx) => (
            <motion.div key={idx} variants={statsCardVariants} whileHover="hover" className="relative overflow-hidden rounded-xl bg-gradient-to-r p-4 shadow-lg" style={{ background: `linear-gradient(135deg, ${stat.color.split(' ')[1]}20, ${stat.color.split(' ')[3]}10)` }}>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: stat.delay, type: "spring" }} className="text-2xl font-bold mt-1">
                    {stat.value}
                  </motion.p>
                </div>
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            </motion.div>
          ))}
        </motion.div>

        {/* ✅ Search & Filters Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={lang === 'ar' ? 'بحث عن امتحان...' : 'Search exams...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? 'pr-9' : 'pl-9'} rounded-xl bg-white dark:bg-gray-800 h-11`}
              />
            </div>

            <div className="flex gap-2">
              {/* Filter Toggle Button */}
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-xl border transition-all duration-300 ${showFilters ? 'bg-primary text-white border-primary shadow-md' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary'}`}>
                <Filter className="h-4 w-4" />
              </motion.button>

              {/* Load Saved Filters Button */}
              {savedFilters && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={loadSavedFilters} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary transition-all">
                  <RefreshCw className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </div>

          {/* ✅ Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0, y: -20 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -20 }} className="overflow-hidden">
                <Card className="p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-xl rounded-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Stage Filter */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm font-medium">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        {t('stage') || 'المرحلة'}
                      </Label>
                      <select
                        value={filters.stageId || ''}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            stageId: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border bg-background"
                      >
                        <option value="">
                          {lang === 'ar' ? 'كل المراحل' : 'All Stages'}
                        </option>

                        {stages?.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {stage.name}
                          </option>
                        ))}
                      </select>
                    </div>






                    {/* Marks Range - Min */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm font-medium">
                        <DollarSign className="h-4 w-4 text-primary" />
                        {lang === 'ar' ? 'الدرجة من' : 'Marks From'}
                      </Label>
                      <Input
                        type="number"
                        value={filters.marksMin || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, marksMin: e.target.value ? Number(e.target.value) : null }))}
                        placeholder={lang === 'ar' ? '0' : '0'}
                        className="rounded-xl"
                      />
                    </div>


                  </div>

                  {/* Filter Actions */}
                  <div className="flex justify-end gap-3 mt-5 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                      <XIcon className="h-4 w-4" />
                      {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
                    </Button>
                    <Button size="sm" onClick={applyFilters} className="gap-2 bg-gradient-to-r from-primary to-secondary">
                      <Search className="h-4 w-4" />
                      {lang === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
                    </Button>
                  </div>

                  {/* Active Filters Display */}
                  {(filters.stageId || filters.subjectId || filters.semesterId || filters.active !== null || filters.marksMin || filters.marksMax) && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'الفلاتر النشطة:' : 'Active Filters:'}</span>
                      {filters.stageId && <Badge variant="secondary" className="gap-1 text-xs"><GraduationCap className="h-3 w-3" /> {t('stage')}</Badge>}
                      {filters.subjectId && <Badge variant="secondary" className="gap-1 text-xs"><BookOpen className="h-3 w-3" /> {t('subject')}</Badge>}
                      {filters.semesterId && <Badge variant="secondary" className="gap-1 text-xs"><Calendar className="h-3 w-3" /> {t('semester')}</Badge>}
                      {filters.active !== null && <Badge variant="secondary" className="gap-1 text-xs"><Power className="h-3 w-3" /> {filters.active ? t('active') : t('inactive')}</Badge>}
                      {(filters.marksMin || filters.marksMax) && <Badge variant="secondary" className="gap-1 text-xs"><DollarSign className="h-3 w-3" /> {filters.marksMin || 0} - {filters.marksMax || '∞'}</Badge>}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ✅ Loading & Error & Empty States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground mt-4">{t('loadingExams')}</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && exams.length === 0 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-primary/40" />
            </div>
            <p className="text-muted-foreground mb-4 text-lg">{t('noExamsFound')}</p>
            <Button onClick={handleCreateNewExam} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              {t('createYourFirstExam')}
            </Button>
          </motion.div>
        )}

        {/* ✅ Grid View */}
        {!loading && !error && exams.length > 0 && viewMode === 'grid' && (
          <>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {exams.map((exam, idx) => (
                <motion.div key={exam.id} variants={itemVariants} custom={idx}>
                  <Card className="group relative overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-2xl">
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0" initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.6 }} />

                    <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                      {exam.image?.fullUrl ? (
                        <img src={exam.image.fullUrl} alt={exam.title} className="w-full h-full object-cover" />
                      ) : (
                        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                          <FileText className="h-12 w-12 text-primary/50" />
                        </motion.div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant={exam.active === 1 ? "default" : "secondary"} className="gap-1">
                          {exam.active === 1 ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {exam.active === 1 ? t('active') : t('inactive')}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex-1">
                        <motion.h3 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="font-bold text-xl line-clamp-1">
                          {isRTL && exam.title_ar ? exam.title_ar : exam.title}
                        </motion.h3>
                        <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {isRTL && exam.description_ar ? exam.description_ar : exam.description}
                        </motion.p>
                      </div>

                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-4 mt-4 text-sm">
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
                        {exam.total_marks_pass_marks && (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold text-yellow-600">{exam.total_marks_pass_marks}</span>
                          </div>
                        )}
                      </motion.div>

                      {/* Settings Toggle */}
                      <div className="mt-3 border-t pt-3">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => toggleSettings(exam.id)} className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors">
                          <div className="flex items-center gap-1">
                            <Settings2 className="h-3 w-3" />
                            <span>{lang === 'ar' ? 'إعدادات الامتحان' : 'Exam Settings'}</span>
                          </div>
                          {expandedSettings[exam.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </motion.button>

                        <AnimatePresence>
                          {expandedSettings[exam.id] && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="mt-3 space-y-2">
                              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-2"><Shuffle className="h-3.5 w-3.5 text-primary" /><span className="text-xs font-medium">{lang === 'ar' ? 'ترتيب عشوائي للأسئلة' : 'Random Questions'}</span></div>
                                <Switch checked={exam.random_questions || false} onCheckedChange={() => toggleRandomQuestions(exam.id, exam.random_questions)} className="data-[state=checked]:bg-primary scale-75" />
                              </div>
                              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-2"><ListOrdered className="h-3.5 w-3.5 text-primary" /><span className="text-xs font-medium">{lang === 'ar' ? 'ترتيب عشوائي للإجابات' : 'Random Answers'}</span></div>
                                <Switch checked={exam.random_answers || false} onCheckedChange={() => toggleRandomAnswers(exam.id, exam.random_answers)} className="data-[state=checked]:bg-primary scale-75" />
                              </div>
                              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-2"><Eye className="h-3.5 w-3.5 text-primary" /><span className="text-xs font-medium">{lang === 'ar' ? 'إظهار النتيجة للطلاب' : 'Show Result'}</span></div>
                                <Switch checked={exam.show_result || false} onCheckedChange={() => toggleShowResult(exam.id, exam.show_result)} className="data-[state=checked]:bg-primary scale-75" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-col gap-2 mt-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 gap-1 rounded-lg" onClick={() => { setSelectedExamId(exam.id); setActiveTab('questions'); }}>
                            <Plus className="h-3 w-3" /> {t('addQuestions')}
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 gap-1 rounded-lg" onClick={() => handleEditClick(exam)}>
                            <Settings2 className="h-3 w-3" /> {lang === 'ar' ? 'تعديل' : 'Edit'}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 gap-2 rounded-lg border-primary/30 bg-primary/5 hover:bg-primary/10" onClick={() => showExam(exam)}>
                            <Eye className="h-3 w-3" /> {lang === 'ar' ? 'عرض' : 'View'}
                          </Button>
                          <Button variant="destructive" size="sm" className="rounded-lg px-3" onClick={() => deleteExam(exam.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.total > pagination.perPage && (
              <div className="flex items-center justify-center gap-3 pt-8 pb-4">
                <Button variant="outline" size="icon" className="rounded-full w-10 h-10" onClick={() => goToPage(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>
                  <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                    let pageNum = pagination.currentPage;
                    if (pagination.lastPage <= 5) pageNum = i + 1;
                    else if (pagination.currentPage <= 3) pageNum = i + 1;
                    else if (pagination.currentPage >= pagination.lastPage - 2) pageNum = pagination.lastPage - 4 + i;
                    else pageNum = pagination.currentPage - 2 + i;
                    return (
                      <Button key={pageNum} variant={pagination.currentPage === pageNum ? 'default' : 'outline'} size="icon" className="rounded-full w-10 h-10" onClick={() => goToPage(pageNum)}>
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button variant="outline" size="icon" className="rounded-full w-10 h-10" onClick={() => goToPage(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.lastPage}>
                  <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            )}
          </>
        )}

        {/* ✅ Table View */}
        {!loading && !error && exams.length > 0 && viewMode === 'table' && (
          <Card className="rounded-2xl overflow-hidden shadow-xl border-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50">
                  <tr>
                    <th className="px-5 py-4 text-right text-sm font-semibold">{t('exam')}</th>
                    <th className="px-5 py-4 text-center text-sm font-semibold hidden md:table-cell">{t('marks')}</th>
                    <th className="px-5 py-4 text-center text-sm font-semibold">{t('duration')}</th>
                    <th className="px-5 py-4 text-center text-sm font-semibold">{t('status')}</th>
                    <th className="px-5 py-4 text-center text-sm font-semibold">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {exams.map((exam, idx) => (
                    <motion.tr key={exam.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 overflow-hidden shrink-0 flex items-center justify-center">
                            {exam.image?.fullUrl ? <img src={exam.image.fullUrl} alt="" className="w-full h-full object-cover" /> : <FileText className="h-6 w-6 text-primary" />}
                          </div>
                          <div>
                            <p className="font-semibold line-clamp-1">{isRTL ? exam.title_ar : exam.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{isRTL ? exam.description_ar : exam.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center"><span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full text-sm">{exam.total_marks}</span></td>
                      <td className="px-5 py-4 text-center"><div className="flex items-center justify-center gap-1"><Clock className="h-4 w-4 text-primary" /><span>{exam.duration_minutes} min</span></div></td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${exam.active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {exam.active === 1 ? <Zap className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                          {exam.active === 1 ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => showExam(exam)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-yellow-100" onClick={() => handleEditClick(exam)}><Settings2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-100" onClick={() => deleteExam(exam.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.total > pagination.perPage && (
              <div className="flex items-center justify-center gap-3 py-4 border-t">
                <Button variant="outline" size="icon" className="rounded-full" onClick={() => goToPage(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">{pagination.currentPage} / {pagination.lastPage}</span>
                <Button variant="outline" size="icon" className="rounded-full" onClick={() => goToPage(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.lastPage}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </motion.div>
  );
};