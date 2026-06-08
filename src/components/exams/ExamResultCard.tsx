/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/instructor/exams/components/ExamResultCard.tsx

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Trophy } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ExamResultCardProps {
  result: any;
  exam: any;
  onClose: () => void;
}

export const ExamResultCard: React.FC<ExamResultCardProps> = ({ result, exam, onClose }) => {
  const { t, lang } = useApp();
  const isPassed = result.score >= (exam.total_marks_pass_marks || exam.total_marks / 2);
  const percentage = (result.score / exam.total_marks) * 100;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <Card className={`relative overflow-hidden border-4 ${
          isPassed
            ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 border-green-400'
            : 'bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950/30 dark:to-orange-950/30 border-red-400'
        }`}>
          <CardContent className="p-8 text-center relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
            
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
              <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
            </motion.div>
            
            <h3 className="text-2xl font-bold mb-2">
              {isPassed 
                ? (lang === 'ar' ? '🎉 مبروك! 🎉' : '🎉 Congratulations! 🎉')
                : (lang === 'ar' ? '💪 استمر في التدريب! 💪' : '💪 Keep Practicing! 💪')}
            </h3>
            
            <div className="flex justify-center items-center gap-4 my-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">{result.score}</p>
                <p className="text-sm text-muted-foreground">{t('yourScore')}</p>
              </div>
              <div className="text-3xl font-bold text-muted-foreground">/</div>
              <div className="text-center">
                <p className="text-5xl font-bold">{exam.total_marks}</p>
                <p className="text-sm text-muted-foreground">{t('totalMarks')}</p>
              </div>
            </div>
            
            <div className="max-w-md mx-auto mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{t('score')}</span>
                <span>{percentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${
                    isPassed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                />
              </div>
            </div>
            
            <Badge className={`gap-2 px-4 py-2 text-base ${
              isPassed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
            }`}>
              {isPassed ? (lang === 'ar' ? 'نجاح' : 'Passed') : (lang === 'ar' ? 'رسب' : 'Failed')}
            </Badge>
            
            <Button onClick={onClose} className="mt-6 px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-medium">
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};