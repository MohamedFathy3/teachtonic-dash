/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/assignments/AssignmentCard.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, Clock, Plus, Settings2, Eye, Trash2, 
  CheckCircle, XCircle, Lock, Unlock, Power, 
  Shuffle, ListOrdered, ChevronDown, ChevronUp
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';

interface AssignmentCardProps {
  assignment: any;
  onView: (assignment: any) => void;
  onEdit: (assignment: any) => void;
  onDelete: (id: number) => void;
  onAddQuestions: (assignmentId: number) => void;
  onToggleRandomQuestions?: (assignmentId: number, currentValue: boolean) => void;
  onToggleRandomAnswers?: (assignmentId: number, currentValue: boolean) => void;
  onToggleShowResult?: (assignmentId: number, currentValue: boolean) => void;
  onToggleMustSolve?: (assignmentId: number, value: boolean) => void;
  onToggleActive?: (assignment: any) => void;  // ✅ تستقبل assignment كامل
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onView,
  onEdit,
  onDelete,
  onAddQuestions,
  onToggleRandomQuestions,
  onToggleRandomAnswers,
  onToggleShowResult,
  onToggleMustSolve,
  onToggleActive,
}) => {
  const { t, lang, isRTL } = useApp();
  const [expandedSettings, setExpandedSettings] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <Card className="group relative overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-2xl">
        
        {/* Header with Image */}
        <div className="h-28 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
          {assignment.image?.fullUrl ? (
            <img src={assignment.image.fullUrl} alt={assignment.title} className="w-full h-full object-cover" />
          ) : (
            <FileText className="h-10 w-10 text-primary/50" />
          )}
          
          {/* Must Solve Badge - Top Right */}
          {onToggleMustSolve && (
            <div className="absolute top-2 right-2">
              <div 
                className="flex items-center gap-1.5 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-md border border-border/50"
                onClick={(e) => e.stopPropagation()}
              >
                {assignment.must_solve_assignment_to_unlock ? (
                  <Lock className="h-3 w-3 text-amber-500" />
                ) : (
                  <Unlock className="h-3 w-3 text-green-500" />
                )}
                <Switch
                  checked={assignment.must_solve_assignment_to_unlock || false}
                  onCheckedChange={(checked) => onToggleMustSolve(assignment.id, checked)}
                  className="scale-75 data-[state=checked]:bg-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title & Status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-xl line-clamp-1 flex-1">
              {isRTL && assignment.title_ar ? assignment.title_ar : assignment.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className={`w-2 h-2 rounded-full ${assignment.active === 1 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-xs text-muted-foreground">
                {assignment.active === 1 ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {isRTL && assignment.description_ar ? assignment.description_ar : assignment.description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-semibold">{assignment.total_marks}</span>
              <span className="text-muted-foreground">{lang === 'ar' ? 'درجة' : 'marks'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-semibold">{assignment.duration_minutes}</span>
              <span className="text-muted-foreground">{lang === 'ar' ? 'دقيقة' : 'min'}</span>
            </div>
            {assignment.type_exam && (
              <Badge variant="outline" className="text-xs">
                {assignment.type_exam === 'center' ? '🏫 سنتر' : '💻 أونلاين'}
              </Badge>
            )}
          </div>

          {/* Active/Inactive Switch - Under the stats */}
          {onToggleActive && (
            <div className="mt-4 p-3 rounded-xl bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Power className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {lang === 'ar' ? 'حالة الواجب' : 'Assignment Status'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {assignment.active === 1 ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                </span>
                <Switch
                  checked={assignment.active === 1}
                  onCheckedChange={() => onToggleActive(assignment)}  // ✅ تمرير الـ assignment كامل
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
          )}

          {/* Must Solve Indicator */}
          {assignment.must_solve_assignment_to_unlock && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                <Lock className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {lang === 'ar' ? '⚠️ يجب حل هذا الواجب لفتح المحتوى التالي' : '⚠️ Must solve this assignment to unlock next content'}
                </span>
              </div>
            </div>
          )}

          {/* Settings Toggle */}
          <div className="mt-4 border-t pt-3">
            <button 
              onClick={() => setExpandedSettings(!expandedSettings)} 
              className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-1">
                <Settings2 className="h-3 w-3" />
                <span>{lang === 'ar' ? 'إعدادات متقدمة' : 'Advanced Settings'}</span>
              </div>
              {expandedSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            <AnimatePresence>
              {expandedSettings && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }} 
                  className="mt-3 space-y-2"
                >
                  {/* Random Questions */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Shuffle className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">{lang === 'ar' ? 'ترتيب عشوائي للأسئلة' : 'Random Questions'}</span>
                    </div>
                    <Switch 
                      checked={assignment.random_questions || false} 
                      onCheckedChange={() => onToggleRandomQuestions?.(assignment.id, assignment.random_questions)} 
                    />
                  </div>

                  {/* Random Answers */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <ListOrdered className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">{lang === 'ar' ? 'ترتيب عشوائي للإجابات' : 'Random Answers'}</span>
                    </div>
                    <Switch 
                      checked={assignment.random_answers || false} 
                      onCheckedChange={() => onToggleRandomAnswers?.(assignment.id, assignment.random_answers)} 
                    />
                  </div>

                  {/* Show Result */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">{lang === 'ar' ? 'عرض النتيجة للطلاب' : 'Show Result to Students'}</span>
                    </div>
                    <Switch 
                      checked={assignment.show_result === 1 || assignment.show_result === true} 
                      onCheckedChange={() => onToggleShowResult?.(assignment.id, assignment.show_result)} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1.5 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all"
                onClick={() => onAddQuestions(assignment.id)}
              >
                <Plus className="h-3.5 w-3.5" /> 
                {lang === 'ar' ? 'أسئلة' : 'Questions'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1.5 rounded-xl"
                onClick={() => onEdit(assignment)}
              >
                <Settings2 className="h-3.5 w-3.5" /> 
                {lang === 'ar' ? 'تعديل' : 'Edit'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 gap-1.5 rounded-xl border-primary/30 bg-primary/5 hover:bg-primary/10"
                onClick={() => onView(assignment)}
              >
                <Eye className="h-3.5 w-3.5" /> 
                {lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="rounded-xl px-4"
                onClick={() => onDelete(assignment.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};