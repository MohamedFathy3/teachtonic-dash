/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/InstructorAssignments.tsx

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

  const handleViewAssignment = (assignment: any) => {
    console.log("VIEW CLICKED", assignment.id);
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
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants} 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
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
              <button onClick={() => setViewMode('grid')} className={`p-2 px-3 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow-md text-primary' : 'hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('table')} className={`p-2 px-3 rounded-lg transition-all duration-300 ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 shadow-md text-primary' : 'hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
            <ExportExcelButton data={assignments} fileName="assignments-list" label={lang === 'ar' ? 'تصدير' : 'Export'} disabled={loading || assignments.length === 0} />
            <Button 
              onClick={() => { setSelectedAssignmentId(null); setActiveTab('form'); }} 
              className="px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" /> {lang === 'ar' ? 'إنشاء واجب' : 'Create Assignment'}
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards - using existing StatsCards component which supports dark mode */}
        <StatsCards stats={stats} />

        {/* Search & Filters */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input 
                placeholder={lang === 'ar' ? 'بحث عن واجب...' : 'Search assignments...'} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className={`${isRTL ? 'pr-9' : 'pl-9'} rounded-xl h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800`}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`p-2.5 rounded-xl border transition-all duration-300 ${showFilters ? 'bg-primary text-white border-primary shadow-md' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary'}`}
              >
                <Filter className="h-4 w-4" />
              </button>
              {savedFilters && 
                <button 
                  onClick={loadSavedFilters} 
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary dark:hover:border-primary transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              }
            </div>
          </div>
          <AssignmentFiltersPanel 
            show={showFilters} 
            filters={filters} 
            setFilters={setFilters} 
            stages={stages} 
            onApply={applyFilters} 
            onClear={clearFilters} 
          />
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!loading && !error && assignments.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-muted-foreground mb-4">{lang === 'ar' ? 'لا توجد واجبات' : 'No assignments'}</p>
            <Button 
              onClick={() => { setSelectedAssignmentId(null); setActiveTab('form'); }} 
              variant="outline" 
              className="gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" /> {lang === 'ar' ? 'إنشاء أول واجب' : 'Create first assignment'}
            </Button>
          </div>
        )}

        {/* Grid View */}
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

        {/* Table View - TODO: Add table view component with dark mode support */}
        {!loading && !error && assignments.length > 0 && viewMode === 'table' && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'العنوان' : 'Title'}</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'الدرجة' : 'Marks'}</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'المدة' : 'Duration'}</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{assignment.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{assignment.description}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-sm">{assignment.total_marks}</Badge>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{assignment.duration_minutes} min</td>
                      <td className="p-4">
                        <Badge variant={assignment.active === 1 ? "default" : "secondary"} className="gap-1">
                          {assignment.active === 1 ? (
                            <><CheckCircle className="h-3 w-3" /> {lang === 'ar' ? 'نشط' : 'Active'}</>
                          ) : (
                            <><XCircle className="h-3 w-3" /> {lang === 'ar' ? 'غير نشط' : 'Inactive'}</>
                          )}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleViewAssignment(assignment)} className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEditAssignment(assignment)} className="h-8 w-8 p-0">
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleAddQuestions(assignment.id)} className="h-8 w-8 p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteAssignment(assignment.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.perPage && (
          <div className="flex justify-center gap-3 pt-8">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={() => fetchAssignments(pagination.currentPage - 1)} 
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">{pagination.currentPage} / {pagination.lastPage}</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={() => fetchAssignments(pagination.currentPage + 1)} 
              disabled={pagination.currentPage === pagination.lastPage}
            >
              <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InstructorAssignments;