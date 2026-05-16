// src/components/exams/TrueFalseQuestion.tsx

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface TrueFalseQuestionProps {
  question: string;
  mark: number;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  question,
  mark,
  value,
  onChange,
  disabled
}) => {
  const { t } = useApp();
  const [showHint, setShowHint] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleChange = (val: string) => {
    setSelectedValue(val);
    onChange?.(val);
  };

  return (
    <motion.div 
      className="space-y-3 relative"
      initial={{ opacity: 0, x: -50, rotateY: -30 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      style={{ perspective: 1000 }}
    >
      {/* 3D card effect */}
      <motion.div
        className="relative bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 border-2"
        whileHover={{ 
          rotateX: 5,
          rotateY: 5,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-3 flex-1">
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <HelpCircle className="h-5 w-5 text-blue-500" />
            </motion.div>
            <motion.p 
              className="font-semibold text-base leading-relaxed"
              whileHover={{ scale: 1.02 }}
            >
              {question}
            </motion.p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowHint(!showHint)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              💡
            </motion.button>
            <motion.span 
              className="text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full"
              whileHover={{ scale: 1.1, rotate: -5 }}
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0.7)', '0 0 0 10px rgba(59, 130, 246, 0)']
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {mark} {t('marks')}
            </motion.span>
          </div>
        </div>

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-sm"
            >
              💡 Tip: Read the statement carefully. Look for absolute words like "always" or "never" that might make it false.
            </motion.div>
          )}
        </AnimatePresence>

        <RadioGroup value={value} onValueChange={handleChange} disabled={disabled} className="flex gap-6">
          <motion.label 
            className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all ${
              selectedValue === 'true' ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500' : 'hover:bg-muted'
            }`}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            animate={selectedValue === 'true' ? { 
              boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.7)', '0 0 0 10px rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 0.5 }}
          >
            <RadioGroupItem value="true" id="true" className="hidden" />
            <div className="flex items-center gap-2">
              {selectedValue === 'true' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </motion.div>
              )}
              <span className="text-green-600 dark:text-green-400 font-medium text-lg">✅ True</span>
            </div>
          </motion.label>
          
          <motion.label 
            className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all ${
              selectedValue === 'false' ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500' : 'hover:bg-muted'
            }`}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            animate={selectedValue === 'false' ? { 
              boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 10px rgba(239, 68, 68, 0)']
            } : {}}
            transition={{ duration: 0.5 }}
          >
            <RadioGroupItem value="false" id="false" className="hidden" />
            <div className="flex items-center gap-2">
              {selectedValue === 'false' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <XCircle className="h-5 w-5 text-red-500" />
                </motion.div>
              )}
              <span className="text-red-600 dark:text-red-400 font-medium text-lg">❌ False</span>
            </div>
          </motion.label>
        </RadioGroup>

        {/* Animated selection indicator */}
        <AnimatePresence>
          {selectedValue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-3 text-center text-sm"
            >
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                className="text-muted-foreground"
              >
                {selectedValue === 'true' ? '✓ You selected True' : '✗ You selected False'}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};