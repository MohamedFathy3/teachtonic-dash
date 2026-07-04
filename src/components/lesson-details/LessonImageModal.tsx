// src/components/lesson-details/LessonImageModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const LessonImageModal: React.FC<{
  imageUrl: string | null;
  onClose: () => void;
}> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.img
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          src={imageUrl}
          alt="Full size"
          className="max-w-full max-h-full rounded-lg object-contain"
        />
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          onClick={onClose}
        >
          <X className="h-6 w-6 text-white" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};