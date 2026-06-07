// src/pages/instructor/InstructorBankQuestions.tsx


import type { Variants } from "framer-motion";
import { toast } from '@/hooks/use-toast';
import { useTeacherMeta } from '@/hooks/useTeacherMeta';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
} from 'react';
import { useApp } from '@/contexts/AppContext';
import { bankQuestionsService } from '@/services/bank-questions.service';
import type { BankQuestion } from '@/types/bank-questions.types';
import { PageHeader } from '@/components/lms/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, ChevronLeft, ChevronRight, Filter, X, GraduationCap, BookOpen, HelpCircle, Sparkles, FileText, Grid3x3, List, Eye, Power, Zap, PowerOff, Trash2, RefreshCw, CheckCircle, XCircle, Clock, Award, TrendingUp, Users, Calendar, Settings2, ChevronDown, ChevronUp, Plus, Save, Edit2 } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';

// ✅ Types
interface QuestionFilters {
    stageId: number | null;
    subjectId: number | null;
    questionType: string | null;
    minMarks: number | null;
    maxMarks: number | null;
}

// ✅ Animations
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
};

const statsCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400 } },
    hover: { scale: 1.03, y: -3, transition: { type: "spring", stiffness: 400 } },
};

const getQuestionTypeLabel = (type: string, lang: string) => {
    switch (type) {
        case 'true_false':
            return lang === 'ar' ? 'صح/خطأ' : 'True/False';
        case 'multiple_choice':
            return lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice';
        case 'essay':
            return lang === 'ar' ? 'مقالي' : 'Essay';
        default:
            return type;
    }
};

const getQuestionTypeIcon = (type: string) => {
    switch (type) {
        case 'true_false':
            return <CheckCircle className="h-3 w-3" />;
        case 'multiple_choice':
            return <List className="h-3 w-3" />;
        case 'essay':
            return <FileText className="h-3 w-3" />;
        default:
            return <HelpCircle className="h-3 w-3" />;
    }
};

const BankQuestionCard: React.FC<{ question: BankQuestion; lang: string }> = ({ question, lang }) => {
    const isRTL = lang === 'ar';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            whileHover={{ scale: 1.02, y: -5 }}
        >
            <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-300">
                <div className="h-1 bg-gradient-to-r from-primary/70 to-secondary/70" />
                <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 gap-1">
                                    {getQuestionTypeIcon(question.question_type)}
                                    {getQuestionTypeLabel(question.question_type, lang)}
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <Award className="h-3 w-3" />
                                    {question.mark} {lang === 'ar' ? 'درجة' : 'marks'}
                                </Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <GraduationCap className="h-3 w-3" />
                                    {lang === 'ar' ? 'المرحلة:' : 'Stage:'} {question.stage}
                                </span>
                                <span className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    {lang === 'ar' ? 'المادة:' : 'Subject:'} {question.subject}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {question.createdAt}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-base font-semibold leading-relaxed">{question.question}</p>
                        {question.image?.fullUrl && (
                            <div className="mt-3">
                                <img
                                    src={question.image.fullUrl}
                                    alt={question.question}
                                    className="w-full max-h-72 object-contain rounded-xl border"
                                />
                            </div>
                        )}
                    </div>

                    {question.question_type === 'true_false' && (
                        <div className="rounded-xl border bg-muted/30 p-3">
                            <div className="text-sm">
                                <span className="font-semibold">{lang === 'ar' ? 'الإجابة الصحيحة:' : 'Correct Answer:'}</span>{' '}
                                <Badge variant={question.correct_answer === 'true' ? 'default' : 'destructive'} className="ml-2">
                                    {question.correct_answer === 'true' ? (lang === 'ar' ? 'صحيح' : 'True') : (lang === 'ar' ? 'خطأ' : 'False')}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {question.question_type === 'multiple_choice' && question.options?.length > 0 && (
                        <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
                            <div className="text-sm font-semibold">{lang === 'ar' ? 'الاختيارات' : 'Options'}</div>
                            <div className="space-y-2">
                                {question.options.map((opt, idx) => (
                                    <div key={opt.id ?? idx} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                                        <span className="w-6 h-6 rounded-full bg-primary/10 border inline-flex items-center justify-center text-xs font-semibold">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="text-sm flex-1">{opt.option_text}</span>
                                        {opt.is_correct && (
                                            <Badge className="bg-green-500/15 text-green-700 border-green-300 gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                {lang === 'ar' ? 'صحيح' : 'Correct'}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {question.question_type === 'essay' && (
                        <div className="rounded-xl border bg-muted/30 p-3">
                            <div className="text-sm">
                                <span className="font-semibold">{lang === 'ar' ? 'سؤال مقالي' : 'Essay Question'}</span>
                            </div>
                            {question.correct_answer && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">{lang === 'ar' ? 'نموذج الإجابة:' : 'Model Answer:'}</span> {question.correct_answer}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export const InstructorBankQuestions: React.FC = () => {
    const { t, lang, user } = useApp();
    const { stages, subjects } = useTeacherMeta(user?.id);

    const isRTL = lang === 'ar';
    const [searchParams, setSearchParams] = useSearchParams();

    // ✅ State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<BankQuestion[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // ✅ Filter State
    const [filters, setFilters] = useState<QuestionFilters>({
        stageId: null,
        subjectId: null,
        questionType: null,
        minMarks: null,
        maxMarks: null,
    });

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

    // ✅ Saved Filters from localStorage
    const [savedFilters, setSavedFilters] = useState<QuestionFilters | null>(null);

    // ✅ Stats
    const stats = useMemo(() => ({
        total: pagination.total || 0,
        trueFalse: questions.filter(q => q.question_type === 'true_false').length,
        multipleChoice: questions.filter(q => q.question_type === 'multiple_choice').length,
        essay: questions.filter(q => q.question_type === 'essay').length,
        totalMarks: questions.reduce((sum, q) => sum + Number(q.mark), 0),
    }), [questions, pagination.total]);

    // ✅ Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ✅ Load saved filters from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('bankQuestionFilters');
        if (!saved) return;

        try {
            const parsed = JSON.parse(saved);

            if (JSON.stringify(parsed) !== JSON.stringify(filters)) {
                setFilters(parsed);
                setSavedFilters(parsed);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);
    // ✅ Sync filters with URL
    useEffect(() => {
        const urlFilters: QuestionFilters = {
            stageId: searchParams.get('stage') ? Number(searchParams.get('stage')) : null,
            subjectId: searchParams.get('subject') ? Number(searchParams.get('subject')) : null,
            questionType: searchParams.get('type') || null,
            minMarks: searchParams.get('minMarks') ? Number(searchParams.get('minMarks')) : null,
            maxMarks: searchParams.get('maxMarks') ? Number(searchParams.get('maxMarks')) : null,
        };

        const hasAny =
            urlFilters.stageId ||
            urlFilters.subjectId ||
            urlFilters.questionType ||
            urlFilters.minMarks ||
            urlFilters.maxMarks;

        if (hasAny) {
            setFilters(prev => ({
                ...prev,
                ...urlFilters
            }));
        }
    }, [searchParams]);
    // ✅ Build API filters




    // ✅ Fetch Questions
    const fetchQuestions = useCallback(async (page = 1) => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);

        try {
            const response = await bankQuestionsService.getAllBankQuestions({
                page,
                perPage: pagination.perPage,
                teacher_id: user.id,
                stage_id: filters.stageId || undefined,
                subject_id: filters.subjectId || undefined,
                question_type: filters.questionType || undefined,
                min_mark: filters.minMarks || undefined,
                max_mark: filters.maxMarks || undefined,
                search: debouncedSearch || undefined,
            });

            setQuestions(response.data || []);
            setPagination(prev => ({
                ...prev,
                currentPage: response.meta?.current_page ?? page,
                lastPage: response.meta?.last_page ?? 1,
                total: response.meta?.total ?? 0,
                perPage: response.meta?.per_page ?? prev.perPage,
            }));
        } catch (err: any) {
            setError(err?.message || 'Error loading questions');
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id, filters, debouncedSearch]);

    useEffect(() => {
        fetchQuestions(1);
    }, [fetchQuestions]);



    // ✅ أضف flag عشان تتجنب الـ circular update
    const isApplyingFilters = useRef(false);

    const applyFilters = () => {
        isApplyingFilters.current = true; // 🔒 lock
        localStorage.setItem('bankQuestionFilters', JSON.stringify(filters));
        setSavedFilters(filters);

        const newParams = new URLSearchParams();
        if (filters.stageId) newParams.set('stage', String(filters.stageId));
        if (filters.subjectId) newParams.set('subject', String(filters.subjectId));
        if (filters.questionType) newParams.set('type', filters.questionType);
        if (filters.minMarks) newParams.set('minMarks', String(filters.minMarks));
        if (filters.maxMarks) newParams.set('maxMarks', String(filters.maxMarks));

        setSearchParams(newParams);
        setShowFilters(false);

        setTimeout(() => { isApplyingFilters.current = false; }, 100); // 🔓 unlock
    };

    // ✅ الـ URL sync effect مع الـ lock
    useEffect(() => {
        if (isApplyingFilters.current) return; // ← تجاهل لو إحنا اللي غيرنا الـ URL

        const urlFilters: QuestionFilters = {
            stageId: searchParams.get('stage') ? Number(searchParams.get('stage')) : null,
            subjectId: searchParams.get('subject') ? Number(searchParams.get('subject')) : null,
            questionType: searchParams.get('type') || null,
            minMarks: searchParams.get('minMarks') ? Number(searchParams.get('minMarks')) : null,
            maxMarks: searchParams.get('maxMarks') ? Number(searchParams.get('maxMarks')) : null,
        };

        const hasAny = urlFilters.stageId || urlFilters.subjectId ||
            urlFilters.questionType || urlFilters.minMarks || urlFilters.maxMarks;

        if (hasAny) {
            setFilters(prev => ({ ...prev, ...urlFilters }));
        }
    }, [searchParams]);
    const clearFilters = () => {
        const reset = {
            stageId: null,
            subjectId: null,
            questionType: null,
            minMarks: null,
            maxMarks: null,
        };
        setFilters(reset);
        setSavedFilters(null);
        localStorage.removeItem('bankQuestionFilters');
        setSearchParams({});
    };
    // ✅ Load saved filters
    const loadSavedFilters = () => {
        if (savedFilters) {
            setFilters(savedFilters);
            fetchQuestions(1);
            toast.success(lang === 'ar' ? 'تم تحميل الفلاتر المحفوظة' : 'Saved filters loaded');
        }
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > pagination.lastPage) return;
        fetchQuestions(page);
    };

    // ✅ Question Type Options for Filter
    const questionTypeOptions = [
        { value: 'true_false', label: lang === 'ar' ? 'صح/خطأ' : 'True/False' },
        { value: 'multiple_choice', label: lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice' },
        { value: 'essay', label: lang === 'ar' ? 'مقالي' : 'Essay' },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
        >
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

                {/* ✅ Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-xl opacity-60" />
                                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                                    <HelpCircle className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    {lang === 'ar' ? 'بنك الأسئلة' : 'Bank Questions'}
                                </h1>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <Sparkles className="h-3 w-3" />
                                    {pagination.total} {lang === 'ar' ? 'سؤال' : 'questions'} • {stats.totalMarks} {lang === 'ar' ? 'درجة' : 'marks'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex bg-muted/50 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 px-3 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                                    ? 'bg-white dark:bg-gray-800 text-primary shadow-md'
                                    : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                                    }`}
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 px-3 rounded-lg transition-all duration-300 ${viewMode === 'table'
                                    ? 'bg-white dark:bg-gray-800 text-primary shadow-md'
                                    : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                                    }`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Export Button */}
                        <ExportExcelButton
                            data={questions}
                            fileName="bank-questions"
                            label={lang === 'ar' ? 'تصدير' : 'Export'}
                            disabled={loading || questions.length === 0}
                        />
                    </div>
                </motion.div>

                {/* ✅ Stats Cards */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: lang === 'ar' ? 'إجمالي الأسئلة' : 'Total Questions', value: stats.total, icon: HelpCircle, color: 'from-blue-500 to-cyan-500', delay: 0 },
                        { label: lang === 'ar' ? 'صح/خطأ' : 'True/False', value: stats.trueFalse, icon: CheckCircle, color: 'from-green-500 to-emerald-500', delay: 0.1 },
                        { label: lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice', value: stats.multipleChoice, icon: List, color: 'from-purple-500 to-pink-500', delay: 0.2 },
                        { label: lang === 'ar' ? 'مقالي' : 'Essay', value: stats.essay, icon: FileText, color: 'from-orange-500 to-red-500', delay: 0.3 },
                        { label: lang === 'ar' ? 'إجمالي الدرجات' : 'Total Marks', value: stats.totalMarks, icon: Award, color: 'from-yellow-500 to-amber-500', delay: 0.4 },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            variants={statsCardVariants}
                            whileHover="hover"
                            className="relative overflow-hidden rounded-xl bg-gradient-to-r p-4 shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${stat.color.split(' ')[1]}20, ${stat.color.split(' ')[3]}10)` }}
                        >
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    <motion.p
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: stat.delay, type: "spring" }}
                                        className="text-2xl font-bold mt-1"
                                    >
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
                                placeholder={lang === 'ar' ? 'بحث عن سؤال...' : 'Search questions...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`${isRTL ? 'pr-9' : 'pl-9'} rounded-xl bg-white dark:bg-gray-800 h-11`}
                            />
                        </div>

                        <div className="flex gap-2">
                            {/* Filter Toggle Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2.5 rounded-xl border transition-all duration-300 ${showFilters
                                    ? 'bg-primary text-white border-primary shadow-md'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary'
                                    }`}
                            >
                                <Filter className="h-4 w-4" />
                            </motion.button>

                            {/* Load Saved Filters Button */}
                            {savedFilters && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={loadSavedFilters}
                                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary transition-all"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* ✅ Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                className="overflow-hidden"
                            >
                                <Card className="p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-xl rounded-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                        {/* Stage Filter */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-1 text-sm font-medium">
                                                <GraduationCap className="h-4 w-4 text-primary" />
                                                {lang === 'ar' ? 'المرحلة' : 'Stage'}
                                            </Label>
                                            <select
                                                value={filters.stageId || ''}
                                                onChange={(e) =>
                                                    setFilters(prev => ({
                                                        ...prev,
                                                        stageId: e.target.value ? Number(e.target.value) : null
                                                    }))
                                                }
                                                className="w-full rounded-xl border px-3 py-2 text-sm bg-background"
                                            >
                                                <option value="">
                                                    {lang === 'ar' ? 'جميع المراحل' : 'All Stages'}
                                                </option>

                                                {stages.map((stage: any) => (
                                                    <option key={stage.id} value={stage.id}>
                                                        {stage.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Subject Filter */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-1 text-sm font-medium">
                                                <BookOpen className="h-4 w-4 text-primary" />
                                                {lang === 'ar' ? 'المادة' : 'Subject'}
                                            </Label>
                                            <select
                                                value={filters.subjectId || ''}
                                                onChange={(e) =>
                                                    setFilters(prev => ({
                                                        ...prev,
                                                        subjectId: e.target.value ? Number(e.target.value) : null
                                                    }))
                                                }
                                                className="w-full rounded-xl border px-3 py-2 text-sm bg-background"
                                            >
                                                <option value="">
                                                    {lang === 'ar' ? 'جميع المواد' : 'All Subjects'}
                                                </option>

                                                {subjects
                                                    .filter((s: any) => !filters.stageId || s.stage_id === filters.stageId)
                                                    .map((subject: any) => (
                                                        <option key={subject.id} value={subject.id}>
                                                            {subject.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        {/* Question Type Filter */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-1 text-sm font-medium">
                                                <HelpCircle className="h-4 w-4 text-primary" />
                                                {lang === 'ar' ? 'نوع السؤال' : 'Question Type'}
                                            </Label>
                                            <select
                                                value={filters.questionType || ''}
                                                onChange={(e) => setFilters(prev => ({ ...prev, questionType: e.target.value || null }))}
                                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                <option value="">{lang === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
                                                {questionTypeOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Marks Range */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-1 text-sm font-medium">
                                                <Award className="h-4 w-4 text-primary" />
                                                {lang === 'ar' ? 'نطاق الدرجات' : 'Marks Range'}
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    placeholder={lang === 'ar' ? 'من' : 'From'}
                                                    value={filters.minMarks || ''}
                                                    onChange={(e) => setFilters(prev => ({ ...prev, minMarks: e.target.value ? Number(e.target.value) : null }))}
                                                    className="rounded-xl"
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder={lang === 'ar' ? 'إلى' : 'To'}
                                                    value={filters.maxMarks || ''}
                                                    onChange={(e) => setFilters(prev => ({ ...prev, maxMarks: e.target.value ? Number(e.target.value) : null }))}
                                                    className="rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filter Actions */}
                                    <div className="flex justify-end gap-3 mt-5 pt-3 border-t">
                                        <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                                            <X className="h-4 w-4" />
                                            {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
                                        </Button>
                                        <Button size="sm" onClick={applyFilters} className="gap-2 bg-gradient-to-r from-primary to-secondary">
                                            <Search className="h-4 w-4" />
                                            {lang === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
                                        </Button>
                                    </div>

                                    {/* Active Filters Display */}
                                    {(filters.stageId || filters.subjectId || filters.questionType || filters.minMarks || filters.maxMarks) && (
                                        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                                            <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'الفلاتر النشطة:' : 'Active Filters:'}</span>
                                            {filters.stageId && <Badge variant="secondary" className="gap-1 text-xs"><GraduationCap className="h-3 w-3" /> {lang === 'ar' ? 'المرحلة' : 'Stage'}</Badge>}
                                            {filters.subjectId && <Badge variant="secondary" className="gap-1 text-xs"><BookOpen className="h-3 w-3" /> {lang === 'ar' ? 'المادة' : 'Subject'}</Badge>}
                                            {filters.questionType && <Badge variant="secondary" className="gap-1 text-xs"><HelpCircle className="h-3 w-3" /> {questionTypeOptions.find(o => o.value === filters.questionType)?.label}</Badge>}
                                            {(filters.minMarks || filters.maxMarks) && (
                                                <Badge variant="secondary" className="gap-1 text-xs">
                                                    <Award className="h-3 w-3" /> {filters.minMarks || 0} - {filters.maxMarks || '∞'}
                                                </Badge>
                                            )}
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
                        <p className="text-muted-foreground mt-4">{lang === 'ar' ? 'جاري تحميل الأسئلة...' : 'Loading questions...'}</p>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive" className="rounded-xl">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!loading && !error && questions.length === 0 && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                            <HelpCircle className="h-12 w-12 text-primary/40" />
                        </div>
                        <p className="text-muted-foreground mb-4 text-lg">
                            {lang === 'ar' ? 'لا توجد أسئلة في بنك الأسئلة' : 'No questions in bank'}
                        </p>
                    </motion.div>
                )}

                {/* ✅ Grid View */}
                {!loading && !error && questions.length > 0 && viewMode === 'grid' && (
                    <>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            <AnimatePresence mode="popLayout">
                                {questions.map((question) => (
                                    <BankQuestionCard key={question.id} question={question} lang={lang} />
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* Pagination */}
                        {pagination.lastPage > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-8 pb-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full w-10 h-10"
                                    onClick={() => goToPage(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                >
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
                                            <Button
                                                key={pageNum}
                                                variant={pagination.currentPage === pageNum ? 'default' : 'outline'}
                                                size="icon"
                                                className="rounded-full w-10 h-10"
                                                onClick={() => goToPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full w-10 h-10"
                                    onClick={() => goToPage(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.lastPage}
                                >
                                    <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* ✅ Table View */}
                {!loading && !error && questions.length > 0 && viewMode === 'table' && (
                    <Card className="rounded-2xl overflow-hidden shadow-xl border-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50">
                                    <tr>
                                        <th className="px-5 py-4 text-right text-sm font-semibold">{lang === 'ar' ? 'السؤال' : 'Question'}</th>
                                        <th className="px-5 py-4 text-center text-sm font-semibold hidden md:table-cell">{lang === 'ar' ? 'النوع' : 'Type'}</th>
                                        <th className="px-5 py-4 text-center text-sm font-semibold">{lang === 'ar' ? 'الدرجة' : 'Marks'}</th>
                                        <th className="px-5 py-4 text-center text-sm font-semibold hidden lg:table-cell">{lang === 'ar' ? 'المرحلة' : 'Stage'}</th>
                                        <th className="px-5 py-4 text-center text-sm font-semibold hidden xl:table-cell">{lang === 'ar' ? 'المادة' : 'Subject'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {questions.map((question, idx) => (
                                        <motion.tr
                                            key={question.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 overflow-hidden shrink-0 flex items-center justify-center">
                                                        {getQuestionTypeIcon(question.question_type)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold line-clamp-1 max-w-md">{question.question}</p>
                                                        {question.image?.fullUrl && (
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {lang === 'ar' ? 'يوجد صورة' : 'Has image'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <Badge variant="secondary" className="gap-1">
                                                    {getQuestionTypeIcon(question.question_type)}
                                                    {getQuestionTypeLabel(question.question_type, lang)}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full text-sm">
                                                    {question.mark}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center hidden lg:table-cell">
                                                <span className="text-sm">{question.stage}</span>
                                            </td>
                                            <td className="px-5 py-4 text-center hidden xl:table-cell">
                                                <span className="text-sm">{question.subject}</span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination for Table */}
                        {pagination.lastPage > 1 && (
                            <div className="flex items-center justify-center gap-3 py-4 border-t">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => goToPage(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm">
                                    {pagination.currentPage} / {pagination.lastPage}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => goToPage(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.lastPage}
                                >
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