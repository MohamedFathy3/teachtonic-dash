/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/exams/components/ExamCard.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, Clock, Award, CheckCircle, XCircle, 
  Plus, Settings2, Eye, Trash2, Shuffle, ListOrdered,
  ChevronDown, ChevronUp, EyeOff
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ExamCardProps {
  exam: any;
  onView: (exam: any) => void;
  onEdit: (exam: any) => void;
  onDelete: (id: number) => void;
  onAddQuestions: (examId: number) => void;
  onToggleRandomQuestions: (examId: number, currentValue: boolean) => void;
  onToggleRandomAnswers: (examId: number, currentValue: boolean) => void;
  onToggleShowResult: (examId: number, currentValue: boolean) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  onView,
  onEdit,
  onDelete,
  onAddQuestions,
  onToggleRandomQuestions,
  onToggleRandomAnswers,
  onToggleShowResult,
}) => {
  const { t, lang, isRTL } = useApp();
  const [expandedSettings, setExpandedSettings] = useState(false);

  // دالة معالجة toggle show result
  const handleToggleShowResult = () => {
    console.log('🔄 Toggling show result for exam:', exam.id, 'current value:', exam.show_result);
    onToggleShowResult(exam.id, exam.show_result);
  };

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
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0" 
          initial={{ x: "-100%" }} 
          whileHover={{ x: "100%" }} 
          transition={{ duration: 0.6 }} 
        />

        {/* Header with Image */}
        <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
          {exam.image?.fullUrl ? (
            <img src={exam.image.fullUrl} alt={exam.title} className="w-full h-full object-cover" />
          ) : (
            <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <FileText className="h-12 w-12 text-primary/50" />
            </motion.div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={exam.active === 1 ? "default" : "secondary"} className="gap-1">
              {exam.active === 1 ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {exam.active === 1 ? t('active') : t('inactive')}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-xl line-clamp-1">
            {isRTL && exam.title_ar ? exam.title_ar : exam.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {isRTL && exam.description_ar ? exam.description_ar : exam.description}
          </p>

          {/* Stats */}
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-semibold">{exam.total_marks}</span>
              <span className="text-muted-foreground">marks</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-semibold">{exam.duration_minutes}</span>
              <span className="text-muted-foreground">min</span>
            </div>
            {exam.type_exam && (
              <Badge variant="outline" className="text-xs">
                {exam.type_exam === 'center' ? '🏫 مركز' : '💻 أونلاين'}
              </Badge>
            )}
          </div>

          {/* Settings Toggle */}
          <div className="mt-3 border-t pt-3">
            <button onClick={() => setExpandedSettings(!expandedSettings)} className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors">
              <div className="flex items-center gap-1">
                <Settings2 className="h-3 w-3" />
                <span>{lang === 'ar' ? 'إعدادات الامتحان' : 'Exam Settings'}</span>
              </div>
              {expandedSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            <AnimatePresence>
              {expandedSettings && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-2">
                  {/* Random Questions */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Shuffle className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">{lang === 'ar' ? 'ترتيب عشوائي للأسئلة' : 'Random Questions'}</span>
                    </div>
                    <Switch 
                      checked={exam.random_questions || false} 
                      onCheckedChange={() => onToggleRandomQuestions(exam.id, exam.random_questions)} 
                    />
                  </div>

                  {/* Random Answers */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <ListOrdered className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">{lang === 'ar' ? 'ترتيب عشوائي للإجابات' : 'Random Answers'}</span>
                    </div>
                    <Switch 
                      checked={exam.random_answers || false} 
                      onCheckedChange={() => onToggleRandomAnswers(exam.id, exam.random_answers)} 
                    />
                  </div>

                  {/* Show Result */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">{lang === 'ar' ? 'عرض النتيجة للطلاب' : 'Show Result to Students'}</span>
                    </div>
                    <Switch 
                      checked={exam.show_result === 1 || exam.show_result === true} 
                      onCheckedChange={handleToggleShowResult}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-3">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1 rounded-lg" onClick={() => onAddQuestions(exam.id)}>
                <Plus className="h-3 w-3" /> {t('addQuestions')}
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1 rounded-lg" onClick={() => onEdit(exam)}>
                <Settings2 className="h-3 w-3" /> {lang === 'ar' ? 'تعديل' : 'Edit'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 gap-2 rounded-lg border-primary/30 bg-primary/5 hover:bg-primary/10" onClick={() => onView(exam)}>
                <Eye className="h-3 w-3" /> {lang === 'ar' ? 'عرض' : 'View'}
              </Button>
              <Button variant="destructive" size="sm" className="rounded-lg px-3" onClick={() => onDelete(exam.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};