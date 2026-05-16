// src/components/exams/QuestionCard.tsx

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrueFalseQuestion } from './TrueFalseQuestion';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { EssayQuestion } from './EssayQuestion';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Trophy } from 'lucide-react';
import type { Question } from '@/types/exam.types';

interface QuestionCardProps {
  question: Question;
  index: number;
  answer?: string;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
}

const getQuestionTypeBadge = (type: string) => {
  const badges = {
    true_false: { icon: "🎯", text: "True/False", color: "from-blue-500 to-cyan-500" },
    multiple_choice: { icon: "📝", text: "Multiple Choice", color: "from-green-500 to-emerald-500" },
    essay: { icon: "📄", text: "Essay", color: "from-purple-500 to-pink-500" }
  };
  const config = badges[type as keyof typeof badges];
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 3 }}
      whileTap={{ scale: 0.95 }}
    >
      <Badge className={`bg-gradient-to-r ${config.color} text-white border-0 gap-2 px-3 py-1.5 shadow-md`}>
        <span className="text-base">{config.icon}</span>
        {config.text}
      </Badge>
    </motion.div>
  );
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  answer,
  onAnswerChange,
  disabled,
  showCorrectAnswer
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const renderQuestion = () => {
    const props = {
      question: question.question,
      mark: question.mark,
      value: answer,
      onChange: onAnswerChange,
      disabled
    };

    switch (question.question_type) {
      case 'true_false':
        return <TrueFalseQuestion {...props} />;
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion
            {...props}
            options={question.options || []}
          />
        );
      case 'essay':
        return <EssayQuestion {...props} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -50 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
        isHovered ? 'shadow-2xl border-primary/50' : 'shadow-lg'
      }`}>
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
        />
        
        {/* Decorative elements */}
        <motion.div
          className="absolute -top-10 -right-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <div className="p-5 relative">
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, delay: index * 0.1 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">{index + 1}</span>
              </div>
              <motion.div
                className="absolute -inset-1 rounded-full bg-primary/30"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {getQuestionTypeBadge(question.question_type)}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge variant="outline" className="gap-1 bg-yellow-50 dark:bg-yellow-950/30">
                    <Trophy className="h-3 w-3 text-yellow-500" />
                    {question.mark} marks
                  </Badge>
                </motion.div>
              </div>
              
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderQuestion()}
                    
                    {showCorrectAnswer && question.correct_answer && (
                      <motion.div 
                        className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-green-700 dark:text-green-400">
                            Correct Answer:
                          </span>
                          <span className="text-green-600 dark:text-green-300">{question.correct_answer}</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </motion.button>
          </div>
          
          {/* Progress indicator */}
          <AnimatePresence>
            {answer && !disabled && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                exit={{ width: 0 }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};