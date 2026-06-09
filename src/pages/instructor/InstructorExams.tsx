/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/exams/index.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useTeacherMeta } from '@/hooks/useTeacherMeta';
import { examService } from '@/services/exam.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Filter, Plus, Grid3x3, List, RefreshCw, Sparkles, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';

// Components
import { StatsCards } from '@/components/exams/StatsCards';
import { ExamCard } from '@/components/exams/ExamCard';
import { ExamResultCard } from '@/components/exams/ExamResultCard';
import { ExamForm } from '@/components/exams/ExamForm';
import { QuestionBuilder } from '@/components/exams/QuestionBuilder';
import { ExamViewer } from '@/components/exams/ExamViewer';
import { FiltersPanel } from '@/components/exams/FiltersPanel';
import  ExamsTable from '@/components/exams/ExamsTable';

// Hooks
import { useExams } from '@/hooks/useExams';
import { useExamFilters } from '@/hooks/useExamFilters';

// Types
import type { ExamFilters } from '@/types/exam.types';

// Animations
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

export const InstructorExams: React.FC = () => {
  const { t, lang, user } = useApp();
  const { id: examIdFromUrl } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isRTL = lang === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'exams' | 'questions' | 'form' | 'view'>('exams');
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Hooks
  const { stages } = useTeacherMeta(user?.id);
  const { exams, loading, error, pagination, fetchExams, deleteExam, toggleRandomQuestions, toggleRandomAnswers, setExams, toggleShowResult } = useExams(user?.id || 0, 12);
  const { filters, setFilters, savedFilters, applyFilters, clearFilters, loadSavedFilters } = useExamFilters(fetchExams);

  // Stats
  const stats = useMemo(() => ({
    total: pagination.total || 0,
    active: exams.filter(e => e.active === 1).length,
    inactive: exams.filter(e => e.active === 0).length,
    avgMarks: exams.length > 0 ? Math.round(exams.reduce((sum, e) => sum + (e.total_marks || 0), 0) / exams.length) : 0,
  }), [exams, pagination.total]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch exams when dependencies change
  useEffect(() => {
    const apiFilters: any = {};
    if (filters.stageId) apiFilters.stage_id = filters.stageId;
    if (filters.lessonId) apiFilters.course_detail_id = filters.lessonId;
    if (filters.marksMin) apiFilters.total_marks = filters.marksMin;
    
    fetchExams(1, apiFilters, debouncedSearch);
  }, [fetchExams, filters, debouncedSearch]);

  // Check URL param for exam ID
  useEffect(() => {
    if (examIdFromUrl) {
      const exam = exams.find(e => e.id === Number(examIdFromUrl));
      if (exam) {
        setSelectedExam(exam);
        setActiveTab('view');
      } else if (!loading) {
        // Fetch exam directly if not in list
        examService.getExam(Number(examIdFromUrl)).then(response => {
          setSelectedExam(response);
          setActiveTab('view');
        }).catch(() => {
          navigate('/instructor/exams');
        });
      }
    }
  }, [examIdFromUrl, exams, loading, navigate]);

  const handleViewExam = (exam: any) => {
 navigate(`/instructor/exam/${exam.id}`);
  };

  const handleEditExam = (exam: any) => {
    setSelectedExam(exam);
    setSelectedExamId(exam.id);
    setActiveTab('form');
  };

  const handleAddQuestions = (examId: number) => {
    setSelectedExamId(examId);
    setActiveTab('questions');
  };

  const handleDeleteExam = async (id: number) => {
    const success = await deleteExam(id);
    if (success) {
      fetchExams(1);
    }
  };

  const handleBack = () => {
    setActiveTab('exams');
    setSelectedExam(null);
    setSelectedExamId(null);
    navigate('/instructor/exams');
  };

  // Render different views based on activeTab
  if (activeTab === 'form') {
    return (
      <ExamForm
        examId={selectedExamId}
        onSuccess={handleBack}
        onCancel={handleBack}
      />
    );
  }

  if (activeTab === 'questions' && selectedExamId) {
    return (
      <QuestionBuilder
        examId={selectedExamId}
        onSuccess={() => {
          setActiveTab('exams');
          fetchExams(1);
        }}
        onCancel={handleBack}
      />
    );
  }

  if (activeTab === 'view' && selectedExam) {
    return (
      <ExamViewer
        exam={selectedExam}
        onBack={handleBack}
        onCancel={handleBack}
      />
    );
  }

  if (showResult && result && selectedExam) {
    return (
      <ExamResultCard
        result={result}
        exam={selectedExam}
        onClose={() => {
          setShowResult(false);
          setSelectedExam(null);
        }}
      />
    );
  }

  // Main Exams List View
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* Header */}
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
              <button onClick={() => setViewMode('grid')} className={`p-2 px-3 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-primary shadow-md' : 'hover:bg-white/50'}`}>
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('table')} className={`p-2 px-3 rounded-lg transition-all duration-300 ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 text-primary shadow-md' : 'hover:bg-white/50'}`}>
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Export Button */}
            <ExportExcelButton data={exams} fileName="exams-list" label={lang === 'ar' ? 'تصدير' : 'Export'} disabled={loading || exams.length === 0} />

            {/* Create Button */}
            <Button onClick={() => { setSelectedExamId(null); setActiveTab('form'); }} className="px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl flex items-center gap-2 shadow-lg">
              <Plus className="h-4 w-4" />
              {t('createExam')}
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Search & Filters */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={lang === 'ar' ? 'بحث عن امتحان...' : 'Search exams...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? 'pr-9' : 'pl-9'} rounded-xl h-11`}
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-primary text-white border-primary shadow-md' : 'bg-white dark:bg-gray-800 border-gray-200 hover:border-primary'}`}>
                <Filter className="h-4 w-4" />
              </button>
              {savedFilters && (
                <button onClick={loadSavedFilters} className="p-2.5 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 hover:border-primary transition-all">
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          <FiltersPanel
            show={showFilters}
            filters={filters}
            setFilters={setFilters}
            stages={stages}
            onApply={applyFilters}
            onClear={clearFilters}
          />
        </motion.div>

        {/* Loading & Error & Empty States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground mt-4">{t('loadingExams')}</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && exams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-primary/40" />
            </div>
            <p className="text-muted-foreground mb-4 text-lg">{t('noExamsFound')}</p>
            <Button onClick={() => { setSelectedExamId(null); setActiveTab('form'); }} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              {t('createYourFirstExam')}
            </Button>
          </div>
        )}

        {/* Grid View */}
        {!loading && !error && exams.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {exams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onView={handleViewExam}
                onEdit={handleEditExam}
                onDelete={handleDeleteExam}
                onAddQuestions={handleAddQuestions}
                onToggleRandomQuestions={toggleRandomQuestions}
                onToggleRandomAnswers={toggleRandomAnswers}
                onToggleShowResult={toggleShowResult} 
              />
            ))}
          </div>
        )}

        {/* Table View */}
        {!loading && !error && exams.length > 0 && viewMode === 'table' && (
          <ExamsTable
            exams={exams}
            onView={handleViewExam}
            onEdit={handleEditExam}
            onDelete={handleDeleteExam}
          />
        )}

        {/* Pagination */}
        {pagination.total > pagination.perPage && (
          <div className="flex items-center justify-center gap-3 pt-8 pb-4">
            <Button variant="outline" size="icon" className="rounded-full w-10 h-10" onClick={() => fetchExams(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>
              <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <span className="text-sm">{pagination.currentPage} / {pagination.lastPage}</span>
            <Button variant="outline" size="icon" className="rounded-full w-10 h-10" onClick={() => fetchExams(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.lastPage}>
              <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InstructorExams;