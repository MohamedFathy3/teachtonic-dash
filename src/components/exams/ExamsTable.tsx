/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/exams/QuestionCard.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, HelpCircle, List, FileText, Image as ImageIcon } from 'lucide-react';

interface QuestionCardProps {
  question: any;
  index: number;
  readOnly?: boolean;
  onAnswerChange?: (questionId: number, answer: string) => void;
  userAnswer?: string;
  showCorrectAnswer?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  readOnly = false,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer = false,
}) => {
  const { lang, isRTL } = useApp();

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'true_false':
        return <CheckCircle className="h-4 w-4" />;
      case 'multiple_choice':
        return <List className="h-4 w-4" />;
      case 'essay':
        return <FileText className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'true_false':
        return lang === 'ar' ? 'صح/خطأ' : 'True/False';
      case 'multiple_choice':
        return lang === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice';
      case 'essay':
        return lang === 'ar' ? 'مقالي' : 'Essay';
      default:
        return type;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'true_false':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'multiple_choice':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'essay':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const renderTrueFalse = () => {
    const isCorrect = showCorrectAnswer && userAnswer === question.correct_answer;
    const isWrong = showCorrectAnswer && userAnswer && userAnswer !== question.correct_answer;

    return (
      <RadioGroup
        value={userAnswer || ''}
        onValueChange={(value) => onAnswerChange?.(question.id, value)}
        disabled={readOnly}
        className="space-y-3"
      >
        <div className={`flex items-center space-x-3 space-x-reverse p-3 rounded-lg border transition-all ${
          showCorrectAnswer && question.correct_answer === 'true'
            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
            : isWrong && userAnswer === 'true'
            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
        }`}>
          <RadioGroupItem value="true" id={`q${question.id}-true`} />
          <Label htmlFor={`q${question.id}-true`} className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>{lang === 'ar' ? 'صحيح' : 'True'}</span>
            </div>
          </Label>
          {showCorrectAnswer && question.correct_answer === 'true' && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {isWrong && userAnswer === 'true' && (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>

        <div className={`flex items-center space-x-3 space-x-reverse p-3 rounded-lg border transition-all ${
          showCorrectAnswer && question.correct_answer === 'false'
            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
            : isWrong && userAnswer === 'false'
            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
        }`}>
          <RadioGroupItem value="false" id={`q${question.id}-false`} />
          <Label htmlFor={`q${question.id}-false`} className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span>{lang === 'ar' ? 'خطأ' : 'False'}</span>
            </div>
          </Label>
          {showCorrectAnswer && question.correct_answer === 'false' && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {isWrong && userAnswer === 'false' && (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </RadioGroup>
    );
  };

  const renderMultipleChoice = () => {
    const options = question.options || [];
    // Convert options to array if it's an object
    const optionsArray = Array.isArray(options) ? options : Object.values(options);
    
    // Find correct option text for display
    const correctOptionText = optionsArray.find((opt: any) => opt.is_correct)?.option_text;

    return (
      <RadioGroup
        value={userAnswer || ''}
        onValueChange={(value) => onAnswerChange?.(question.id, value)}
        disabled={readOnly}
        className="space-y-3"
      >
        {optionsArray.map((option: any, idx: number) => {
          const isCorrect = showCorrectAnswer && option.is_correct;
          const isWrong = showCorrectAnswer && userAnswer === option.option_text && !option.is_correct;
          const isUserCorrect = showCorrectAnswer && userAnswer === option.option_text && option.is_correct;

          return (
            <div
              key={idx}
              className={`flex items-center space-x-3 space-x-reverse p-3 rounded-lg border transition-all ${
                isCorrect || isUserCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : isWrong
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={option.option_text} id={`q${question.id}-opt${idx}`} />
              <Label htmlFor={`q${question.id}-opt${idx}`} className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option.option_text}</span>
                </div>
              </Label>
              {(isCorrect || isUserCorrect) && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {isWrong && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          );
        })}
      </RadioGroup>
    );
  };

  const renderEssay = () => {
    return (
      <Textarea
        value={userAnswer || ''}
        onChange={(e) => onAnswerChange?.(question.id, e.target.value)}
        placeholder={lang === 'ar' ? 'أكتب إجابتك هنا...' : 'Write your answer here...'}
        className="min-h-[150px] rounded-xl resize-y"
        disabled={readOnly}
      />
    );
  };

  const renderCorrectAnswerDisplay = () => {
    if (!showCorrectAnswer) return null;

    let correctAnswerText = '';
    if (question.question_type === 'true_false') {
      correctAnswerText = question.correct_answer === 'true' 
        ? (lang === 'ar' ? 'صحيح' : 'True')
        : (lang === 'ar' ? 'خطأ' : 'False');
    } else if (question.question_type === 'multiple_choice') {
      const options = Array.isArray(question.options) ? question.options : Object.values(question.options || {});
      const correctOption = options.find((opt: any) => opt.is_correct);
      correctAnswerText = correctOption?.option_text || '';
    }

    return (
      <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-green-700 dark:text-green-400">
            {lang === 'ar' ? 'الإجابة الصحيحة:' : 'Correct Answer:'}
          </span>
          <span className="text-green-700 dark:text-green-400">{correctAnswerText}</span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="mb-6"
    >
      <Card className="overflow-hidden rounded-2xl border shadow-sm hover:shadow-md transition-all">
        {/* Question Header */}
        <div className="p-5 pb-3 border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/30">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center font-bold shadow-md">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{question.question}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`gap-1 ${getQuestionTypeColor(question.question_type)}`}>
                    {getQuestionTypeIcon(question.question_type)}
                    {getQuestionTypeLabel(question.question_type)}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="font-bold">{question.mark}</span>
                    {lang === 'ar' ? 'درجة' : 'marks'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-5 space-y-4">
          {/* Question Image */}
          {question.image?.fullUrl && (
            <div className="rounded-xl overflow-hidden border bg-muted/30 p-2">
              <img
                src={question.image.fullUrl}
                alt={question.question}
                className="max-h-64 w-full object-contain rounded-lg"
              />
            </div>
          )}

          {/* Answer Area */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {lang === 'ar' ? 'الإجابة' : 'Answer'}
            </Label>
            
            {question.question_type === 'true_false' && renderTrueFalse()}
            {question.question_type === 'multiple_choice' && renderMultipleChoice()}
            {question.question_type === 'essay' && renderEssay()}
          </div>

          {/* Correct Answer Display (for review mode) */}
          {renderCorrectAnswerDisplay()}

          {/* User Answer Status (for review mode) */}
          {showCorrectAnswer && userAnswer && (
            <div className={`p-3 rounded-lg ${
              userAnswer === (question.correct_answer || 
                (question.options && Array.isArray(question.options) 
                  ? question.options.find((opt: any) => opt.is_correct)?.option_text
                  : null))
                ? 'bg-green-50 dark:bg-green-950/20 border border-green-200'
                : 'bg-red-50 dark:bg-red-950/20 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {userAnswer === (question.correct_answer || 
                  (question.options && Array.isArray(question.options) 
                    ? question.options.find((opt: any) => opt.is_correct)?.option_text
                    : null)) ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-700 dark:text-green-400">
                      {lang === 'ar' ? 'إجابتك صحيحة' : 'Your answer is correct'}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-700 dark:text-red-400">
                      {lang === 'ar' ? 'إجابتك خاطئة' : 'Your answer is incorrect'}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">
                  {lang === 'ar' ? 'إجابتك:' : 'Your answer:'}
                </span>{' '}
                <span className="font-medium">{userAnswer}</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default QuestionCard;