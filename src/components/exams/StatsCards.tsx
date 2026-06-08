// src/pages/instructor/exams/components/StatsCards.tsx

import { motion } from 'framer-motion';
import { FileText, Eye, Power, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const statsCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400 } },
  hover: { scale: 1.03, y: -3, transition: { type: "spring", stiffness: 400 } },
};

interface StatsCardsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    avgMarks: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const { t, lang } = useApp();

  const cards = [
    { label: t('totalExams'), value: stats.total, icon: FileText, color: 'from-blue-500 to-cyan-500', delay: 0 },
    { label: t('activeExams'), value: stats.active, icon: Eye, color: 'from-green-500 to-emerald-500', delay: 0.1 },
    { label: t('inactiveExams'), value: stats.inactive, icon: Power, color: 'from-orange-500 to-red-500', delay: 0.2 },
    { label: t('avgMarks'), value: stats.avgMarks, icon: TrendingUp, color: 'from-purple-500 to-pink-500', delay: 0.3 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((stat, idx) => (
        <motion.div
          key={idx}
          variants={statsCardVariants}
          whileHover="hover"
          className="relative overflow-hidden rounded-xl bg-gradient-to-r p-4 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${stat.color.split(' ')[1]}20, ${stat.color.split(' ')[3]}10)` }}
        >
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: stat.delay, type: "spring" }}
                className="text-2xl font-bold mt-1"
              >
                {stat.value}
              </motion.p>
            </div>
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
        </motion.div>
      ))}
    </div>
  );
};