/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
  useCallback,
  useEffect,
  useMemo,
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const getQuestionTypeLabel = (type: string) => {
    switch (type) {
        case 'true_false':
            return 'True/False';
        case 'multiple_choice':
            return 'Multiple Choice';
        case 'essay':
            return 'Essay';
        default:
            return type;
    }
};

const BankQuestionCard: React.FC<{ question: BankQuestion }> = ({ question }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
            <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/80 shadow-lg">
                <div className="h-1 bg-gradient-to-r from-primary/70 to-secondary/70" />
                <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                    {getQuestionTypeLabel(question.question_type)}
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    {question.mark} marks
                                </Badge>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">Subject:</span> {question.subject} •{' '}
                                <span className="font-semibold text-foreground">Stage:</span> {question.stage}
                            </p>
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
                                <span className="font-semibold">Correct Answer:</span>{' '}
                                <span className="font-medium">{question.correct_answer ?? '-'}</span>
                            </div>
                        </div>
                    )}

                    {question.question_type === 'multiple_choice' && question.options?.length > 0 && (
                        <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
                            <div className="text-sm font-semibold">Options</div>
                            <div className="space-y-1">
                                {question.options.map((opt, idx) => (
                                    <div key={opt.id ?? idx} className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-background border inline-flex items-center justify-center text-xs">
                                            {idx + 1}
                                        </span>
                                        <span className="text-sm flex-1">{opt.option_text}</span>
                                        {opt.is_correct && (
                                            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300">
                                                Correct
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
                                <span className="font-semibold">Essay question</span>
                            </div>
                            {question.correct_answer && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Model Answer:</span> {question.correct_answer}
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
    const isRTL = lang === 'ar';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [questions, setQuestions] = useState<BankQuestion[]>([]);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 10,
    });

    // Optional search (backend may ignore it, but safe if backend supports)
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchQuestions = useCallback(
        async (page = 1) => {
            setLoading(true);
            setError(null);
            try {
                const res = await bankQuestionsService.getAllBankQuestions({
                    page,
                    perPage: pagination.perPage,
                        teacher_id: user?.id,
                    ...(debouncedSearch ? { search: debouncedSearch } : {}),
                });

                setQuestions(res.data || []);
                setPagination({
                    currentPage: res.meta?.current_page ?? page,
                    lastPage: res.meta?.last_page ?? 1,
                    total: res.meta?.total ?? 0,
                    perPage: res.meta?.per_page ?? pagination.perPage,
                });
            } catch (e: any) {
                setError(e?.message || 'Failed to fetch bank questions');
                setQuestions([]);
            } finally {
                setLoading(false);
            }
        },
        [debouncedSearch, pagination.perPage]
    );

    useEffect(() => 
        { if (!user) return; startTransition(() => { void fetchQuestions(1); }); 
}, [fetchQuestions, user]);

    const goToPage = (page: number) => {
        if (page < 1 || page > pagination.lastPage) return;
        void fetchQuestions(page);
    };

    const headerTitle = lang === 'ar' ? 'بنك الأسئلة' : 'Bank Questions';

    return (
        <div className="space-y-6">
            <PageHeader
                title={headerTitle}
                description={lang === 'ar' ? 'استعرض أسئلة البنك مع Pagination' : 'Browse question bank with pagination'}
                actions={
                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <Search
                                className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`}
                            />
                            <Input
                                placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`${isRTL ? 'pr-9' : 'pl-9'} w-64 rounded-xl`}
                            />
                        </div>
                    </div>
                }
            />

            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            )}

            {error && (
                <Alert variant="destructive" className="rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!loading && !error && questions.length === 0 && (
                <div className="flex justify-center py-16">
                    <Card className="p-10 max-w-xl w-full text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <span className="text-2xl">?</span>
                        </div>
                        <p className="mt-4 text-muted-foreground">{lang === 'ar' ? 'لا توجد أسئلة بعد' : 'No questions found'}</p>
                    </Card>
                </div>
            )}

            {!loading && !error && questions.length > 0 && (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    {questions.map((q) => (
                        <BankQuestionCard key={q.id} question={q} />
                    ))}
                </motion.div>
            )}

            {pagination.lastPage > 1 && (
                <div className="flex items-center justify-center gap-3 py-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-10 h-10"
                        onClick={() => goToPage(pagination.currentPage - 1)}
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
                        onClick={() => goToPage(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.lastPage}
                    >
                        <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </Button>
                </div>
            )}
        </div>
    );
};

