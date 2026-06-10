/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/assignments/AssignmentCard.tsx

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FileText, Clock, Plus, Settings2, Eye, Trash2, CheckCircle, XCircle, Lock, Unlock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface AssignmentCardProps {
  assignment: any;
  onView: (assignment: any) => void;
  onEdit: (assignment: any) => void;
  onDelete: (id: number) => void;
  onAddQuestions: (assignmentId: number) => void;
  onToggleMustSolve?: (assignmentId: number, value: boolean) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onView,
  onEdit,
  onDelete,
  onAddQuestions,
  onToggleMustSolve,
}) => {
  const { lang, isRTL } = useApp();

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
        {/* Header */}
        <div className="h-28 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
          {assignment.image?.fullUrl ? (
            <img src={assignment.image.fullUrl} alt={assignment.title} className="w-full h-full object-cover" />
          ) : (
            <FileText className="h-10 w-10 text-primary/50" />
          )}
          
          {/* Status Badges - Top Right */}
          <div className="absolute top-2 right-2 flex gap-2">
            {/* ✅ Switch for must_solve_assignment_to_unlock - improved design */}
            {onToggleMustSolve && (
              <div 
                className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md border border-border/50"
                onClick={(e) => e.stopPropagation()}
              >
                {assignment.must_solve_assignment_to_unlock ? (
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <Unlock className="h-3.5 w-3.5 text-green-500" />
                )}
                <Switch
                  checked={assignment.must_solve_assignment_to_unlock || false}
                  onCheckedChange={(checked) => onToggleMustSolve(assignment.id, checked)}
                  className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
                />
                <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                  {lang === 'ar' ? 'شرط الحل' : 'Must Solve'}
                </span>
              </div>
            )}
            
            <Badge variant={assignment.active === 1 ? "default" : "secondary"} className="gap-1 shadow-md">
              {assignment.active === 1 ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {assignment.active === 1 ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-xl line-clamp-1">
            {isRTL && assignment.title_ar ? assignment.title_ar : assignment.title}
          </h3>
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

          {/* Must Solve Indicator - when enabled */}
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

          {/* Actions Buttons */}
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