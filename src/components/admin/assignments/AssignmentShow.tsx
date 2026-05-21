/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/assignments/AssignmentShow.tsx

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { assignmentService } from "@/services/assignment.service";
import { examService } from "@/services/exam.service";
import {
  ArrowLeft,
  FileText,
  Clock,
  Star,
  User,
  BookOpen,
  Layers3,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Shuffle,
  ListOrdered,
  Eye,
  Power,
  Settings2,
  ChevronDown,
  ChevronUp,
  Trophy,
  HelpCircle,
  Loader2,
  Edit2,
  Trash2,
  Share2,
  Download,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
import { toast } from "sonner";

interface AssignmentShowProps {
  assignmentId: number;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDarkMode?: boolean;
}

export const AssignmentShow: React.FC<AssignmentShowProps> = ({
  assignmentId,
  onBack,
  onEdit,
  onDelete,
  isDarkMode = false,
}) => {
  const { lang, user, isInstructor } = useApp();
  const isRTL = lang === "ar";

  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSettings, setExpandedSettings] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  // ✅ جلب البيانات
  const fetchAssignment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await examService.getExam(assignmentId);
      setAssignment(response);
    } catch (err: any) {
      console.error("Error fetching assignment:", err);
      setError(err.message || "Failed to load assignment");
      toast.error(lang === "ar" ? "حدث خطأ في تحميل الواجب" : "Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  // ✅ تنسيق التاريخ
  const formatDate = (date?: string) => {
    if (!date) return "—";
    return format(new Date(date), "dd MMM yyyy", {
      locale: lang === "ar" ? arSA : enUS,
    });
  };

  // ✅ تنسيق الوقت
  const formatDateTime = (date?: string) => {
    if (!date) return "—";
    return format(new Date(date), "dd MMM yyyy - hh:mm a", {
      locale: lang === "ar" ? arSA : enUS,
    });
  };

  // ✅ تبديل عرض السؤال
  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // ✅ عرض حالة التحميل
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-orange-500 border-t-transparent"
        />
        <p className={`mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          {lang === "ar" ? "جاري تحميل الواجب..." : "Loading assignment..."}
        </p>
      </div>
    );
  }

  // ✅ عرض الخطأ
  if (error || !assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <HelpCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
          <p className={`mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {error || (lang === "ar" ? "الواجب غير موجود" : "Assignment not found")}
          </p>
          {onBack && (
            <Button onClick={onBack} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {lang === "ar" ? "العودة" : "Back"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const totalQuestions = assignment.questions?.length || 0;
  const totalMarks = assignment.total_marks || 0;
  const passMarks = assignment.total_must_pass_marks || 0;
  const passPercentage = totalMarks > 0 ? (passMarks / totalMarks) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <motion.button
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className={`p-2 rounded-xl transition-colors ${
                isDarkMode
                  ? "hover:bg-white/10 text-gray-400"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
            </motion.button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className={`${
                  assignment.type === "assignment"
                    ? "bg-gradient-to-r from-orange-500 to-pink-500"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500"
                }`}
              >
                {assignment.type === "assignment"
                  ? lang === "ar"
                    ? "واجب"
                    : "Assignment"
                  : lang === "ar"
                  ? "امتحان"
                  : "Exam"}
              </Badge>
              <Badge
                variant={assignment.active ? "success" : "secondary"}
                className="gap-1"
              >
                {assignment.active ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {assignment.active
                  ? lang === "ar"
                    ? "نشط"
                    : "Active"
                  : lang === "ar"
                  ? "غير نشط"
                  : "Inactive"}
              </Badge>
            </div>
            <h1
              className={`text-3xl md:text-4xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {isRTL && assignment.title_ar ? assignment.title_ar : assignment.title}
            </h1>
            <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {isRTL && assignment.description_ar
                ? assignment.description_ar
                : assignment.description}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className={`p-3 rounded-xl transition-all ${
                isDarkMode
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Edit2 className="w-5 h-5" />
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="p-3 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* ================= HERO IMAGE ================= */}
      {assignment.image?.fullUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <img
            src={assignment.image.fullUrl}
            alt={assignment.title}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </motion.div>
      )}

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label={lang === "ar" ? "الأسئلة" : "Questions"}
          value={totalQuestions}
          color="blue"
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label={lang === "ar" ? "الدرجة الكلية" : "Total Marks"}
          value={totalMarks}
          color="yellow"
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label={lang === "ar" ? "درجة النجاح" : "Pass Marks"}
          value={`${passMarks} (${passPercentage.toFixed(0)}%)`}
          color="green"
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label={lang === "ar" ? "المدة" : "Duration"}
          value={`${assignment.duration_minutes} ${lang === "ar" ? "دقيقة" : "min"}`}
          color="purple"
          isDarkMode={isDarkMode}
        />
      </div>

      {/* ================= TABS ================= */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className={`grid w-full grid-cols-3 ${
            isDarkMode ? "bg-white/5" : "bg-gray-100"
          }`}
        >
          <TabsTrigger value="overview">
            {lang === "ar" ? "نظرة عامة" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="questions">
            {lang === "ar" ? "الأسئلة" : "Questions"} ({totalQuestions})
          </TabsTrigger>
          <TabsTrigger value="settings">
            {lang === "ar" ? "الإعدادات" : "Settings"}
          </TabsTrigger>
        </TabsList>

        {/* ================= OVERVIEW TAB ================= */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <InfoCard
              icon={<User className="w-5 h-5" />}
              label={lang === "ar" ? "المعلم" : "Teacher"}
              value={
                assignment.teacher_id?.name || assignment.teacher?.name || "—"
              }
              isDarkMode={isDarkMode}
            />
            <InfoCard
              icon={<BookOpen className="w-5 h-5" />}
              label={lang === "ar" ? "الدرس" : "Lesson"}
              value={
                isRTL
                  ? assignment.course_detail?.title_ar || assignment.course_detail?.title
                  : assignment.course_detail?.title
              }
              isDarkMode={isDarkMode}
            />
            <InfoCard
              icon={<Layers3 className="w-5 h-5" />}
              label={lang === "ar" ? "المرحلة" : "Stage"}
              value={
                isRTL
                  ? assignment.stage_id?.name_ar || assignment.stage_id?.name
                  : assignment.stage_id?.name
              }
              isDarkMode={isDarkMode}
            />
            <InfoCard
              icon={<Calendar className="w-5 h-5" />}
              label={lang === "ar" ? "تاريخ الإنشاء" : "Created At"}
              value={formatDateTime(assignment.created_at)}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Progress Bar for Pass Marks */}
          <Card className={isDarkMode ? "bg-white/5" : "bg-white"}>
            <CardContent className="p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>{lang === "ar" ? "نسبة النجاح" : "Pass Rate"}</span>
                <span>{passPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={passPercentage} className="h-2" />
              <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                {lang === "ar"
                  ? `الدرجة المطلوبة للنجاح: ${passMarks} من ${totalMarks}`
                  : `Required to pass: ${passMarks} out of ${totalMarks}`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= QUESTIONS TAB ================= */}
        <TabsContent value="questions" className="space-y-4 mt-4">
          {totalQuestions === 0 ? (
            <Card className={`p-12 text-center ${isDarkMode ? "bg-white/5" : "bg-white"}`}>
              <HelpCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                {lang === "ar" ? "لا توجد أسئلة في هذا الواجب" : "No questions in this assignment"}
              </p>
            </Card>
          ) : (
            assignment.questions.map((question: any, idx: number) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={idx}
                isExpanded={expandedQuestions[question.id]}
                onToggle={() => toggleQuestion(question.id)}
                isDarkMode={isDarkMode}
                lang={lang}
              />
            ))
          )}
        </TabsContent>

        {/* ================= SETTINGS TAB ================= */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card className={isDarkMode ? "bg-white/5" : "bg-white"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                {lang === "ar" ? "إعدادات الواجب" : "Assignment Settings"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Random Questions */}
              <SettingRow
                icon={<Shuffle className="w-4 h-4" />}
                label={lang === "ar" ? "ترتيب عشوائي للأسئلة" : "Random Questions"}
                description={
                  lang === "ar"
                    ? "عرض الأسئلة بترتيب عشوائي لكل طالب"
                    : "Display questions in random order for each student"
                }
                value={assignment.random_questions || false}
                isDarkMode={isDarkMode}
              />

              {/* Random Answers */}
              <SettingRow
                icon={<ListOrdered className="w-4 h-4" />}
                label={lang === "ar" ? "ترتيب عشوائي للإجابات" : "Random Answers"}
                description={
                  lang === "ar"
                    ? "عرض الإجابات بترتيب عشوائي لكل طالب"
                    : "Display answers in random order for each student"
                }
                value={assignment.random_answers || false}
                isDarkMode={isDarkMode}
              />

              {/* Show Result */}
              <SettingRow
                icon={<Eye className="w-4 h-4" />}
                label={lang === "ar" ? "إظهار النتيجة للطلاب" : "Show Result to Students"}
                description={
                  lang === "ar"
                    ? "إظهار النتيجة للطلاب بعد الانتهاء من الواجب"
                    : "Show result to students after completing the assignment"
                }
                value={assignment.show_result || false}
                isDarkMode={isDarkMode}
              />

              {/* Active */}
              <SettingRow
                icon={<Power className="w-4 h-4" />}
                label={lang === "ar" ? "تفعيل الواجب" : "Active"}
                description={
                  lang === "ar"
                    ? "تفعيل أو تعطيل الواجب للطلاب"
                    : "Enable or disable the assignment for students"
                }
                value={assignment.active || false}
                isDarkMode={isDarkMode}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

// ================= STAT CARD COMPONENT =================
const StatCard = ({ icon, label, value, color, isDarkMode }: any) => {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-500 to-cyan-500",
    yellow: "from-yellow-500 to-orange-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`p-4 rounded-2xl ${
        isDarkMode ? "bg-white/5" : "bg-white"
      } border ${isDarkMode ? "border-white/10" : "border-gray-200"}`}
    >
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        {value}
      </p>
      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
        {label}
      </p>
    </motion.div>
  );
};

// ================= INFO CARD COMPONENT =================
const InfoCard = ({ icon, label, value, isDarkMode }: any) => {
  return (
    <Card className={isDarkMode ? "bg-white/5" : "bg-white"}>
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className={`p-2 rounded-xl ${
            isDarkMode ? "bg-white/10" : "bg-gray-100"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
            {label}
          </p>
          <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// ================= SETTING ROW COMPONENT =================
const SettingRow = ({ icon, label, description, value, isDarkMode }: any) => {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl ${
        isDarkMode ? "bg-white/5" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-xl ${
            isDarkMode ? "bg-white/10" : "bg-white"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {label}
          </p>
          <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
            {description}
          </p>
        </div>
      </div>
      <Badge
        variant={value ? "success" : "secondary"}
        className={value ? "bg-green-500" : ""}
      >
        {value ? (label.includes("عشوائي") ? "مفعل" : "نشط") : label.includes("عشوائي") ? "غير مفعل" : "غير نشط"}
      </Badge>
    </div>
  );
};

// ================= QUESTION CARD COMPONENT =================
const QuestionCard = ({ question, index, isExpanded, onToggle, isDarkMode, lang }: any) => {
  const isRTL = lang === "ar";

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "true_false":
        return "🔘";
      case "multiple_choice":
        return "📝";
      case "essay":
        return "📄";
      default:
        return "❓";
    }
  };

  const getQuestionTypeText = (type: string) => {
    if (lang === "ar") {
      switch (type) {
        case "true_false":
          return "صح / خطأ";
        case "multiple_choice":
          return "اختيار من متعدد";
        case "essay":
          return "مقالي";
        default:
          return type;
      }
    }
    switch (type) {
      case "true_false":
        return "True / False";
      case "multiple_choice":
        return "Multiple Choice";
      case "essay":
        return "Essay";
      default:
        return type;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={isDarkMode ? "bg-white/5" : "bg-white"}>
        <div
          className="p-4 cursor-pointer flex items-center justify-between"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isDarkMode
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {index + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{getQuestionTypeIcon(question.question_type)}</span>
                <Badge variant="outline" className="text-xs">
                  {getQuestionTypeText(question.question_type)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {question.mark} {lang === "ar" ? "درجات" : "marks"}
                </Badge>
              </div>
              <p className={`mt-1 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {question.question}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4"
            >
              {question.question_type === "true_false" && (
                <div className="flex gap-4 mt-2">
                  <Badge
                    variant={question.correct_answer === "true" ? "success" : "secondary"}
                    className="gap-1"
                  >
                    ✅ True
                  </Badge>
                  <Badge
                    variant={question.correct_answer === "false" ? "success" : "secondary"}
                    className="gap-1"
                  >
                    ❌ False
                  </Badge>
                </div>
              )}

              {question.question_type === "multiple_choice" && question.options && (
                <div className="space-y-2 mt-2">
                  {question.options.map((opt: any, optIdx: number) => (
                    <div
                      key={optIdx}
                      className={`p-2 rounded-lg flex items-center gap-2 ${
                        opt.is_correct
                          ? isDarkMode
                            ? "bg-green-500/20 text-green-400"
                            : "bg-green-100 text-green-700"
                          : isDarkMode
                          ? "bg-white/5"
                          : "bg-gray-50"
                      }`}
                    >
                      <span className="text-sm">{String.fromCharCode(65 + optIdx)}.</span>
                      <span>{opt.option_text}</span>
                      {opt.is_correct && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {question.question_type === "essay" && (
                <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {lang === "ar"
                    ? "سؤال مقالي - يحتاج إلى إجابة نصية"
                    : "Essay question - requires text answer"}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};