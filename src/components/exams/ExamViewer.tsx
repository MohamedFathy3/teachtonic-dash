/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/exams/ExamViewer.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Users, FileQuestion, CheckCircle, XCircle, AlertCircle,
  Edit3, Save, Loader2, Eye, Search, ChevronLeft,
  Trophy, Clock, Sparkles, TrendingUp, Star,
  Download, X, Phone, User as UserIcon,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast  } from "@/hooks/use-toast";
import api from '@/lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import { StudentLearningPage } from '@/pages/instructor/StudentLearningPage';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';

interface ExamViewerProps {
  examId?: number;
  onBack?: () => void;
}

// أنيميشن المتغيرات
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const statCardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
  hover: { scale: 1.05, y: -5, transition: { type: "spring", stiffness: 400, damping: 10 } }
};

// مكون عرض صورة الإجابة
const AnswerImage: React.FC<{ imageUrl: string; alt?: string }> = ({ 
  imageUrl, 
  alt = 'Answer image' 
}) => {
  const { lang } = useApp();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!imageUrl) return null;

  return (
    <div className="mt-2">
      {loading && (
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg h-32 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {!error ? (
        <img
          src={imageUrl}
          alt={alt}
          className="max-h-48 rounded-lg object-contain bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
            console.error('Failed to load answer image:', imageUrl);
          }}
        />
      ) : (
        <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg text-center border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-1" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {lang === 'ar' ? '⚠️ تعذر تحميل الصورة' : '⚠️ Failed to load image'}
          </p>
        </div>
      )}
    </div>
  );
};

// Modal لتصحيح السؤال المقالي
const GradeEssayModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  answer: any;
  question: any;
  onGradeSubmit: (answerId: number, mark: number) => Promise<void>;
}> = ({ isOpen, onClose, answer, question, onGradeSubmit }) => {
  const { lang } = useApp();
  const [mark, setMark] = useState<number>(() => {
    if (answer?.mark !== undefined && answer?.mark !== null) {
      return parseFloat(answer.mark);
    }
    return 0;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const maxMark = question ? parseFloat(question.mark) : 0;

  const validateMark = (value: number) => {
    if (value < 0) {
      setError(lang === 'ar' ? '⚠️ الدرجة لا يمكن أن تكون سالبة' : '⚠️ Mark cannot be negative');
      return false;
    }
    if (value > maxMark) {
      setError(lang === 'ar' ? `⚠️ الدرجة لا يمكن أن تتجاوز ${maxMark}` : `⚠️ Mark cannot exceed ${maxMark}`);
      return false;
    }
    setError('');
    return true;
  };

  const handleMarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setMark(value);
    validateMark(value);
  };

  const handleSubmit = async () => {
    if (!validateMark(mark)) {
      return;
    }

    const confirmSave = window.confirm(
      lang === 'ar'
        ? `هل أنت متأكد من حفظ الدرجة ${mark} من ${maxMark}؟`
        : `Are you sure you want to save grade ${mark} out of ${maxMark}?`
    );

    if (!confirmSave) return;

    setLoading(true);
    try {
      await onGradeSubmit(answer.id, mark);
      onClose();
    } catch (error) {
      // يتم التعامل مع الخطأ في الدالة الأم
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            {lang === 'ar' ? 'تصحيح السؤال المقالي' : 'Grade Essay'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{lang === 'ar' ? 'السؤال' : 'Question'}</Label>
            <div className="p-3 bg-muted/50 rounded-lg mt-1">
              <p className="text-sm">{question?.question}</p>
              {question?.image && (
                <img 
                  src={question.image.fullUrl || question.image.previewUrl} 
                  alt="Question" 
                  className="max-h-32 rounded-lg mt-2"
                />
              )}
            </div>
          </div>

          <div>
            <Label>{lang === 'ar' ? 'إجابة الطالب' : 'Student Answer'}</Label>
            <div className="p-3 bg-muted/30 rounded-lg border mt-1">
              <p className="text-sm whitespace-pre-wrap">{answer?.answer || '-'}</p>
              {answer?.image && (
                <img 
                  src={answer.image.fullUrl || answer.image.previewUrl || answer.image} 
                  alt="Student answer" 
                  className="max-h-32 rounded-lg mt-2"
                />
              )}
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              {lang === 'ar' ? 'الدرجة' : 'Mark'} 
              <span className="text-xs text-muted-foreground">
                (Max: {maxMark})
              </span>
            </Label>
            <div className="flex items-center gap-3 mt-1">
              <Input 
                type="number" 
                value={mark} 
                onChange={handleMarkChange}
                className="w-32" 
                min={0} 
                max={maxMark} 
                step={0.5}
                disabled={loading}
              />
              <span className="text-sm text-muted-foreground">/ {maxMark}</span>
              {answer?.mark !== undefined && answer?.mark !== null && (
                <Badge variant="outline" className="text-xs">
                  {lang === 'ar' ? 'الدرجة السابقة:' : 'Previous:'} {answer.mark}
                </Badge>
              )}
            </div>
            {error && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {lang === 'ar' ? 'الدرجة القصوى:' : 'Max Mark:'}
              </span>
              <span className="font-bold">{maxMark}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">
                {lang === 'ar' ? 'النسبة المئوية:' : 'Percentage:'}
              </span>
              <span className="font-bold">
                {maxMark > 0 ? ((mark / maxMark) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  mark >= maxMark * 0.5 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${maxMark > 0 ? (mark / maxMark) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !!error}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {lang === 'ar' ? 'حفظ التصحيح' : 'Save Grade'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Modal لعرض إجابات طالب واحد
const StudentAnswersModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  student: any;
  exam: any;
  questions: any[];
  onGradeSubmit?: (answerId: number, mark: number) => Promise<void>;
  onViewProfile: (studentId: number) => void;
  examId?: number;
}> = ({ isOpen, onClose, student, exam, questions, onGradeSubmit, onViewProfile, examId }) => {
  const { lang } = useApp();
  const [gradingAnswer, setGradingAnswer] = useState<any>(null);
  const [gradingQuestion, setGradingQuestion] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ دالة التصحيح جوه المودال
  const handleGradeEssay = async (answerId: number, mark: number) => {
    try {
      console.log('📤 Sending grade:', { answer_id: answerId, mark });
      
      const response = await api.post('/exam/grade-essay', { 
        answer_id: answerId, 
        mark: mark 
      });
      
      console.log('📥 Grade response:', response.data);
      
      toast.success(
        lang === 'ar' 
          ? '✅ تم تصحيح الإجابة بنجاح!' 
          : '✅ Answer graded successfully!'
      );
      
      setRefreshKey(prev => prev + 1);
      
      // ✅ تحديث بيانات الطالب في الـ parent component
      if (onGradeSubmit) {
        await onGradeSubmit(answerId, mark);
      }
      
    } catch (error: any) {
      console.error('❌ Grade error:', error);
      toast.error(
        lang === 'ar'
          ? `❌ فشل التصحيح: ${error.response?.data?.message || error.message}`
          : `❌ Failed to grade: ${error.response?.data?.message || error.message}`
      );
    }
  };

  if (!student) return null;

  const totalScore = questions.reduce((sum, q) => {
    const answer = student.answers?.find((a: any) => a.question_id === q.id);
    return sum + (answer?.mark ? parseFloat(answer.mark) : 0);
  }, 0);

  const totalMarks = exam?.total_marks || 0;
  const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 rounded-t-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm"
                >
                  {student.name?.charAt(0)?.toUpperCase() || 'S'}
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold">{student.name}</h2>
                  <p className="text-white/80 text-sm">{exam?.title}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => onViewProfile(student.id)}>
                  <Eye className="h-4 w-4 mr-1" />
                  {lang === 'ar' ? 'البروفايل' : 'Profile'}
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={onClose}>✕</Button>
              </div>
            </div>
          </motion.div>

          <div className="p-6 border-b">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-5"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'النتيجة' : 'Score'}</p>
                  <p className="text-3xl font-bold">{totalScore} / {totalMarks}</p>
                  <p className="text-sm mt-1">{percentage.toFixed(1)}%</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${percentage >= 50 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                >
                  {percentage.toFixed(0)}%
                </motion.div>
              </div>
              <Progress value={percentage} className="h-2 mt-4" />
            </motion.div>
          </div>

          <div className="p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-primary" />
              {lang === 'ar' ? 'الأسئلة والإجابات' : 'Questions & Answers'}
            </h3>
            <AnimatePresence>
              {questions.map((q, idx) => {
                const answer = student.answers?.find((a: any) => a.question_id === q.id);
                const isEssay = q.question_type === 'essay';
                const needsGrading = isEssay && answer && answer.mark === null && answer.answer;

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center font-bold text-sm"
                            >
                              {idx + 1}
                            </motion.div>
                            <Badge variant="outline" className="text-xs">
                              {q.question_type === 'true_false' ? 'صح/خطأ' : q.question_type === 'multiple_choice' ? 'اختيار من متعدد' : 'مقالي'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{q.mark} درجات</span>
                          </div>
                          {answer?.mark !== undefined && answer?.mark !== null && (
                            <Badge className={answer.mark > 0 ? 'bg-green-500' : 'bg-red-500'}>
                              {answer.mark} / {q.mark}
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium mb-3">{q.question}</p>
                        {answer ? (
                          <div className={`p-3 rounded-lg ${isEssay ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200' : 'bg-muted/30'}`}>
                            <p className="text-xs text-muted-foreground mb-1">
                              {lang === 'ar' ? 'إجابة الطالب:' : 'Answer:'}
                            </p>
                            
                            {answer.answer && (
                              <p className="text-sm whitespace-pre-wrap">{answer.answer}</p>
                            )}
                            
                            {answer.image && (
                              <AnswerImage 
                                imageUrl={answer.image.fullUrl || answer.image.previewUrl || answer.image} 
                                alt={`Answer image for question ${idx + 1}`}
                              />
                            )}
                            
                            {!answer.answer && answer.image && typeof answer.image === 'string' && (
                              <AnswerImage imageUrl={answer.image} alt={`Answer image ${idx + 1}`} />
                            )}
                            
                            {answer.answer && answer.image && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {lang === 'ar' ? '📎 مرفق صورة مع الإجابة' : '📎 Image attached with answer'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              {lang === 'ar' ? 'لم يتم الإجابة' : 'Not answered'}
                            </p>
                          </div>
                        )}
                       {isEssay && answer && (
  <div className="flex gap-2 mt-3">
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        size="sm"
        variant="default"
        className="gap-1"
        onClick={() => { setGradingAnswer(answer); setGradingQuestion(q); }}
      >
        <Edit3 className="h-3 w-3" />
        {lang === 'ar' ? 'تصحيح' : 'Grade'}
      </Button>
    </motion.div>
    
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        size="sm"
        variant="outline"
        className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
        onClick={async () => {
          if (window.confirm(
            lang === 'ar'
              ? `هل تريد منح الطالب الدرجة الكاملة (${q.mark})؟`
              : `Give full mark (${q.mark})?`
          )) {
            await handleGradeEssay(answer.id, parseFloat(q.mark));
            toast.success(
              lang === 'ar' 
                ? '✅ تم منح الدرجة الكاملة!' 
                : '✅ Full mark given!'
            );
          }
        }}
      >
        <Trophy className="h-3 w-3" />
        {lang === 'ar' ? 'درجة كاملة' : 'Full Mark'}
      </Button>
    </motion.div>
  </div>
)}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      <GradeEssayModal 
        isOpen={!!gradingAnswer} 
        onClose={() => { setGradingAnswer(null); setGradingQuestion(null); }} 
        answer={gradingAnswer} 
        question={gradingQuestion} 
        onGradeSubmit={handleGradeEssay} 
      />
    </>
  );
};

export const ExamViewer: React.FC<ExamViewerProps> = ({ examId: propExamId, onBack: propOnBack }) => {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const { examId: paramExamId } = useParams<{ examId: string }>();
  const examId = propExamId || (paramExamId ? parseInt(paramExamId) : null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);

  // ✅ جميع الـ Hooks في البداية (قبل أي return)
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('questions');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ فلاتر بحث الطلاب
  const [searchQuery, setSearchQuery] = useState('');
  const [studentSearchId, setStudentSearchId] = useState('');
  const [studentSearchPhone, setStudentSearchPhone] = useState('');
  const [filterTypeOfStudy, setFilterTypeOfStudy] = useState<string>('');

  const handleGradeEssay = async (answerId: number, mark: number) => {
    try {
      console.log('📤 Sending grade:', { answer_id: answerId, mark });
      
      const response = await api.post('/exam/grade-essay', { 
        answer_id: answerId, 
        mark: mark 
      });
      
      console.log('📥 Grade response:', response.data);
      
      toast.success(
        lang === 'ar' 
          ? '✅ تم تصحيح الإجابة بنجاح!' 
          : '✅ Answer graded successfully!'
      );
      
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('❌ Grade error:', error);
      toast.error(
        lang === 'ar'
          ? `❌ فشل التصحيح: ${error.response?.data?.message || error.message}`
          : `❌ Failed to grade: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // دالة حذف السؤال
  const handleDeleteQuestion = async (questionId: number) => {
    if (!examId) return;
    
    const confirmDelete = window.confirm(
      lang === 'ar' 
        ? `هل أنت متأكد من حذف هذا السؤال؟`
        : `Are you sure you want to delete this question?`
    );
    
    if (!confirmDelete) return;
    
    setDeletingQuestionId(questionId);
    
    try {
      await api.delete(`/exam-questions/${questionId}`);
      toast.success(
        lang === 'ar' 
          ? '✅ تم حذف السؤال بنجاح!'
          : '✅ Question deleted successfully!'
      );
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast.error(
        lang === 'ar'
          ? `❌ فشل حذف السؤال: ${error.response?.data?.message || error.message}`
          : `❌ Failed to delete question: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setDeletingQuestionId(null);
    }
  };

  // دالة ترقية الطالب
  const handlePassStudent = async (studentId: number, studentName: string) => {
    if (!examId) return;
    
    const confirmPass = window.confirm(
      lang === 'ar' 
        ? `هل أنت متأكد من انجاح الطالب "${studentName}"؟`
        : `Are you sure you want to pass "${studentName}"?`
    );
    
    if (!confirmPass) return;
    
    try {
      await api.post('/pass-student', {
        exam_id: examId,
        student_id: studentId
      });
      toast.success(
        lang === 'ar' 
          ? `✅ تم ${studentName} بنجاح!`
          : `✅ ${studentName} passed successfully!`
      );
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast.error(
        lang === 'ar'
          ? `❌ فشل الترقية: ${error.response?.data?.message || error.message}`
          : `❌ Failed to pass student: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // ✅ الـ useEffect
  useEffect(() => {
    if (examId) fetchExamData();
  }, [examId, refreshKey]);

  const fetchExamData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/exam/${examId}`);
      setExam(res.data.data);
      console.log('Fetched exam data:', res.data.data);
    } catch (error) {
      toast.error(lang === 'ar' ? 'خطأ في التحميل' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      navigate('/instructor/exams');
    }
  };

  // ✅ الـ useMemo بعد الـ Hooks وقبل أي return
  const questions = exam?.questions || [];
  console.log('Questions:', questions);
  const students = exam?.students || [];

  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    if (searchQuery) {
      filtered = filtered.filter((s: any) =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterTypeOfStudy) {
      filtered = filtered.filter((s: any) =>
        s.type_of_study === filterTypeOfStudy
      );
    }
    if (studentSearchId) {
      filtered = filtered.filter((s: any) =>
        s.id?.toString().includes(studentSearchId)
      );
    }

    if (studentSearchPhone) {
      filtered = filtered.filter((s: any) =>
        s.phone?.includes(studentSearchPhone)
      );
    }

    return filtered;
  }, [students, searchQuery, studentSearchId, studentSearchPhone, filterTypeOfStudy]);

  const exportData = useMemo(() => {
    if (!questions.length || !filteredStudents.length) return [];

    return filteredStudents.map((student: any) => {
      const score = questions.reduce((total: number, q: any) => {
        const answer = student.answers?.find((a: any) => a.question_id === q.id);
        return total + (answer?.mark ? parseFloat(answer.mark) : 0);
      }, 0);
      const percentage = (score / (exam?.total_marks || 1)) * 100;

      return {
        [lang === 'ar' ? 'الرقم' : 'ID']: student.id,
        [lang === 'ar' ? 'الاسم' : 'Name']: student.name,
        [lang === 'ar' ? 'الهاتف' : 'Phone']: student.phone,
        [lang === 'ar' ? 'هاتف ولي الأمر' : 'Parent Phone']: student.phone_parent || '-',
        [lang === 'ar' ? 'الكود' : 'Code']: student.code_parent || '-',

        [lang === 'ar' ? 'نوع الحضور' : 'Attendance Type']: student.type_of_attendance === 'online' ? (lang === 'ar' ? 'أونلاين' : 'Online') : (lang === 'ar' ? 'سنتر' : 'Center'),
        [lang === 'ar' ? 'الحالة' : 'Status']: student.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive'),
        [lang === 'ar' ? 'الدرجة' : 'Score']: `${score}/${exam?.total_marks}`,
        [lang === 'ar' ? 'النسبة' : 'Percentage']: `${percentage.toFixed(1)}%`,
        [lang === 'ar' ? 'تاريخ التسجيل' : 'Registered']: new Date(student.created_at || student.createdAt).toLocaleDateString(),
        [lang === 'ar' ? 'نوع الدراسة' : 'Study Type']:
          student.type_of_study === 'general'
            ? (lang === 'ar' ? 'عام' : 'General')
            : student.type_of_study === 'azhar'
              ? (lang === 'ar' ? 'أزهر' : 'Azhar')
              : '-',
      };
    });
  }, [filteredStudents, questions, exam?.total_marks, lang]);

  const passRate = useMemo(() => {
    if (students.length === 0) return 0;
    return Math.round(students.filter(s => {
      const score = questions.reduce((total, q) => {
        const a = s.answers?.find((ans: any) => ans.question_id === q.id);
        return total + (a?.mark ? parseFloat(a.mark) : 0);
      }, 0);
      const percentage = (score / (exam?.total_marks || 1)) * 100;
      return percentage >= 50;
    }).length / students.length * 100);
  }, [students, questions, exam?.total_marks]);

  const clearStudentFilters = () => {
    setSearchQuery('');
    setStudentSearchId('');
    setFilterTypeOfStudy('');
    setStudentSearchPhone('');
  };

  const getTypeLabel = (type: string) => {
    const types: any = {
      true_false: lang === 'ar' ? 'صح/خطأ' : 'True/False',
      multiple_choice: lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice',
      essay: lang === 'ar' ? 'مقالي' : 'Essay',
    };
    return types[type] || type;
  };

  // ✅ بعد كل الـ Hooks، نضع الـ Conditional Returns
  if (viewingProfile) {
    return <StudentLearningPage studentId={viewingProfile} onBack={() => setViewingProfile(null)} />;
  }

  if (!examId) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <p>{lang === 'ar' ? 'لم يتم تحديد الامتحان' : 'Exam not found'}</p>
          <Button onClick={handleBack} className="mt-4">{lang === 'ar' ? 'رجوع' : 'Back'}</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  // ✅ باقي الـ JSX
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:30px_30px]" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleBack}
            className="group mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">{lang === 'ar' ? 'العودة إلى الامتحانات' : 'Back to Exams'}</span>
          </motion.button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-30" />
                <div className="relative w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                  <FileQuestion className="h-8 w-8 text-white" />
                </div>
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-bold text-white"
                >
                  {exam?.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/80 mt-1"
                >
                  {exam?.description}
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">{exam?.type_exam === 'online' ? '📱 أونلاين' : '🏫 مركز'}</span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Stats Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: FileQuestion, label: lang === 'ar' ? 'الأسئلة' : 'Questions', value: questions.length, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
            { icon: Trophy, label: lang === 'ar' ? 'الدرجة الكلية' : 'Total Marks', value: exam?.total_marks, color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
            { icon: Clock, label: lang === 'ar' ? 'المدة' : 'Duration', value: `${exam?.duration_minutes} ${lang === 'ar' ? 'دقيقة' : 'min'}`, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-950/30' },
            { icon: Users, label: lang === 'ar' ? 'الطلاب' : 'Students', value: students.length, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={statCardVariants}
              whileHover="hover"
              className={`relative overflow-hidden rounded-2xl p-5 shadow-lg ${stat.bg} border border-gray-100 dark:border-gray-800`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-md`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-white/50 dark:bg-gray-800/50">{stat.label}</Badge>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              </div>
              <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-r ${stat.color} rounded-full blur-2xl opacity-10`} />
            </motion.div>
          ))}
        </motion.div>

        {/* نسبة النجاح Card */}
        {students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-none shadow-lg">
              <div className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'نسبة النجاح' : 'Pass Rate'}</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{passRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{students.filter(s => {
                    const score = questions.reduce((total, q) => {
                      const a = s.answers?.find((ans: any) => ans.question_id === q.id);
                      return total + (a?.mark ? parseFloat(a.mark) : 0);
                    }, 0);
                    const percentage = (score / (exam?.total_marks || 1)) * 100;
                    return percentage >= 50;
                  }).length} {lang === 'ar' ? 'طالب ناجح' : 'students passed'}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <Progress value={passRate} className="h-2 rounded-b-2xl" />
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-md grid grid-cols-2 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
              <TabsTrigger
                value="questions"
                className="rounded-xl gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md transition-all duration-300"
              >
                <FileQuestion className="h-4 w-4" />
                {lang === 'ar' ? 'الأسئلة' : 'Questions'}
                <Badge variant="secondary" className="ml-1 text-xs">{questions.length}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="rounded-xl gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md transition-all duration-300"
              >
                <Users className="h-4 w-4" />
                {lang === 'ar' ? 'الطلاب' : 'Students'}
                <Badge variant="secondary" className="ml-1 text-xs">{students.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Questions Tab */}
            <TabsContent value="questions" className="mt-6 space-y-4">
              {questions.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <div className="w-24 h-24 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <FileQuestion className="h-12 w-12 text-slate-400" />
                  </div>
                  <p className="text-muted-foreground">{lang === 'ar' ? 'لا توجد أسئلة في هذا الامتحان' : 'No questions in this exam'}</p>
                </motion.div>
              ) : (
                questions.map((q: any, idx: number) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-l-indigo-500 relative">
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                                {idx + 1}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(q.question_type)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Star className="h-3 w-3" />
                                {q.mark} {lang === 'ar' ? 'درجات' : 'marks'}
                              </Badge>
                            </div>
                            <p className="font-medium mb-3">{q.question}</p>
                            {q.image && (
                              <div className="mt-2 mb-3">
                                <img 
                                  src={q.image.fullUrl || q.image.previewUrl} 
                                  alt="Question" 
                                  className="max-h-48 rounded-lg object-contain bg-slate-50 dark:bg-slate-800/50"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            {q.correct_answer && (
                              <div className="mt-2 text-sm bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-2 rounded-lg">
                                <span className="font-medium">{lang === 'ar' ? '✓ الإجابة الصحيحة:' : '✓ Correct:'}</span> {q.correct_answer === 'true' ? (lang === 'ar' ? 'صحيح' : 'True') : q.correct_answer === 'false' ? (lang === 'ar' ? 'خطأ' : 'False') : q.correct_answer}
                              </div>
                            )}
                            {q.options && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground mb-2">{lang === 'ar' ? 'الخيارات:' : 'Options:'}</p>
                                <div className="flex flex-wrap gap-2">
                                  {JSON.parse(q.options).map((opt: string, i: number) => (
                                    <Badge key={i} variant={opt === q.correct_answer ? "default" : "outline"} className="cursor-pointer">
                                      {opt}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* زر حذف السؤال */}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="ml-4 shrink-0 gap-1 hover:scale-105 transition-all duration-200"
                            onClick={() => handleDeleteQuestion(q.id)}
                            disabled={deletingQuestionId === q.id}
                          >
                            {deletingQuestionId === q.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            <span className="hidden sm:inline">
                              {lang === 'ar' ? 'حذف' : 'Delete'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="mt-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="flex gap-2 flex-wrap">
                  <ExportExcelButton
                    data={exportData}
                    fileName={`exam_${examId}_students`}
                    label={lang === 'ar' ? '📊 تصدير Excel' : '📊 Export Excel'}
                    disabled={filteredStudents.length === 0}
                  />
                  {(searchQuery || studentSearchId || studentSearchPhone) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearStudentFilters}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" />
                      {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={lang === 'ar' ? 'بحث بالاسم...' : 'Search by name...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder={lang === 'ar' ? 'بحث كود الطالب...' : 'Search by student ID...'}
                    value={studentSearchId}
                    onChange={(e) => setStudentSearchId(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={lang === 'ar' ? 'بحث برقم الهاتف...' : 'Search by phone...'}
                    value={studentSearchPhone}
                    onChange={(e) => setStudentSearchPhone(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterTypeOfStudy}
                    onChange={(e) => setFilterTypeOfStudy(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border bg-background text-sm"
                  >
                    <option value="">{lang === 'ar' ? '📖 كل أنواع الدراسة' : '📖 All Study Types'}</option>
                    <option value="general">📚 {lang === 'ar' ? 'عام' : 'General'}</option>
                    <option value="azhar">🕌 {lang === 'ar' ? 'أزهر' : 'Azhar'}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {lang === 'ar'
                    ? `عرض ${filteredStudents.length} من ${students.length} طالب`
                    : `Showing ${filteredStudents.length} of ${students.length} students`}
                </p>
              </div>

              {filteredStudents.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <div className="w-24 h-24 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-12 w-12 text-slate-400" />
                  </div>
                  <p className="text-muted-foreground">{lang === 'ar' ? 'لا يوجد طلاب' : 'No students found'}</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredStudents.map((student: any, idx: number) => {
                    const score = questions.reduce((sum: number, q: any) => {
                      const a = student.answers?.find((ans: any) => ans.question_id === q.id);
                      return sum + (a?.mark ? parseFloat(a.mark) : 0);
                    }, 0);
                    const percentage = (score / (exam?.total_marks || 1)) * 100;
                    const hasPending = questions.some((q: any) => {
                      const a = student.answers?.find((ans: any) => ans.question_id === q.id);
                      return q.question_type === 'essay' && a && a.mark === null && a.answer;
                    });

                    return (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -5 }}
                      >
                        <Card
                          className="cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 group border border-slate-100 dark:border-slate-800"
                          onClick={() => { setSelectedStudent(student); setStudentModalOpen(true); }}
                        >
                          <div className="relative h-24 bg-gradient-to-r from-indigo-500 to-purple-500">
                            <div className="absolute -bottom-8 left-4">
                              <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-bold text-xl shadow-lg border-4 border-white dark:border-slate-800">
                                {student.name?.charAt(0)?.toUpperCase() || 'S'}
                              </div>
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white shadow-lg gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePassStudent(student.id, student.name);
                                }}
                              >
                                <Trophy className="h-3.5 w-3.5" />
                                {lang === 'ar' ? 'تنجيح الطالب' : 'Pass'}
                              </Button>
                              
                              {hasPending && (
                                <Badge className="bg-amber-500 text-white gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {lang === 'ar' ? 'بانتظار' : 'Pending'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="p-4 pt-10">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{student.name}</h3>
                            <div className="flex justify-between items-center mt-2">
                              <Badge variant="outline" className="text-xs gap-1">
                                <FileQuestion className="h-3 w-3" />
                                {student.answers?.length || 0} {lang === 'ar' ? 'إجابات' : 'Answers'}
                              </Badge>
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-800 dark:text-white">{score}/{exam?.total_marks}</p>
                                <div className="flex items-center gap-1">
                                  <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      className={`h-full ${percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <UserIcon className="h-3 w-3" />
                                <span>ID: {student.id}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{student.phone}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <StudentAnswersModal 
        isOpen={studentModalOpen} 
        onClose={() => { setStudentModalOpen(false); setSelectedStudent(null); }} 
        student={selectedStudent} 
        exam={exam} 
        questions={questions} 
        onGradeSubmit={handleGradeEssay} 
        onViewProfile={(id) => { setStudentModalOpen(false); setViewingProfile(id); }} 
      />
    </motion.div>
  );
};

export default ExamViewer;