// src/components/exams/EssayQuestion.tsx

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { FileText, Sparkles, Maximize2, Minimize2 } from 'lucide-react';

interface EssayQuestionProps {
  question: string;
  mark: number;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const EssayQuestion: React.FC<EssayQuestionProps> = ({
  question,
  mark,
  value,
  onChange,
  disabled
}) => {
  const { t } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className="space-y-3 relative"
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl"
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [0.95, 1.05, 0.95]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <div className="relative bg-background rounded-xl p-4 border-2 transition-all duration-300"
        style={{
          borderColor: isFocused ? 'rgb(139, 92, 246)' : 'rgb(229, 231, 235)',
          boxShadow: isFocused ? '0 0 0 3px rgba(139, 92, 246, 0.2)' : 'none'
        }}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <FileText className="h-5 w-5 text-purple-500" />
            </motion.div>
            <motion.p 
              className="font-semibold text-base"
              whileHover={{ x: 5 }}
            >
              {question}
            </motion.p>
          </div>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <motion.span 
              className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full"
              whileHover={{ scale: 1.1, rotate: 5 }}
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(139, 92, 246, 0.7)', '0 0 0 10px rgba(139, 92, 246, 0)']
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {mark} {t('marks')}
            </motion.span>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg hover:bg-muted"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </motion.button>
          </motion.div>
        </div>
        
        <motion.div
          animate={{ height: isExpanded ? 'auto' : 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Textarea
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder={t('writeYourAnswer') || "📝 Write your answer here..."}
              rows={isExpanded ? 12 : 6}
              disabled={disabled}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="resize-none rounded-xl transition-all duration-300 text-base leading-relaxed"
            />
          </motion.div>
        </motion.div>
        
        {/* Animated character counter */}
        <AnimatePresence>
          {value && value.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-2 right-3 text-xs text-muted-foreground"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                {value.length} characters
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};