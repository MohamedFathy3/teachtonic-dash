// src/components/lesson-details/LessonStats.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, Users, FileQuestion } from 'lucide-react';
import { staggerContainer, fadeIn } from '@/utils/lesson/constants';
import type { LessonDetail } from '@/types/lesson.types';

interface LessonStatsProps {
  lesson: LessonDetail;
  stats: {
    students: number;
    activeStudents: number;
    onlineStudents: number;
    centerStudents: number;
    exams: number;
    assignments: number;
    videos: number;
  };
  lang: string;
}

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode; color: string }> = ({ 
  icon: Icon, label, value, color 
}) => (
  <motion.div variants={fadeIn} whileHover={{ y: -3 }} className="text-center p-4 rounded-xl bg-gradient-to-br from-card to-muted/30 border">
    <Icon className={`h-6 w-6 text-${color}-500 mx-auto mb-2`} />
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </motion.div>
);

export const LessonStats: React.FC<LessonStatsProps> = ({ lesson, stats, lang }) => {
  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatCard 
        icon={Calendar} 
        label={lang === 'ar' ? 'التاريخ' : 'Date'} 
        value={formatDate(lesson.lession_date)} 
        color="blue" 
      />
      <StatCard 
        icon={Clock} 
        label={lang === 'ar' ? 'الوقت' : 'Time'} 
        value={lesson.lession_time?.slice(0, 5) || '—'} 
        color="purple" 
      />
      <StatCard 
        icon={DollarSign} 
        label={lang === 'ar' ? 'السعر' : 'Price'} 
        value={`EGP ${lesson.price}`} 
        color="green" 
      />
      <StatCard 
        icon={Users} 
        label={lang === 'ar' ? 'الطلاب' : 'Students'} 
        value={stats.students} 
        color="orange" 
      />
      <StatCard 
        icon={FileQuestion} 
        label={lang === 'ar' ? 'امتحانات' : 'Exams'} 
        value={stats.exams} 
        color="red" 
      />
    </motion.div>
  );
};