/* eslint-disable react-hooks/purity */
// src/components/exams/MultipleChoiceQuestion.tsx

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface MultipleChoiceQuestionProps {
  question: string;
  mark: number;
  options: { option_text: string; is_correct?: boolean }[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  image?: string | null;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  mark,
  options,
  value,
  onChange,
  disabled,
  image,
}) => {
  const { t } = useApp();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  const handleChange = (val: string) => {
    setSelectedOption(val);
    onChange?.(val);
  };

  // Random color for each question
  const colors = ['purple', 'blue', 'green', 'orange', 'pink', 'indigo'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const gradientClass = `from-${color}-500 to-${color}-600`;

  return (
    <motion.div
      className="space-y-3 relative"
      initial={{ opacity: 0, scale: 0.9, rotateY: 30 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      style={{ perspective: 1000 }}
    >
      {/* Floating particles */}
      <motion.div
        className="absolute -top-5 -right-5 w-20 h-20"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Sparkles className="h-8 w-8 text-yellow-500 opacity-30" />
      </motion.div>

      <motion.div
        className="relative bg-gradient-to-br from-card to-muted/30 rounded-xl p-5 border-2 shadow-lg"
        whileHover={{
          y: -5,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3 flex-1">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertCircle className="h-5 w-5 text-primary" />
            </motion.div>
            <motion.p
              className="font-bold text-lg leading-relaxed"
              whileHover={{ scale: 1.02 }}
            >
              {question}
            </motion.p>

            {image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="mt-3"
              >
                <img
                  src={image}
                  alt="question"
                  className="w-full max-h-64 object-cover rounded-xl border shadow-md hover:scale-[1.02] transition-transform duration-300"
                />
              </motion.div>
            )}
          </div>
          <motion.span
            className={`text-xs font-bold bg-gradient-to-r ${gradientClass} text-white px-3 py-1 rounded-full shadow-lg`}
            whileHover={{ scale: 1.15, rotate: 5 }}
            animate={{
              boxShadow: [`0 0 0 0 rgba(139, 92, 246, 0.7)`, `0 0 0 10px rgba(139, 92, 246, 0)`]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🎯 {mark} {t('marks')}
          </motion.span>
        </div>

        <RadioGroup value={value} onValueChange={handleChange} disabled={disabled} className="space-y-3">
          {options.map((option, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 400 }}
              onHoverStart={() => setHoveredOption(idx)}
              onHoverEnd={() => setHoveredOption(null)}
            >
              <motion.label
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${selectedOption === option.option_text
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary shadow-md'
                  : 'hover:bg-muted/50 border-2 border-transparent'
                  }`}
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
                animate={
                  hoveredOption === idx && selectedOption !== option.option_text
                    ? { x: [0, 5, 0] }
                    : {}
                }
                transition={{ duration: 0.2 }}
              >
                <RadioGroupItem
                  value={option.option_text}
                  id={`opt-${idx}`}
                  className="w-5 h-5 border-2"
                />
                <div className="flex items-center gap-3 flex-1">
                  <motion.div
                    className={`w-7 h-7 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white flex items-center justify-center text-sm font-bold`}
                    animate={selectedOption === option.option_text ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 360]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </motion.div>
                  <Label
                    htmlFor={`opt-${idx}`}
                    className="cursor-pointer flex-1 text-base font-medium"
                  >
                    {option.option_text}
                  </Label>
                  {selectedOption === option.option_text && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
              </motion.label>
            </motion.div>
          ))}
        </RadioGroup>

        {/* Animated selection summary */}
        <AnimatePresence>
          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg text-center"
            >
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5 }}
                className="text-sm"
              >
                ✅ Selected: <span className="font-bold">{selectedOption}</span>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};