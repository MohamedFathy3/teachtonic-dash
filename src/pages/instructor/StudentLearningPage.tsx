
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { studentService, StudentLearningData } from '@/services/student.service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Phone, Calendar, CheckCircle, XCircle,
  BookOpen, GraduationCap, Video, Clock, DollarSign,
  Loader2, Sparkles, Trophy, Award, Calendar as CalendarIcon,
  Monitor, Building2, Users, Eye, FileQuestion, FileText,
  Edit3, Save, X, AlertCircle, TrendingUp, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast  } from "@/hooks/use-toast";
import api from '@/lib/api';

interface StudentLearningPageProps {
  studentId?: number;
  onBack?: () => void;
}

interface ExamQuestion {
  id: number;
  question: string;
  mark: string;
  question_type: string;
  correct_answer: string | null;
  student_answer: string | null;
  is_correct: boolean | null;
  mark_obtained: string | null;
}

interface StudentExam {
  exam: {
    id: number;
    title: string;
    total_marks: number;
    type: string;
  };
  student_mark: number | null;
  questions: ExamQuestion[];
  // type_of_study: 'general' | 'azhar' | null;  // ✅ أضف هذا 

}

interface GradeEssayModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: ExamQuestion | null;
  examTitle: string;
  onGradeSubmit: (answerId: number, mark: number) => Promise<void>;
}

const GradeEssayModal: React.FC<GradeEssayModalProps> = ({
  isOpen,
  onClose,
  question,
  examTitle,
  onGradeSubmit
}) => {
  const { lang } = useApp();
  const [mark, setMark] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (question) {
      setMark(Number(question.mark_obtained) || 0);
      setError('');
    }
  }, [question]);

  const maxMark = question ? parseFloat(question.mark) : 0;

  const handleSubmit = async () => {
    if (mark < 0 || mark > maxMark) {
      setError(lang === 'ar' ? `الدرجة يجب أن تكون بين 0 و ${maxMark}` : `Mark must be between 0 and ${maxMark}`);
      return;
    }

    setLoading(true);
    try {
      await onGradeSubmit(question!.id, mark);
      toast.success(lang === 'ar' ? 'تم حفظ التصحيح بنجاح' : 'Grade saved successfully');
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (lang === 'ar' ? 'حدث خطأ أثناء حفظ التصحيح' : 'Error saving grade'));
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
            {lang === 'ar' ? 'تصحيح السؤال' : 'Grade Question'}
          </DialogTitle>
          <DialogDescription>
            {examTitle} - {lang === 'ar' ? 'تصحيح السؤال المقالي' : 'Essay Question Grading'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {lang === 'ar' ? 'السؤال' : 'Question'}
            </Label>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">{question?.question}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {lang === 'ar' ? 'إجابة الطالب' : 'Student Answer'}
            </Label>
            <div className="p-3 bg-muted/30 rounded-lg border">
              <p className="text-sm whitespace-pre-wrap">
                {question?.student_answer || (lang === 'ar' ? 'لم يتم تقديم إجابة' : 'No answer provided')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {lang === 'ar' ? 'الدرجة' : 'Mark'} ({lang === 'ar' ? 'الحد الأقصى' : 'Max'}: {maxMark})
            </Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={mark}
                onChange={(e) => setMark(parseFloat(e.target.value) || 0)}
                className="w-32"
                min={0}
                max={maxMark}
                step={0.5}
              />
              <span className="text-sm text-muted-foreground">/ {maxMark}</span>
            </div>
            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {lang === 'ar' ? 'ملاحظات (اختياري)' : 'Feedback (Optional)'}
            </Label>
            <Textarea
              placeholder={lang === 'ar' ? 'أضف ملاحظات للطالب...' : 'Add feedback for the student...'}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 ml-2" />
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : (
              <Save className="h-4 w-4 ml-2" />
            )}
            {lang === 'ar' ? 'حفظ التصحيح' : 'Save Grade'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const StudentLearningPage: React.FC<StudentLearningPageProps> = ({ studentId: propStudentId, onBack: propOnBack }) => {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const { studentId: paramStudentId } = useParams<{ studentId: string }>();
  const isRTL = lang === 'ar';

  // استخدام الـ ID من props أو من الرابط
  const studentId = propStudentId || (paramStudentId ? parseInt(paramStudentId) : null);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentLearningData | null>(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ExamQuestion | null>(null);
  const [selectedExamTitle, setSelectedExamTitle] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // دالة الرجوع
  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      navigate('/instructor/exams');
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchData();
    }
  }, [studentId, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await studentService.getStudentLearning(studentId!);
      setData(result);
    } catch (error) {
      console.error('Failed to fetch student learning data:', error);
      toast.error(lang === 'ar' ? 'فشل في تحميل بيانات الطالب' : 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeEssay = async (answerId: number, mark: number) => {
    try {
      await api.post('/exam/grade-essay', {
        answer_id: answerId,
        mark: mark
      });
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Grade essay error:', error);
      throw error;
    }
  };

  const openGradeModal = (question: ExamQuestion, examTitle: string) => {
    if (question.question_type === 'essay' && question.student_answer) {
      setSelectedQuestion(question);
      setSelectedExamTitle(examTitle);
      setGradeModalOpen(true);
    }
  };

  // إذا لم يتم تحديد studentId
  if (!studentId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{lang === 'ar' ? 'لم يتم تحديد الطالب' : 'Student not specified'}</p>
          <Button onClick={handleBack} className="mt-4">{lang === 'ar' ? 'رجوع' : 'Back'}</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t('loading') || 'جاري التحميل...'}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('noData') || 'لا توجد بيانات'}</p>
        <Button onClick={handleBack} className="mt-4">{t('back') || 'رجوع'}</Button>
      </div>
    );
  }

  const { student, semesters, courses, lessons, exams, assignments } = data as any;
  const studentName = isRTL && (student as any).name_ar ? (student as any).name_ar : student.name;
  const stageName = isRTL && student.stage?.name_ar ? student.stage.name_ar : student.stage?.name;

  const getAttendanceBadge = (type: string | null) => {
    if (type === 'online') {
      return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 gap-1 px-3 py-1"><Monitor className="h-3 w-3" /> أونلاين</Badge>;
    }
    if (type === 'center') {
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 gap-1 px-3 py-1"><Building2 className="h-3 w-3" /> سنتر</Badge>;
    }
    return <Badge variant="outline" className="gap-1 px-3 py-1">غير محدد</Badge>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getQuestionTypeLabel = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      true_false: { label: 'صح/خطأ', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
      multiple_choice: { label: 'اختيار من متعدد', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' },
      essay: { label: 'مقالي', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' },
    };
    return types[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
  };

  const getStatusIcon = (isCorrect: boolean | null) => {
    if (isCorrect === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isCorrect === false) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const stats = {
    totalCourses: courses?.length || 0,
    totalSemesters: semesters?.length || 0,
    totalLessons: lessons?.length || 0,
    totalExams: exams?.length || 0,
    totalAssignments: assignments?.length || 0,
  };

  const calculateAverageScore = (items: StudentExam[]) => {
    if (!items || items.length === 0) return 0;
    const total = items.reduce((sum, item) => sum + (item.student_mark || 0), 0);
    const totalMax = items.reduce((sum, item) => sum + item.exam.total_marks, 0);
    return totalMax > 0 ? Math.round((total / totalMax) * 100) : 0;
  };

  const examAvgScore = calculateAverageScore(exams || []);
  const assignmentAvgScore = calculateAverageScore(assignments || []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* Header with Back Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t('backToStudents') || 'رجوع للطلاب'}
          </Button>
        </div>

        {/* باقي الكود كما هو بدون تغيير - نفس الـ JSX */}
        {/* Student Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="relative overflow-hidden rounded-3xl border-0 shadow-xl">
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-cyan-600">
              <div className="absolute -bottom-8 left-6">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden">
                  {(student.imageUrl || student.image) ? (
                    <img
                      src={student.imageUrl || student.image?.file_path || `https://lms.dentin.cloud/storage/${student.image?.file_path}`}
                      alt={student.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallbackSpan = document.createElement('span');
                          fallbackSpan.className = 'text-xl font-bold text-primary';
                          fallbackSpan.textContent = student.name?.charAt(0)?.toUpperCase() || 'S';
                          parent.appendChild(fallbackSpan);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-xl font-bold text-primary">
                      {student.name?.charAt(0)?.toUpperCase() || 'S'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 pt-14">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{studentName}</h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getAttendanceBadge(student.type_of_attendance)}
                    {student.active ? (
                      <Badge className="bg-green-500 gap-1 px-3 py-1"><CheckCircle className="h-3 w-3" /> نشط</Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1 px-3 py-1"><XCircle className="h-3 w-3" /> غير نشط</Badge>
                    )}
                    <Badge variant="outline" className="gap-1 px-3 py-1">
                      <GraduationCap className="h-3 w-3" />
                      {stageName || `المرحلة ${student.stage_id}`}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-muted/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('phone') || 'الهاتف'}</p>
                    <p className="font-medium">{student.phone}</p>
                  </div>
                </div>
                {student.phone_parent && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('parentPhone') || 'هاتف ولي الأمر'}</p>
                      <p className="font-medium">{student.phone_parent}</p>
                    </div>
                  </div>
                )}
                {student.code_parent && (
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('parentCode') || 'كود ولي الأمر'}</p>
                      <p className="font-mono font-medium">{student.code_parent}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('registeredDate') || 'تاريخ التسجيل'}</p>
                    <p className="font-medium">{formatDate(student.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Cards - استمرار نفس الكود */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {[
            { label: t('courses') || 'الكورسات', value: stats.totalCourses, icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
            { label: t('semesters') || 'الترم', value: stats.totalSemesters, icon: CalendarIcon, color: 'from-purple-500 to-pink-500' },
            { label: t('lessons') || 'الدروس', value: stats.totalLessons, icon: Video, color: 'from-green-500 to-emerald-500' },
            { label: t('exams') || 'الامتحانات', value: stats.totalExams, icon: FileQuestion, color: 'from-red-500 to-rose-500' },
            { label: t('assignments') || 'الواجبات', value: stats.totalAssignments, icon: FileText, color: 'from-orange-500 to-amber-500' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative overflow-hidden rounded-xl p-3 md:p-4 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${stat.color.split(' ')[1]}20, ${stat.color.split(' ')[3]}10)` }}
            >
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="p-1.5 md:p-2 rounded-lg bg-white/20 backdrop-blur">
                  <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Average Scores */}
        {(examAvgScore > 0 || assignmentAvgScore > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examAvgScore > 0 && (
              <Card className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'متوسط درجات الامتحانات' : 'Average Exam Score'}</p>
                    <p className="text-2xl font-bold text-red-600">{examAvgScore}%</p>
                  </div>
                  <Trophy className="h-8 w-8 text-red-500 opacity-50" />
                </div>
                <Progress value={examAvgScore} className="h-2 mt-2 bg-red-200" />
              </Card>
            )}
            {assignmentAvgScore > 0 && (
              <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'متوسط درجات الواجبات' : 'Average Assignment Score'}</p>
                    <p className="text-2xl font-bold text-orange-600">{assignmentAvgScore}%</p>
                  </div>
                  <Star className="h-8 w-8 text-orange-500 opacity-50" />
                </div>
                <Progress value={assignmentAvgScore} className="h-2 mt-2 bg-orange-200" />
              </Card>
            )}
          </div>
        )}

        {/* Learning Content Tabs - نفس الكود السابق */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto rounded-2xl bg-muted/60 p-1 h-auto flex-nowrap">
            <TabsTrigger value="courses" className="rounded-xl px-4 py-2 gap-2">
              <BookOpen className="h-4 w-4" />
              {t('courses') || 'الكورسات'} ({stats.totalCourses})
            </TabsTrigger>
            <TabsTrigger value="semesters" className="rounded-xl px-4 py-2 gap-2">
              <CalendarIcon className="h-4 w-4" />
              {t('semesters') || 'الترم'} ({stats.totalSemesters})
            </TabsTrigger>
            <TabsTrigger value="lessons" className="rounded-xl px-4 py-2 gap-2">
              <Video className="h-4 w-4" />
              {t('lessons') || 'الدروس'} ({stats.totalLessons})
            </TabsTrigger>
            <TabsTrigger value="exams" className="rounded-xl px-4 py-2 gap-2">
              <FileQuestion className="h-4 w-4" />
              {t('exams') || 'الامتحانات'} ({stats.totalExams})
            </TabsTrigger>
            <TabsTrigger value="assignments" className="rounded-xl px-4 py-2 gap-2">
              <FileText className="h-4 w-4" />
              {t('assignments') || 'الواجبات'} ({stats.totalAssignments})
            </TabsTrigger>
          </TabsList>


          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-6">
            {courses?.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t('noCourses') || 'لا توجد كورسات مسجلة لهذا الطالب'}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses?.map((course: any, idx: number) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -3 }}
                  >
                    <Card className="p-4 rounded-xl hover:shadow-lg transition-all">
                      <div className="flex gap-3">
                        {course.image?.fullUrl ? (
                          <img src={course.image.fullUrl} alt={course.title} className="w-20 h-20 rounded-xl object-cover" />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{isRTL ? course.title_ar : course.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{course.hour_time_course}</span>
                            <DollarSign className="h-3 w-3 ml-1" />
                            <span>{course.price} EGP</span>
                          </div>
                          {course.progress !== undefined && (
                            <div className="mt-2">
                              <Progress value={course.progress} className="h-1" />
                              <p className="text-xs text-muted-foreground mt-1">{course.progress}% مكتمل</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Semesters Tab */}
          <TabsContent value="semesters" className="mt-6">
            {semesters?.length === 0 ? (
              <Card className="p-12 text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t('noSemesters') || 'لا توجد ترم مسجلة لهذا الطالب'}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {semesters?.map((semester: any, idx: number) => (
                  <motion.div
                    key={semester.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -3 }}
                  >
                    <Card className="p-4 rounded-xl hover:shadow-lg transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <CalendarIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{isRTL ? semester.name_ar : semester.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>السعر: {semester.price} EGP</span>
                            {semester.discount > 0 && <span>خصم: {semester.discount}%</span>}
                          </div>
                          <Badge variant={semester.active ? "default" : "secondary"} className="mt-2 text-xs">
                            {semester.active ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="mt-6">
            {lessons?.length === 0 ? (
              <Card className="p-12 text-center">
                <Video className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t('noLessons') || 'لا توجد دروس مسجلة لهذا الطالب'}</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {lessons?.map((lesson: any, idx: number) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card className="p-4 rounded-xl hover:shadow-lg transition-all">
                      <div className="flex items-start gap-4">
                        {lesson.image?.fullUrl ? (
                          <img src={lesson.image.fullUrl} alt={lesson.title} className="w-16 h-16 rounded-xl object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{isRTL ? lesson.title_ar : lesson.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{lesson.description}</p>
                            </div>
                            {lesson.attended && (
                              <Badge className="bg-green-500 gap-1">
                                <CheckCircle className="h-3 w-3" />
                                تم الحضور
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                            {lesson.lession_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(lesson.lession_date)}
                              </span>
                            )}
                            {lesson.lession_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lesson.lession_time}
                              </span>
                            )}
                            {lesson.price > 0 && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {lesson.price} EGP
                              </span>
                            )}
                          </div>
                          {lesson.content_link && lesson.content_link !== 'You must pass the exam first' && (
                            <a
                              href={lesson.content_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                            >
                              <Eye className="h-3 w-3" />
                              مشاهدة الدرس
                            </a>
                          )}
                          {lesson.content_link === 'You must pass the exam first' && (
                            <p className="text-xs text-yellow-600 flex items-center gap-1 mt-2">
                              <AlertCircle className="h-3 w-3" />
                              يجب اجتياز الامتحان أولاً
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="mt-6">
            {exams?.length === 0 ? (
              <Card className="p-12 text-center">
                <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t('noExams') || 'لا توجد امتحانات مسجلة لهذا الطالب'}</p>
              </Card>
            ) : (
              <div className="space-y-6">
                {exams?.map((exam: StudentExam, idx: number) => (
                  <motion.div
                    key={exam.exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="overflow-hidden rounded-xl">
                      {/* Exam Header */}
                      <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-b">
                        <div className="flex flex-wrap justify-between items-start gap-3">
                          <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                              <FileQuestion className="h-5 w-5 text-red-500" />
                              {exam.exam.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span>الدرجة الكلية: {exam.exam.total_marks}</span>
                              {exam.student_mark !== null && (
                                <span className="font-semibold text-red-600">
                                  درجة الطالب: {exam.student_mark} / {exam.exam.total_marks}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            امتحان
                          </Badge>
                        </div>
                      </div>

                      {/* Exam Questions */}
                      <div className="divide-y">
                        {exam.questions?.map((question, qIdx) => {
                          const typeInfo = getQuestionTypeLabel(question.question_type);
                          const isEssay = question.question_type === 'essay';
                          const needsGrading = isEssay && question.student_answer && question.mark_obtained === null;

                          return (
                            <div key={question.id} className="p-4 hover:bg-muted/20 transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      السؤال {qIdx + 1}
                                    </span>
                                    <Badge className={`text-xs ${typeInfo.color}`}>
                                      {typeInfo.label}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      {getStatusIcon(question.is_correct)}
                                      <span>({question.mark_obtained || 0}/{question.mark})</span>
                                    </div>
                                  </div>
                                  <p className="text-sm font-medium">{question.question}</p>

                                  {/* Student Answer */}
                                  {question.student_answer && (
                                    <div className="mt-2 p-2 bg-muted/30 rounded-lg">
                                      <p className="text-xs text-muted-foreground mb-1">
                                        {lang === 'ar' ? 'إجابة الطالب:' : 'Student Answer:'}
                                      </p>
                                      <p className="text-sm">{question.student_answer}</p>
                                    </div>
                                  )}

                                  {!question.student_answer && (
                                    <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                      {lang === 'ar' ? 'لم يتم تقديم إجابة' : 'No answer provided'}
                                    </p>
                                  )}
                                </div>

                                {/* Grade Essay Button */}
                                {isEssay && question.student_answer && (
                                  <Button
                                    size="sm"
                                    variant={needsGrading ? "default" : "outline"}
                                    onClick={() => openGradeModal(question, exam.exam.title)}
                                    className="shrink-0"
                                  >
                                    {needsGrading ? (
                                      <>
                                        <Edit3 className="h-3 w-3 ml-1" />
                                        {lang === 'ar' ? 'تصحيح' : 'Grade'}
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="h-3 w-3 ml-1" />
                                        {lang === 'ar' ? 'عرض التصحيح' : 'View Grade'}
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="mt-6">
            {assignments?.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t('noAssignments') || 'لا توجد واجبات مسجلة لهذا الطالب'}</p>
              </Card>
            ) : (
              <div className="space-y-6">
                {assignments?.map((assignment: StudentExam, idx: number) => (
                  <motion.div
                    key={assignment.exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="overflow-hidden rounded-xl">
                      {/* Assignment Header */}
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-b">
                        <div className="flex flex-wrap justify-between items-start gap-3">
                          <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                              <FileText className="h-5 w-5 text-orange-500" />
                              {assignment.exam.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span>الدرجة الكلية: {assignment.exam.total_marks}</span>
                              {assignment.student_mark !== null && (
                                <span className="font-semibold text-orange-600">
                                  درجة الطالب: {assignment.student_mark} / {assignment.exam.total_marks}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            واجب
                          </Badge>
                        </div>
                      </div>

                      {/* Assignment Questions */}
                      <div className="divide-y">
                        {assignment.questions?.map((question, qIdx) => {
                          const typeInfo = getQuestionTypeLabel(question.question_type);
                          const isEssay = question.question_type === 'essay';
                          const needsGrading = isEssay && question.student_answer && question.mark_obtained === null;

                          return (
                            <div key={question.id} className="p-4 hover:bg-muted/20 transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      السؤال {qIdx + 1}
                                    </span>
                                    <Badge className={`text-xs ${typeInfo.color}`}>
                                      {typeInfo.label}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      {getStatusIcon(question.is_correct)}
                                      <span>({question.mark_obtained || 0}/{question.mark})</span>
                                    </div>
                                  </div>
                                  <p className="text-sm font-medium">{question.question}</p>

                                  {/* Student Answer */}
                                  {question.student_answer && (
                                    <div className="mt-2 p-2 bg-muted/30 rounded-lg">
                                      <p className="text-xs text-muted-foreground mb-1">
                                        {lang === 'ar' ? 'إجابة الطالب:' : 'Student Answer:'}
                                      </p>
                                      <p className="text-sm">{question.student_answer}</p>
                                    </div>
                                  )}

                                  {!question.student_answer && (
                                    <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                      {lang === 'ar' ? 'لم يتم تقديم إجابة' : 'No answer provided'}
                                    </p>
                                  )}
                                </div>

                                {/* Grade Essay Button */}
                                {isEssay && question.student_answer && (
                                  <Button
                                    size="sm"
                                    variant={needsGrading ? "default" : "outline"}
                                    onClick={() => openGradeModal(question, assignment.exam.title)}
                                    className="shrink-0"
                                  >
                                    {needsGrading ? (
                                      <>
                                        <Edit3 className="h-3 w-3 ml-1" />
                                        {lang === 'ar' ? 'تصحيح' : 'Grade'}
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="h-3 w-3 ml-1" />
                                        {lang === 'ar' ? 'عرض التصحيح' : 'View Grade'}
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Grade Essay Modal */}
      <GradeEssayModal
        isOpen={gradeModalOpen}
        onClose={() => {
          setGradeModalOpen(false);
          setSelectedQuestion(null);
        }}
        question={selectedQuestion}
        examTitle={selectedExamTitle}
        onGradeSubmit={handleGradeEssay}
      />
    </motion.div>
  );
};

export default StudentLearningPage;