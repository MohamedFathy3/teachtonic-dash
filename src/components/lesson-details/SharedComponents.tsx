// src/components/lesson-details/SharedComponents.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/utils/lesson/constants';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, label, value, color 
}) => (
  <motion.div variants={fadeIn} whileHover={{ y: -3 }} className="text-center p-4 rounded-xl bg-gradient-to-br from-card to-muted/30 border">
    <Icon className={`h-6 w-6 text-${color}-500 mx-auto mb-2`} />
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </motion.div>
);

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}

export const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
    <Icon className="h-4 w-4 text-muted-foreground" />
    <span className="text-sm text-muted-foreground">{label}:</span>
    <span className="text-sm font-medium">{value || '—'}</span>
  </div>
);

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  icon: Icon, label, value, color 
}) => (
  <div className="text-center p-3 rounded-xl bg-muted/30 border">
    <Icon className={`h-5 w-5 text-${color}-500 mx-auto mb-1`} />
    <p className="text-xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

interface EmptyStateProps {
  icon: React.ElementType;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, message }) => (
  <div className="text-center py-12 bg-muted/30 rounded-xl">
    <Icon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-3" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

export const Hash: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
  </svg>
);