// src/components/settings/SettingsFooter.tsx

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Code, LayoutGrid, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsFooterProps {
  isRTL: boolean;
  totalFields: number;
  changedCount: number;
}

export const SettingsFooter: React.FC<SettingsFooterProps> = ({
  isRTL,
  totalFields,
  changedCount,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Code className="h-4 w-4 text-purple-600" />
          </div>
          <span>
            {isRTL 
              ? 'جميع الـ Meta Tags سيتم تطبيقها على جميع صفحات الموقع' 
              : 'All Meta Tags will be applied across all site pages'}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <LayoutGrid className="h-3 w-3" />
            {totalFields} {isRTL ? 'إعداد' : 'Settings'}
          </Badge>
          
          {changedCount > 0 && (
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertCircle className="h-3 w-3" />
              {changedCount} {isRTL ? 'تغيير غير محفوظ' : 'Unsaved changes'}
            </Badge>
          )}
          
          {changedCount === 0 && totalFields > 0 && (
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              {isRTL ? 'كل الإعدادات محفوظة' : 'All settings saved'}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
};