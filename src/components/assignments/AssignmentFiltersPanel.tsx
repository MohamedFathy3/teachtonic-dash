/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/assignments/AssignmentFiltersPanel.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import { GraduationCap, BookOpen, Power, DollarSign, Search, X } from 'lucide-react';

interface AssignmentFilters {
  stageId: number | null;
  lessonId: number | null;
  marksMin: number | null;
  active: boolean | null;
}

interface FiltersPanelProps {
  show: boolean;
  filters: AssignmentFilters;
  setFilters: React.Dispatch<React.SetStateAction<AssignmentFilters>>;
  stages: any[];
  onApply: () => void;
  onClear: () => void;
}

export const AssignmentFiltersPanel: React.FC<FiltersPanelProps> = ({
  show,
  filters,
  setFilters,
  stages,
  onApply,
  onClear,
}) => {
  const { t, lang } = useApp();

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -20 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -20 }}
      className="overflow-hidden"
    >
      <Card className="p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-xl rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Stage Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm font-medium">
              <GraduationCap className="h-4 w-4 text-primary" />
              {lang === 'ar' ? 'المرحلة' : 'Stage'}
            </Label>
            <select
              value={filters.stageId || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, stageId: e.target.value ? Number(e.target.value) : null }))}
              className="w-full px-3 py-2 rounded-xl border bg-background"
            >
              <option value="">{lang === 'ar' ? 'كل المراحل' : 'All Stages'}</option>
              {stages?.map((stage: any) => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </div>

          {/* Lesson Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-primary" />
              {lang === 'ar' ? 'الدرس' : 'Lesson'}
            </Label>
            <AsyncSelect
              key={`filter-lesson-${filters.stageId}`}
              configKey="lessons"
              value={filters.lessonId}
              onChange={(id) => setFilters(prev => ({ ...prev, lessonId: id }))}
              placeholder={lang === 'ar' ? 'كل الدروس' : 'All Lessons'}
              clearable
              extraFilters={filters.stageId ? { stage_id: filters.stageId } : {}}
            />
          </div>

          {/* Min Marks */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-primary" />
              {lang === 'ar' ? 'الدرجة من' : 'Marks From'}
            </Label>
            <Input
              type="number"
              value={filters.marksMin || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, marksMin: e.target.value ? Number(e.target.value) : null }))}
              placeholder="0"
              className="rounded-xl"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-sm font-medium">
              <Power className="h-4 w-4 text-primary" />
              {lang === 'ar' ? 'الحالة' : 'Status'}
            </Label>
            <select
              value={filters.active === null ? '' : filters.active.toString()}
              onChange={(e) => {
                const val = e.target.value;
                setFilters(prev => ({
                  ...prev,
                  active: val === '' ? null : val === 'true',
                }));
              }}
              className="w-full px-3 py-2 rounded-xl border bg-background"
            >
              <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
              <option value="true">✅ {lang === 'ar' ? 'نشط' : 'Active'}</option>
              <option value="false">❌ {lang === 'ar' ? 'غير نشط' : 'Inactive'}</option>
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex justify-end gap-3 mt-5 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={onClear} className="gap-2">
            <X className="h-4 w-4" />
            {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
          </Button>
          <Button size="sm" onClick={onApply} className="gap-2 bg-gradient-to-r from-primary to-secondary">
            <Search className="h-4 w-4" />
            {lang === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
          </Button>
        </div>

        {/* Active Filters Display */}
        {(filters.stageId || filters.lessonId || filters.active !== null || filters.marksMin) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
            <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'الفلاتر النشطة:' : 'Active Filters:'}</span>
            {filters.stageId && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <GraduationCap className="h-3 w-3" /> {lang === 'ar' ? 'المرحلة' : 'Stage'}
              </Badge>
            )}
            {filters.lessonId && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <BookOpen className="h-3 w-3" /> {lang === 'ar' ? 'الدرس' : 'Lesson'}
              </Badge>
            )}
            {filters.active !== null && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Power className="h-3 w-3" /> {filters.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
              </Badge>
            )}
            {filters.marksMin && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <DollarSign className="h-3 w-3" /> {filters.marksMin}+
              </Badge>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
};