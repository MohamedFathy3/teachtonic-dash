/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/dashboard/DashboardTabs.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, BookOpen, Users, FileText, CheckCircle, 
  BookMarked, BarChart3, Sparkles 
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'assignments', label: 'Assignments', icon: FileText },
  { id: 'exams', label: 'Exams', icon: CheckCircle },
  { id: 'books', label: 'Resources', icon: BookMarked },
  { id: 'reports', label: 'Analytics', icon: BarChart3 },
  { id: 'theme', label: 'Appearance', icon: Sparkles },
];

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`group relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-primary shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <tab.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
              activeTab === tab.id ? 'text-primary' : ''
            }`} />
            <span className="hidden sm:inline">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl bg-white dark:bg-slate-800 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};