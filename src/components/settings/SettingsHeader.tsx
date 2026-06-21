// src/components/settings/SettingsHeader.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Settings as SettingsIcon, Zap, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsHeaderProps {
  isRTL: boolean;
  loading: boolean;
  saving: boolean;
  changedCount: number;
  onRefresh: () => void;
  onSave: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  isRTL,
  loading,
  saving,
  changedCount,
  onRefresh,
  onSave,
}) => {
  return (
    <div className="relative mb-10">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl -z-10"></div>
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25">
            <SettingsIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {isRTL ? 'إعدادات الموقع' : 'Site Settings'}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              {isRTL 
                ? 'إدارة الـ Meta Tags وإعدادات SEO ووسائل التواصل الاجتماعي'
                : 'Manage Meta Tags, SEO settings, and social media integration'
              }
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {changedCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
              <Sparkles className="h-3 w-3 mr-1" />
              {changedCount} {isRTL ? 'تغيير' : 'changes'}
            </Badge>
          )}

          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
          
          <Button 
            onClick={onSave}
            disabled={saving || loading || changedCount === 0}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isRTL ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isRTL ? 'حفظ الكل' : 'Save All'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};