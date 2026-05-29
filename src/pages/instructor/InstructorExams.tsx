
import { Variants } from "framer-motion";
import React, { useState, useCallback, useEffect } from 'react';
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
  ChevronDown, ChevronUp
} from 'lucide-react';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import FileUploader from '@/components/FileUploader';

// ✅ Types for question builder
interface QuestionBuilder {
  id: string;
  question_type: 'true_false' | 'multiple_choice' | 'essay';
  question: string;
  mark: number;
  correct_answer?: string;
  options?: { option_text: string; is_correct: boolean }[];
  image?: number | null;
}

import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import { Exam } from "@/types/teacherProfile.types";


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

// ✅ Exam Timer Component


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
      <motion.div
        className="max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
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
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-center"
              >
                <p className="text-5xl font-bold text-primary">{result.score}</p>
                <p className="text-sm text-muted-foreground">{t('yourScore')}</p>
              </motion.div>

              <div className="text-3xl font-bold text-muted-foreground">/</div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="text-center"
              >
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
                  className={`h-full rounded-full ${isPassed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
                    }`}
                />
              </div>
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.4 }}
            >
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

  // ✅ State
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('exams');

  // ✅ Form State
  const [showExamForm, setShowExamForm] = useState(false);
  const [imageId, setImageId] = useState<number | null>(null);
  const [examFormData, setExamFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    total_marks: 0,
    total_marks_pass_marks: 0,
    duration_minutes: 0,
    course_detail_id: null as number | null,
    stage_id: null as number | null,
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
  const [examStartedAt, setExamStartedAt] = useState<Date | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showingExam, setShowingExam] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  // ✅ Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 12,
  });


  const showExam = (exam: Exam) => {
    setTakingExam(false); // مهم جدا
    setSelectedExamId(null);

    setCurrentExam(exam);

    setTimeout(() => {
      setShowingExam(true);
    }, 50);
  };


  // ✅ Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ✅ Settings expanded state
  const [expandedSettings, setExpandedSettings] = useState<Record<number, boolean>>({});

  // ✅ Creating state
  const [isCreating, setIsCreating] = useState(false);

  // ✅ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ جلب الامتحانات
  const fetchExams = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await examService.getAllExams(
        { teacher_id: user?.id || 1 },
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
  }, [user?.id, debouncedSearch, lang]);
  useEffect(() => {
    // fetchExams uses React state safely; only call inside effect
    void fetchExams();
  }, [fetchExams]);



  // ✅ معالج رفع الصورة
  const handleImageUpload = (id: number) => {
    setImageId(id);
    toast.success(lang === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
  };

  const handleRemoveImage = () => {
    setImageId(null);
  };

  // ✅ إضافة سؤال جديد
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

    if (questions.length === 0) {
      toast.error("Please add questions first");
      return;
    }

    setSavingQuestions(true);

    try {
      await examService.addQuestions(selectedExamId, questions);

      toast.success(
        lang === 'ar'
          ? 'تم حفظ الأسئلة بنجاح'
          : 'Questions saved successfully'
      );

      setQuestions([]);
      setSelectedExamId(null);
      setActiveTab('exams');

      fetchExams();
    } catch (err) {
      console.error(err);

      toast.error(
        lang === 'ar'
          ? 'حدث خطأ أثناء حفظ الأسئلة'
          : 'Error saving questions'
      );
    } finally {
      setSavingQuestions(false);
    }
  };
  // ✅ دوال تبديل الإعدادات
  const toggleRandomQuestions = async (examId: number, currentValue: boolean) => {
    try {
      await examService.toggleRandomQuestions(examId, !currentValue);
      setExams(prev => prev.map(e =>
        e.id === examId ? { ...e, random_questions: !currentValue } : e
      ));
      toast.success(lang === 'ar' ? 'تم تغيير ترتيب الأسئلة' : 'Random questions toggled');
    } catch (error) {
      console.error('Error toggling random questions:', error);
    }
  };

  const toggleRandomAnswers = async (examId: number, currentValue: boolean) => {
    try {
      await examService.toggleRandomAnswers(examId, !currentValue);
      setExams(prev => prev.map(e =>
        e.id === examId ? { ...e, random_answers: !currentValue } : e
      ));
      toast.success(lang === 'ar' ? 'تم تغيير ترتيب الإجابات' : 'Random answers toggled');
    } catch (error) {
      console.error('Error toggling random answers:', error);
    }
  };

  const toggleShowResult = async (examId: number, currentValue: boolean) => {
    try {
      await examService.toggleShowResult(examId, !currentValue);
      setExams(prev => prev.map(e =>
        e.id === examId ? { ...e, show_result: !currentValue } : e
      ));
      toast.success(lang === 'ar' ? 'تم تغيير إظهار النتيجة' : 'Show result toggled');
    } catch (error) {
      console.error('Error toggling show result:', error);
    }
  };



  const toggleSettings = (examId: number) => {
    setExpandedSettings(prev => ({
      ...prev,
      [examId]: !prev[examId]
    }));
  };


  // ✅ إنشاء امتحان جديد
  const createExamHandler = async () => {
    if (isCreating) return;

    // ✅ Validations (Keep your existing validation code here)
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
      // ✅ Check if Editing or Creating
      if (editingExamId) {
        // --- UPDATE LOGIC ---
        await examService.updateExam(editingExamId, {
          ...examFormData,
          teacher_id: user?.id || 1,
          image: imageId || undefined,
        });

        toast.success(lang === 'ar' ? 'تم تحديث الامتحان بنجاح' : 'Exam updated successfully');

        resetExamForm();
        setShowExamForm(false);
        fetchExams(); // Refresh list

      } else {
        // --- CREATE LOGIC (Your existing code) ---
        const newExam = await examService.createExam({
          ...examFormData,
          teacher_id: user?.id || 1,
          type: 'exam',
          image: imageId || undefined,
        });

        setSelectedExamId(newExam.id);
        setShowExamForm(false);
        setActiveTab('questions');
        toast.success(lang === 'ar' ? 'تم إنشاء الامتحان بنجاح' : 'Exam created successfully');

        resetExamForm();
        fetchExams();
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في حفظ الامتحان' : 'Error saving exam');
    } finally {
      setIsCreating(false);
    }
  };

  // ✅ Handle Edit Click
  const handleEditClick = (exam: any) => {
    setEditingExamId(exam.id);

    // 1. Fill Form Data
    setExamFormData({
      title: exam.title || '',
      title_ar: exam.title_ar || '',
      description: exam.description || '',
      description_ar: exam.description_ar || '',
      total_marks: exam.total_marks || 0,
      total_marks_pass_marks: exam.total_marks_pass_marks || 0,
      duration_minutes: exam.duration_minutes || 0,
      course_detail_id: exam.course_detail_id || null,
      stage_id: exam.stage_id || null,
    });

    // 2. Set Image
    if (exam.image && exam.image.id) {
      setImageId(exam.image.id);
    } else {
      setImageId(null);
    }

    // 3. Open Form
    setShowExamForm(true);
  };



  // ✅ دالة تنظيف الفورم
  const resetExamForm = () => {
    setExamFormData({
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      total_marks: 0,
      total_marks_pass_marks: 0,
      duration_minutes: 0,
      course_detail_id: null,
      stage_id: null,
    });
    setImageId(null);
    setEditingExamId(null);
  };

  // ✅ حذف امتحان
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


  // ✅ Create Exam Form with Premium UI/UX Animation           

  if (showExamForm) {
    return (
      <motion.div
        initial={{ opacity: 0, x: isRTL ? -100 : 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isRTL ? 100 : -100 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="max-w-5xl mx-auto px-4 py-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            whileHover={{ x: isRTL ? 5 : -5 }}
            whileTap={{ scale: 0.96 }}
          >
            <Button
              variant="outline"
              onClick={() => setShowExamForm(false)}
              className="rounded-2xl gap-2 shadow-sm"
            >
              <ChevronLeft
                className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`}
              />

              {t('back')}
            </Button>
          </motion.div>

          <div className="text-end">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {editingExamId ? (lang === 'ar' ? 'تعديل امتحان' : 'Edit Exam') : t('createNewExam')}
            </h1>

            <p className="text-muted-foreground mt-1 text-sm">
              {lang === 'ar'
                ? 'أنشئ امتحان احترافي للطلاب'
                : 'Create a professional exam for students'}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 18,
          }}
        >
          <Card className="overflow-hidden border-none shadow-2xl rounded-3xl bg-background/80 backdrop-blur-xl">
            {/* Top Glow */}
            <div className="relative h-2 bg-gradient-to-r from-primary via-secondary to-primary" />

            {/* Floating Decorations */}
            <motion.div
              className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
              }}
            />

            <motion.div
              className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [0, -90, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
              }}
            />

            <CardHeader className="relative z-10 pb-2">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                  }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>

                <div>
                  <CardTitle className="text-2xl font-bold">
                    {lang === 'ar'
                      ? 'بيانات الامتحان'
                      : 'Exam Information'}
                  </CardTitle>

                  <p className="text-muted-foreground text-sm mt-1">
                    {lang === 'ar'
                      ? 'أدخل جميع البيانات المطلوبة'
                      : 'Fill all required exam information'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-8 pt-6">

              {/* Upload */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl border border-dashed p-5 bg-muted/30"
              >
                <Label className="mb-3 block text-sm font-semibold">
                  {lang === 'ar'
                    ? 'صورة الامتحان'
                    : 'Exam Image'}
                </Label>

                <FileUploader
                  label={
                    lang === 'ar'
                      ? 'ارفع صورة الامتحان'
                      : 'Upload Exam Image'
                  }
                  onUploadSuccess={handleImageUpload}
                  onRemoveImage={handleRemoveImage}
                  multiple={false}
                  accept="image/*"
                  preview
                  uniqueId="exam-image-upload"
                  maxFiles={1}
                />
              </motion.div>

              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label>
                    {t('title')} (EN)
                  </Label>

                  <Input
                    value={examFormData.title}
                    onChange={(e) =>
                      setExamFormData({
                        ...examFormData,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g. Midterm Exam"
                    className="rounded-2xl h-12"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-2"
                >
                  <Label>
                    {t('title')} (AR)
                  </Label>

                  <Input
                    dir="rtl"
                    value={examFormData.title_ar}
                    onChange={(e) =>
                      setExamFormData({
                        ...examFormData,
                        title_ar: e.target.value,
                      })
                    }
                    placeholder="مثال: امتحان منتصف الفصل"
                    className="rounded-2xl h-12 text-right"
                  />
                </motion.div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label>
                    {t('description')} (EN)
                  </Label>

                  <Textarea
                    value={examFormData.description}
                    onChange={(e) =>
                      setExamFormData({
                        ...examFormData,
                        description: e.target.value,
                      })
                    }
                    rows={5}
                    placeholder="Exam Description..."
                    className="rounded-2xl resize-none"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-2"
                >
                  <Label>
                    {t('description')} (AR)
                  </Label>

                  <Textarea
                    dir="rtl"
                    value={examFormData.description_ar}
                    onChange={(e) =>
                      setExamFormData({
                        ...examFormData,
                        description_ar: e.target.value,
                      })
                    }
                    rows={5}
                    placeholder="وصف الامتحان..."
                    className="rounded-2xl resize-none text-right"
                  />
                </motion.div>
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5"
              >

                <Card className="rounded-2xl border shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <Label>{t('totalMarks')}</Label>

                    <Input
                      type="number"
                      value={examFormData.total_marks}
                      onChange={(e) =>
                        setExamFormData({
                          ...examFormData,
                          total_marks:
                            parseInt(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl"
                    />
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <Label>{t('passMarks')}</Label>

                    <Input
                      type="number"
                      value={examFormData.total_marks_pass_marks}
                      onChange={(e) =>
                        setExamFormData({
                          ...examFormData,
                          total_marks_pass_marks:
                            parseInt(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl"
                    />
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <Label>{t('durationMinutes')}</Label>

                    <Input
                      type="number"
                      value={examFormData.duration_minutes}
                      onChange={(e) =>
                        setExamFormData({
                          ...examFormData,
                          duration_minutes:
                            parseInt(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl"
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Selects */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <Label>{t('stage')}</Label>

                  <AsyncSelect
                    configKey="stages"
                    value={examFormData.stage_id}
                    onChange={(id) =>
                      setExamFormData({
                        ...examFormData,
                        stage_id: id,
                      })
                    }
                    placeholder={
                      lang === 'ar'
                        ? 'اختر المرحلة'
                        : 'Select Stage'
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('lesson')}</Label>

                  <AsyncSelect
                    configKey="lessons"
                    value={examFormData.course_detail_id}
                    onChange={(id) =>
                      setExamFormData({
                        ...examFormData,
                        course_detail_id: id,
                      })
                    }
                    placeholder={
                      lang === 'ar'
                        ? 'اختر الدرس'
                        : 'Select Lesson'
                    }
                    required
                    extraFilters={{ course_id: 1 }}
                  />
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="pt-4"
              >
                <Button
                  className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:scale-[1.01] transition-all shadow-xl"
                  onClick={createExamHandler}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin me-2" />
                      {lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : editingExamId ? ( // ✅ if editing
                    <>
                      <Save className="h-5 w-5 me-2" />
                      {lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 me-2" />
                      {t('createAndAddQuestions')}
                    </>
                  )}
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

                    {/* ✅ Question Image Upload */}
                    <div className="space-y-2">
                      <Label>{lang === 'ar' ? 'صورة السؤال (اختياري)' : 'Question Image (Optional)'}</Label>
                      <FileUploader
                        label={lang === 'ar' ? 'رفع صورة للسؤال' : 'Upload question image'}
                        onUploadSuccess={(id) => updateQuestion(q.id, { image: id })}
                        onRemoveImage={() => updateQuestion(q.id, { image: null })}
                        multiple={false}
                        accept="image/*"
                        preview={true}
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
  // ✅ واجهة الامتحان مع مؤثرات بصرية رائعة
  // ✅ Minimal Exam UI (Questions Only)

  if (showingExam && currentExam) {

    const questions = currentExam.questions || [];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="
        min-h-screen
        bg-gradient-to-b
        from-background
        to-muted/20
        py-10
        px-4
      "
      >
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <Card className="
            overflow-hidden
            border-0
            shadow-2xl
            rounded-3xl
            bg-background/80
            backdrop-blur-xl
          ">

              {/* TOP GRADIENT */}
              <div className="
              h-2
              bg-gradient-to-r
              from-primary
              via-secondary
              to-primary
            " />

              <CardContent className="p-8">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                  {/* LEFT */}
                  <div className="flex items-start gap-5">

                    <div className="
                    w-16 h-16
                    rounded-3xl
                    bg-gradient-to-r
                    from-primary
                    to-secondary
                    text-white
                    flex items-center justify-center
                    shadow-xl
                  ">
                      <Eye className="h-8 w-8" />
                    </div>

                    <div>

                      <div className="flex items-center gap-3 flex-wrap">

                        <h1 className="text-3xl font-black tracking-tight">
                          {currentExam.title}
                        </h1>

                        <Badge
                          variant="secondary"
                          className="
                          rounded-xl
                          px-3 py-1
                          text-xs
                          bg-primary/10
                          text-primary
                          border-primary/20
                        "
                        >
                          <Eye className="h-3 w-3 mr-1" />

                          {lang === 'ar'
                            ? 'وضع العرض'
                            : 'Preview Mode'}
                        </Badge>
                      </div>

                      <p className="
                      text-muted-foreground
                      mt-2
                      max-w-2xl
                      leading-relaxed
                    ">
                        {currentExam.description}
                      </p>

                    </div>
                  </div>

                  {/* RIGHT STATS */}
                  <div className="flex flex-wrap gap-3">

                    <div className="
                    min-w-[110px]
                    rounded-2xl
                    border
                    bg-muted/30
                    px-4 py-3
                    text-center
                  ">
                      <div className="text-xs text-muted-foreground mb-1">
                        {lang === 'ar'
                          ? 'الأسئلة'
                          : 'Questions'}
                      </div>

                      <div className="font-black text-xl">
                        {questions.length}
                      </div>
                    </div>

                    <div className="
                    min-w-[110px]
                    rounded-2xl
                    border
                    bg-muted/30
                    px-4 py-3
                    text-center
                  ">
                      <div className="text-xs text-muted-foreground mb-1">
                        {lang === 'ar'
                          ? 'الدرجة'
                          : 'Marks'}
                      </div>

                      <div className="font-black text-xl">
                        {currentExam.total_marks}
                      </div>
                    </div>

                    <div className="
                    min-w-[110px]
                    rounded-2xl
                    border
                    bg-muted/30
                    px-4 py-3
                    text-center
                  ">
                      <div className="text-xs text-muted-foreground mb-1">
                        {lang === 'ar'
                          ? 'الوقت'
                          : 'Duration'}
                      </div>

                      <div className="font-black text-xl">
                        {currentExam.duration_minutes}
                      </div>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* QUESTIONS */}
          <div className="space-y-6">

            {questions.map((q: any, idx: number) => (

              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className="
                rounded-3xl
                border-0
                shadow-lg
                hover:shadow-2xl
                transition-all
                duration-300
                overflow-hidden
                bg-background/90
                backdrop-blur
              ">

                  {/* TOP LINE */}
                  <div className="
                  h-1
                  bg-gradient-to-r
                  from-primary/70
                  to-secondary/70
                " />

                  <CardContent className="p-8">

                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-8">

                      <div className="flex items-center gap-4">

                        <div className="
                        w-14 h-14
                        rounded-2xl
                        bg-gradient-to-r
                        from-primary
                        to-secondary
                        text-white
                        flex items-center justify-center
                        font-black
                        text-lg
                        shadow-lg
                      ">
                          {idx + 1}
                        </div>

                        <div>

                          <h2 className="font-black text-xl">
                            {lang === 'ar'
                              ? `السؤال ${idx + 1}`
                              : `Question ${idx + 1}`}
                          </h2>

                          <p className="text-sm text-muted-foreground">
                            {q.mark} {t('marks')}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className="rounded-xl px-3 py-1"
                      >
                        {q.type || 'Question'}
                      </Badge>
                    </div>

                    {/* QUESTION */}
                    <QuestionCard
                      question={q}
                      index={idx}
                      readOnly
                    />

                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* BOTTOM */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10"
          >
            <Card className="
            rounded-3xl
            border
            bg-background/80
            backdrop-blur
            shadow-lg
          ">
              <CardContent className="
              p-6
              flex
              items-center
              justify-between
              flex-wrap
              gap-4
            ">

                <div>
                  <h3 className="font-bold text-lg">
                    {lang === 'ar'
                      ? 'معاينة الامتحان'
                      : 'Exam Preview'}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {lang === 'ar'
                      ? 'هذا العرض للمعاينة فقط ولا يمكن إرسال الإجابات'
                      : 'This is a preview mode only. Answers cannot be submitted.'}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    setShowingExam(false);
                    setCurrentExam(null);
                  }}                >
                  {lang === 'ar'
                    ? 'الرجوع'
                    : 'Back'}
                </Button>

              </CardContent>
            </Card>
          </motion.div>

        </div>
      </motion.div>
    );
  }
  // ✅ Show Result Modal
  if (showResult && result && currentExam) {
    return (
      <ExamResultCard
        result={result}
        exam={currentExam}
        onClose={() => {
          setShowResult(false);
          setTakingExam(false);
          setCurrentExam(null);
          fetchExams();
        }}
      />
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
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-3"> {/* ✅ مجموع زرين جنب بعض */}

                {/* زرار التصدير */}
                <ExportExcelButton
                  data={exams}
                  fileName="exams-list"
                  label={lang === 'ar' ? 'تصدير' : 'Export'}
                  disabled={loading || exams.length === 0}
                />

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
              </div>
            </div>
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
            <AlertCircle className="h-4 w-4" />
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
              <Card className="
group relative overflow-hidden
border border-border/50
bg-card/80 backdrop-blur-sm
hover:border-primary/40
hover:shadow-2xl hover:shadow-primary/10
transition-all duration-500
rounded-2xl
">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />

                <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                  {exam.image?.fullUrl ? (
                    <img src={exam.image.fullUrl} alt={exam.title} className="w-full h-full object-cover" />
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <FileText className="h-12 w-12 text-primary/50" />
                    </motion.div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={exam.active === 1 ? "success" : "secondary"} className="gap-1">
                      {exam.active === 1 ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {exam.active === 1 ? t('active') : t('inactive')}
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <motion.h3
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="font-bold text-xl line-clamp-1"
                          >
                            {isRTL && exam.title_ar ? exam.title_ar : exam.title}
                          </motion.h3>
                          <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.05 }}
                            className="text-sm text-muted-foreground line-clamp-2 mt-1"
                          >
                            {isRTL && exam.description_ar ? exam.description_ar : exam.description}
                          </motion.p>
                        </div>
                      </div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex gap-4 mt-4 text-sm"
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
                        {exam.total_marks_pass_marks && (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold text-yellow-600">{exam.total_marks_pass_marks}</span>
                            <span className="text-muted-foreground">pass</span>
                          </div>
                        )}
                      </motion.div>

                      {/* ✅ Exam Settings Toggle Section */}
                      <div className="mt-3 border-t pt-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleSettings(exam.id)}
                          className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <Settings2 className="h-3 w-3" />
                            <span>{lang === 'ar' ? 'إعدادات الامتحان' : 'Exam Settings'}</span>
                          </div>
                          {expandedSettings[exam.id] ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </motion.button>

                        <AnimatePresence>
                          {expandedSettings[exam.id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 space-y-2"
                            >
                              {/* Random Questions Toggle */}
                              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-2">
                                  <Shuffle className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs font-medium">
                                    {lang === 'ar' ? 'ترتيب عشوائي للأسئلة' : 'Random Questions'}
                                  </span>
                                </div>
                                <Switch
                                  checked={exam.random_questions || false}
                                  onCheckedChange={() => toggleRandomQuestions(exam.id, exam.random_questions)}
                                  className="data-[state=checked]:bg-primary scale-75"
                                />
                              </div>

                              {/* Random Answers Toggle */}
                              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-2">
                                  <ListOrdered className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs font-medium">
                                    {lang === 'ar' ? 'ترتيب عشوائي للإجابات' : 'Random Answers'}
                                  </span>
                                </div>
                                <Switch
                                  checked={exam.random_answers || false}
                                  onCheckedChange={() => toggleRandomAnswers(exam.id, exam.random_answers)}
                                  className="data-[state=checked]:bg-primary scale-75"
                                />
                              </div>

                              {/* Show Result Toggle */}
                              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs font-medium">
                                    {lang === 'ar' ? 'إظهار النتيجة للطلاب' : 'Show Result to Students'}
                                  </span>
                                </div>
                                <Switch
                                  checked={exam.show_result || false}
                                  onCheckedChange={() => toggleShowResult(exam.id, exam.show_result)}
                                  className="data-[state=checked]:bg-primary scale-75"
                                />
                              </div>

                              {/* Active Toggle */}

                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="flex flex-col gap-2 mt-3"
                      >
                        {/* الصف الأول */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1 rounded-lg"
                            onClick={() => {
                              setSelectedExamId(exam.id);
                              setActiveTab('questions');
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            {t('addQuestions')}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1 rounded-lg border-warning text-warning hover:bg-warning/10"
                            onClick={() => handleEditClick(exam)}
                          >
                            <Settings2 className="h-3 w-3" />
                            {lang === 'ar' ? 'تعديل' : 'Edit'}
                          </Button>
                        </div>

                        {/* الصف الثاني */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-2 rounded-lg border-primary/30 bg-primary/5 hover:bg-primary/10"
                            onClick={() => showExam(exam)}
                          >
                            <Eye className="h-3 w-3" />
                            {lang === 'ar' ? 'عرض' : 'View'}
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-lg px-3" // تقليل الحجم
                            onClick={() => deleteExam(exam.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </LayoutGroup>

      {pagination.lastPage > 1 && (
        <div className="flex items-center justify-center gap-3 py-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10"
            onClick={() => fetchExams(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <span className="text-sm">
            {pagination.currentPage} / {pagination.lastPage}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10"
            onClick={() => fetchExams(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.lastPage}
          >
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      )}
    </motion.div>
  );

};