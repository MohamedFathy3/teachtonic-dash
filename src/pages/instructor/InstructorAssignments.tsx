/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/InstructorAssignments.tsx
import { PageHeader } from "@/components/lms/PageHeader";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useTeacherMeta } from '@/hooks/useTeacherMeta';
import { useAssignments } from '@/hooks/useAssignments';
import { useAssignmentFilters } from '@/hooks/useAssignmentFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Filter, Plus, Grid3x3, List, RefreshCw, Sparkles, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExportExcelButton } from '@/components/common/ExportExcelButton';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { AssignmentForm } from '@/components/assignments/AssignmentForm';
import { AssignmentFiltersPanel } from '@/components/assignments/AssignmentFiltersPanel';
import { QuestionBuilder } from '@/components/exams/QuestionBuilder';
import { StatsCards } from '@/components/exams/StatsCards';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300 } },
};

export const InstructorAssignments: React.FC = () => {
  const { t, lang, user } = useApp();
  const navigate = useNavigate();
  const isRTL = lang === 'ar';

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'assignments' | 'questions' | 'form'>('assignments');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);

  const { stages } = useTeacherMeta(user?.id);
  const { assignments, loading, error, pagination, fetchAssignments, deleteAssignment } = useAssignments(user?.id || 0, 12);
  const { filters, setFilters, savedFilters, applyFilters, clearFilters, loadSavedFilters } = useAssignmentFilters(fetchAssignments);

  const stats = useMemo(() => ({
    total: pagination.total || 0,
    active: assignments.filter(a => a.active === 1).length,
    inactive: assignments.filter(a => a.active === 0).length,
    avgMarks: assignments.length > 0 ? Math.round(assignments.reduce((sum, a) => sum + (a.total_marks || 0), 0) / assignments.length) : 0,
  }), [assignments, pagination.total]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const apiFilters: any = {};
    if (filters.stageId) apiFilters.stage_id = filters.stageId;
    if (filters.lessonId) apiFilters.course_detail_id = filters.lessonId;
    if (filters.marksMin) apiFilters.total_marks = filters.marksMin;
    if (filters.active !== null) apiFilters.active = filters.active ? 1 : 0;
    fetchAssignments(1, apiFilters, debouncedSearch);
  }, [fetchAssignments, filters, debouncedSearch]);

  // 🔥 عدل هنا - استخدم navigate بدلاً من setActiveTab
  const handleViewAssignment = (assignment: any) => {
    console.log("VIEW CLICKED", assignment.id);
    // App route is: /instructor/assignments/:assignmentId
    navigate(`/instructor/assignments/${assignment.id}`);
  };

  const handleEditAssignment = (assignment: any) => {
    setSelectedAssignmentId(assignment.id);
    setActiveTab('form');
  };

  const handleAddQuestions = (assignmentId: number) => {
    setSelectedAssignmentId(assignmentId);
    setActiveTab('questions');
  };

  const handleDeleteAssignment = async (id: number) => {
    await deleteAssignment(id);
  };

  const handleBack = () => {
    setActiveTab('assignments');
    setSelectedAssignmentId(null);
  };

  if (activeTab === 'form') {
    return <AssignmentForm assignmentId={selectedAssignmentId} onSuccess={handleBack} onCancel={handleBack} />;
  }

  if (activeTab === 'questions' && selectedAssignmentId) {
    return <QuestionBuilder examId={selectedAssignmentId} onSuccess={handleBack} onCancel={handleBack} />;
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-xl opacity-60" />
              <div className="relative h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {lang === 'ar' ? 'الواجبات' : 'Assignments'}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Sparkles className="h-3 w-3" />
                {pagination.total} {lang === 'ar' ? 'واجب' : 'Assignments'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex bg-muted/50 rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 px-3 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-md text-primary' : 'hover:bg-white/50'}`}>
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('table')} className={`p-2 px-3 rounded-lg ${viewMode === 'table' ? 'bg-white shadow-md text-primary' : 'hover:bg-white/50'}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
            <ExportExcelButton data={assignments} fileName="assignments-list" label={lang === 'ar' ? 'تصدير' : 'Export'} disabled={loading || assignments.length === 0} />
            <Button onClick={() => { setSelectedAssignmentId(null); setActiveTab('form'); }} className="px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl flex items-center gap-2 shadow-lg">
              <Plus className="h-4 w-4" /> {lang === 'ar' ? 'إنشاء واجب' : 'Create Assignment'}
            </Button>
          </div>
        </motion.div>

        <StatsCards stats={stats} />

        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4`} />
              <Input placeholder={lang === 'ar' ? 'بحث عن واجب...' : 'Search assignments...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${isRTL ? 'pr-9' : 'pl-9'} rounded-xl h-11`} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-primary text-white border-primary shadow-md' : 'bg-white dark:bg-gray-800 border-gray-200 hover:border-primary'}`}>
                <Filter className="h-4 w-4" />
              </button>
              {savedFilters && <button onClick={loadSavedFilters} className="p-2.5 rounded-xl border bg-white hover:border-primary"><RefreshCw className="h-4 w-4" /></button>}
            </div>
          </div>
          <AssignmentFiltersPanel show={showFilters} filters={filters} setFilters={setFilters} stages={stages} onApply={applyFilters} onClear={clearFilters} />
        </motion.div>

        {loading && <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {!loading && !error && assignments.length === 0 && (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">{lang === 'ar' ? 'لا توجد واجبات' : 'No assignments'}</p>
            <Button onClick={() => { setSelectedAssignmentId(null); setActiveTab('form'); }} variant="outline" className="gap-2"><Plus className="h-4 w-4" /> {lang === 'ar' ? 'إنشاء أول واجب' : 'Create first assignment'}</Button>
          </div>
        )}

        {!loading && !error && assignments.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onView={handleViewAssignment}
                onEdit={handleEditAssignment}
                onDelete={handleDeleteAssignment}
                onAddQuestions={handleAddQuestions}
              />
            ))}
          </div>
        )}

        {pagination.total > pagination.perPage && (
          <div className="flex justify-center gap-3 pt-8">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => fetchAssignments(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>
              <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <span className="text-sm">{pagination.currentPage} / {pagination.lastPage}</span>
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => fetchAssignments(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.lastPage}>
              <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InstructorAssignments;