// src/components/exams/QuestionDetailsModal.tsx

import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
  FileQuestion, Star, CheckCircle, XCircle, FileText,
  X, Image as ImageIcon, Calendar
} from 'lucide-react';

interface QuestionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
  lang: string;
}

export const QuestionDetailsModal: React.FC<QuestionDetailsModalProps> = ({
  isOpen,
  onClose,
  question,
  lang
}) => {
  if (!question) return null;

  const getTypeLabel = (type: string) => {
    const types: any = {
      true_false: lang === 'ar' ? 'صح/خطأ' : 'True/False',
      multiple_choice: lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice',
      essay: lang === 'ar' ? 'مقالي' : 'Essay',
    };
    return types[type] || type;
  };

  // ✅ التعامل مع الخيارات بالصيغة الجديدة (مصفوفة كائنات تحتوي على option_text, is_correct, image)
  const getOptions = () => {
    if (!question.options) return [];
    // إذا كانت options مصفوفة بالفعل (كما في endpoint الجديد)
    if (Array.isArray(question.options)) {
      return question.options;
    }
    // للتوافق القديم إذا كانت string
    if (typeof question.options === 'string') {
      try {
        return JSON.parse(question.options);
      } catch {
        return [];
      }
    }
    return [];
  };

  const options = getOptions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-t-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <FileQuestion className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {lang === 'ar' ? 'تفاصيل السؤال' : 'Question Details'}
                </DialogTitle>
                <p className="text-white/80 text-sm">
                  {lang === 'ar' ? `السؤال رقم ${question.id}` : `Question #${question.id}`}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full w-8 h-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <div className="p-6 space-y-5">
          {/* نوع السؤال والدرجة */}
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 text-sm">
              {getTypeLabel(question.question_type)}
            </Badge>
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 px-3 py-1 text-sm gap-1">
              <Star className="h-3 w-3" />
              {question.mark} {lang === 'ar' ? 'درجات' : 'marks'}
            </Badge>
            {question.correct_answer && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 text-sm gap-1">
                <CheckCircle className="h-3 w-3" />
                {lang === 'ar' ? 'الإجابة الصحيحة' : 'Correct Answer'}
              </Badge>
            )}
          </div>

          {/* نص السؤال */}
          <div>
            <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {lang === 'ar' ? 'نص السؤال' : 'Question Text'}
            </Label>
            <div className="p-4 bg-muted/30 rounded-xl border">
              <p className="text-base whitespace-pre-wrap leading-relaxed">
                {question.question || (lang === 'ar' ? 'لا يوجد نص للسؤال' : 'No question text')}
              </p>
            </div>
          </div>

          {/* صورة السؤال */}
          {question.image?.fullUrl && (
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                {lang === 'ar' ? 'صورة السؤال' : 'Question Image'}
              </Label>
              <motion.img
                whileHover={{ scale: 1.02 }}
                src={question.image.fullUrl}
                alt="Question"
                className="max-h-64 rounded-xl border shadow-md object-contain bg-gray-50 dark:bg-gray-800 cursor-pointer"
                onClick={() => window.open(question.image.fullUrl, '_blank')}
              />
            </div>
          )}

          {/* الإجابة الصحيحة لـ True/False */}
          {question.question_type === 'true_false' && question.correct_answer && (
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {lang === 'ar' ? 'الإجابة الصحيحة' : 'Correct Answer'}
              </Label>
              <div className={`p-4 rounded-xl border ${question.correct_answer === 'true'
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20'
                  : 'bg-red-50 border-red-200 dark:bg-red-950/20'
                }`}>
                <div className="flex items-center gap-3">
                  {question.correct_answer === 'true' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <span className="text-lg font-medium">
                    {question.correct_answer === 'true'
                      ? (lang === 'ar' ? '✅ صحيح' : '✅ True')
                      : (lang === 'ar' ? '❌ خطأ' : '❌ False')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* الخيارات لـ Multiple Choice - دعم الصيغة الجديدة مع الصور */}
          {question.question_type === 'multiple_choice' && options.length > 0 && (
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {lang === 'ar' ? 'الخيارات' : 'Options'}
              </Label>
              <div className="space-y-3">
                {options.map((opt: any, idx: number) => {
                  // تحديد إذا كان الخيار صحيحاً (يدعم كلاً من الصيغة القديمة والجديدة)
                  const isCorrect = opt.is_correct === true || opt.is_correct === 1 || (typeof opt === 'string' && opt === question.correct_answer);
                  const optionText = opt.option_text || (typeof opt === 'string' ? opt : '');
                  const optionImage = opt.image?.fullUrl;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${isCorrect
                          ? 'bg-green-50 border-green-200 dark:bg-green-950/20 shadow-sm'
                          : 'bg-muted/30 border-gray-200 dark:border-gray-700'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isCorrect
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>

                      <div className="flex-1 flex items-center gap-3 flex-wrap">
                        {optionText && (
                          <span className="text-base">{optionText}</span>
                        )}
                        {optionImage && (
                          <motion.img
                            whileHover={{ scale: 1.05 }}
                            src={optionImage}
                            alt={`Option ${String.fromCharCode(65 + idx)}`}
                            className="h-12 w-12 rounded-lg object-cover border shadow-sm cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(optionImage, '_blank');
                            }}
                          />
                        )}
                      </div>

                      {isCorrect && (
                        <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* الإجابة الصحيحة لـ Multiple Choice */}
          {question.question_type === 'multiple_choice' && question.correct_answer && (
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {lang === 'ar' ? 'الإجابة الصحيحة' : 'Correct Answer'}
              </Label>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  {typeof question.correct_answer === 'string'
                    ? question.correct_answer
                    : JSON.stringify(question.correct_answer)}
                </p>
              </div>
            </div>
          )}

          {/* رسالة للسؤال المقالي */}
          {question.question_type === 'essay' && (
            <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl text-center border border-amber-200 dark:border-amber-800">
              <FileText className="h-12 w-12 mx-auto text-amber-500 mb-3" />
              <p className="text-amber-700 dark:text-amber-400 font-medium text-lg">
                {lang === 'ar' ? 'سؤال مقالي' : 'Essay Question'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {lang === 'ar' ? 'يتم تصحيح هذا السؤال يدوياً بواسطة المعلم' : 'This question is graded manually by the teacher'}
              </p>
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {lang === 'ar' ? 'تاريخ الإضافة:' : 'Created:'} {' '}
                {question.created_at ? new Date(question.created_at).toLocaleDateString() : '-'}
              </span>
            </div>
            <div>
              <span>ID: {question.id}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button onClick={onClose} className="rounded-xl px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};