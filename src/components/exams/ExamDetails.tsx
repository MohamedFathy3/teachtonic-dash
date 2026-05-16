// src/components/exams/ExamDetails.tsx

import React, { useState } from 'react';
import { 
  Calendar, Clock, Users, FileText, BookOpen, User, 
  ChevronLeft, Edit2, Trash2, Plus, RefreshCw, 
  CheckCircle, XCircle, Award, Target, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { QuestionCard } from './QuestionCard';
import type { Exam, Question } from '@/types/exam.types';
import { motion } from 'framer-motion';

interface ExamDetailsProps {
  exam: Exam;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddQuestions?: () => void;
  onTakeExam?: () => void;
}

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode }> = ({ 
  icon: Icon, label, value 
}) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
    <Icon className="h-4 w-4 text-primary" />
    <div className="flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-sm">{value || '—'}</p>
    </div>
  </div>
);

export const ExamDetails: React.FC<ExamDetailsProps> = ({
  exam,
  onBack,
  onEdit,
  onDelete,
  onAddQuestions,
  onTakeExam,
}) => {
  const { t, lang } = useApp();
  const isRTL = lang === 'ar';
  const [activeTab, setActiveTab] = useState('overview');

  const title = isRTL && exam.title_ar ? exam.title_ar : exam.title;
  const description = isRTL && exam.description_ar ? exam.description_ar : exam.description;
  const courseTitle = isRTL ? exam.course_detail?.title_ar : exam.course_detail?.title;
  const stageName = isRTL ? exam.stage?.name_ar : exam.stage?.name;
  const teacherName = exam.teacher?.name;

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalQuestions = exam.questions?.length || 0;
  const totalMarks = exam.total_marks || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
              <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              {t('back')}
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {courseTitle} • {stageName}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
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

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <FileText className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{totalQuestions}</p>
          <p className="text-xs text-muted-foreground">{t('questions')}</p>
        </Card>
        <Card className="p-3 text-center">
          <Award className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{totalMarks}</p>
          <p className="text-xs text-muted-foreground">{t('totalMarks')}</p>
        </Card>
        <Card className="p-3 text-center">
          <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{exam.duration_minutes}</p>
          <p className="text-xs text-muted-foreground">{t('minutes')}</p>
        </Card>
        <Card className="p-3 text-center">
          <Users className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">—</p>
          <p className="text-xs text-muted-foreground">{t('students')}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="questions">{t('questions')} ({totalQuestions})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Description */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              {t('description')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {description || t('noDescription')}
            </p>
          </Card>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoRow icon={BookOpen} label={t('course')} value={courseTitle} />
            <InfoRow icon={Users} label={t('stage')} value={stageName} />
            <InfoRow icon={User} label={t('instructor')} value={teacherName} />
            <InfoRow icon={Calendar} label={t('createdAt')} value={formatDate(exam.created_at)} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={onTakeExam} className="flex-1 gap-2">
              <FileText className="h-4 w-4" />
              {t('takeExam')}
            </Button>
            <Button variant="outline" onClick={onAddQuestions} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('addQuestions')}
            </Button>
            <Button variant="outline" onClick={onEdit} className="gap-2">
              <Edit2 className="h-4 w-4" />
              {t('edit')}
            </Button>
            <Button variant="destructive" onClick={onDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              {t('delete')}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4 mt-4">
          {totalQuestions === 0 ? (
            <Card className="p-12 text-center">
              <HelpCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">{t('noQuestionsYet')}</p>
              <Button onClick={onAddQuestions}>
                <Plus className="h-4 w-4 mr-2" />
                {t('addQuestions')}
              </Button>
            </Card>
          ) : (
            <>
              {exam.questions?.map((question, idx) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={idx}
                  showCorrectAnswer
                  disabled
                />
              ))}
            </>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};