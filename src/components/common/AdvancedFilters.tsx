/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/common/AdvancedFilters.tsx

import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Filter,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date' | 'phone' | 'email' | 'radio' | 'custom';
  placeholder?: string;
  icon?: ReactNode;
  options?: Array<{ value: string | number; label: string; icon?: ReactNode }>;
  condition?: (value: any, allFilters: Record<string, any>) => boolean;
  render?: (props: {
    value: any;
    onChange: (value: any) => void;
    field: FilterField;
  }) => ReactNode;
}

export interface FilterGroup {
  title?: string;
  icon?: ReactNode;
  fields: FilterField[];
  columns?: 1 | 2 | 3 | 4;
}

export interface AdvancedFiltersProps {
  groups: FilterGroup[];
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  onApply?: () => void;
  onReset?: () => void;
  loading?: boolean;
  showResetButton?: boolean;
  showApplyButton?: boolean;
  autoApply?: boolean;
  className?: string;
  children?: ReactNode;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  groups,
  filters,
  onFiltersChange,
  onApply,
  onReset,
  loading = false,
  showResetButton = true,
  showApplyButton = true,
  autoApply = false,
  className = '',
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const count = Object.values(localFilters).filter(v => v !== '' && v !== null && v !== undefined && v !== false).length;
    setActiveFiltersCount(count);
  }, [localFilters]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    
    if (autoApply) {
      onFiltersChange(newFilters);
      onApply?.();
    }
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply?.();
  };

  const handleReset = () => {
    const resetFilters = Object.keys(localFilters).reduce((acc, key) => ({ ...acc, [key]: '' }), {});
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset?.();
  };

  const getVisibleFields = (fields: FilterField[]) => {
    return fields.filter(field => {
      if (field.condition) {
        return field.condition(localFilters[field.key], localFilters);
      }
      return true;
    });
  };

  const renderFilterField = (field: FilterField) => {
    const value = localFilters[field.key] || '';

    if (field.render) {
      return field.render({
        value,
        onChange: (newValue) => handleFilterChange(field.key, newValue),
        field
      });
    }

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            className="w-full px-3 py-2 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="">{field.placeholder || 'الكل'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon && <span className="ml-1 inline-block">{option.icon}</span>}
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.key}
                value=""
                checked={value === ''}
                onChange={() => handleFilterChange(field.key, '')}
                className="w-4 h-4"
              />
              <span className="text-sm">الكل</span>
            </label>
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.key}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleFilterChange(field.key, option.value)}
                  className="w-4 h-4"
                />
                {option.icon}
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="rounded-xl"
          />
        );

      default:
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="rounded-xl"
          />
        );
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2 rounded-full"
        >
          <Filter className="h-4 w-4" />
          <span>فلاتر متقدمة</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {!isExpanded && activeFiltersCount > 0 && (
          <div className="flex gap-2">
            {showResetButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-1 text-red-500"
              >
                <RefreshCw className="h-3 w-3" />
                مسح الكل
              </Button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-xl rounded-2xl">
              {groups.map((group, groupIdx) => {
                const visibleFields = getVisibleFields(group.fields);
                if (visibleFields.length === 0) return null;

                return (
                  <div key={groupIdx} className={groupIdx > 0 ? 'mt-5 pt-4 border-t' : ''}>
                    {group.title && (
                      <div className="flex items-center gap-2 mb-4">
                        {group.icon}
                        <h3 className="font-semibold text-sm">{group.title}</h3>
                      </div>
                    )}

                    <div className={`grid grid-cols-1 md:grid-cols-${group.columns || 3} gap-4`}>
                      {visibleFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label className="flex items-center gap-1 text-sm font-medium">
                            {field.icon}
                            {field.label}
                          </Label>
                          {renderFilterField(field)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">الفلاتر النشطة:</span>
                  {Object.entries(localFilters).map(([key, value]) => {
                    if (!value || value === '' || value === false) return null;
                    
                    let fieldInfo: FilterField | undefined;
                    for (const group of groups) {
                      const found = group.fields.find(f => f.key === key);
                      if (found) {
                        fieldInfo = found;
                        break;
                      }
                    }

                    let displayLabel = String(value);
                    if (fieldInfo?.type === 'select' && fieldInfo.options) {
                      const option = fieldInfo.options.find(o => o.value === value);
                      if (option) displayLabel = option.label;
                    }
                    if (fieldInfo?.type === 'radio' && fieldInfo.options) {
                      const option = fieldInfo.options.find(o => o.value === value);
                      if (option) displayLabel = option.label;
                    }

                    return (
                      <Badge key={key} variant="secondary" className="text-xs gap-1">
                        {fieldInfo?.icon}
                        {fieldInfo?.label}: {displayLabel}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => handleFilterChange(key, '')}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}

              {(showApplyButton || showResetButton) && (
                <div className="flex justify-end gap-3 mt-5 pt-3 border-t">
                  {showResetButton && (
                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      إعادة تعيين
                    </Button>
                  )}
                  {showApplyButton && (
                    <Button 
                      size="sm" 
                      onClick={handleApply} 
                      disabled={loading}
                      className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    >
                      {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      تطبيق الفلاتر
                    </Button>
                  )}
                </div>
              )}

              {children}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedFilters;