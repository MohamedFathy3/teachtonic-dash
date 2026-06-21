// src/components/settings/SettingsField.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface SettingsFieldProps {
  field: {
    key: string;
    label: string;
    label_ar: string;
    type: 'text' | 'textarea' | 'url' | 'image';
    readOnly?: boolean;
    placeholder: string;
    placeholder_ar: string;
  };
  value: string;
  isChanged: boolean;
  isRTL: boolean;
  onChange: (key: string, value: string) => void;
}

export const SettingsField: React.FC<SettingsFieldProps> = ({
  field,
  value,
  isChanged,
  isRTL,
  onChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isReadOnly = field.readOnly === true;
  const label = isRTL ? field.label_ar : field.label;
  const placeholder = isRTL ? field.placeholder_ar : field.placeholder;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success(isRTL ? 'تم النسخ' : 'Copied!');
  };

  const renderField = () => {
    const commonProps = {
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        onChange(field.key, e.target.value),
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      placeholder,
      disabled: isReadOnly,
      className: isReadOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : '',
      dir: isRTL ? 'rtl' : 'ltr',
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={3}
            className={`w-full resize-y ${commonProps.className}`}
          />
        );

      case 'url':
        return (
          <div className="flex gap-2">
            <Input
              type="url"
              {...commonProps}
              className={`flex-1 ${commonProps.className}`}
            />
            {value && !isReadOnly && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(value, '_blank')}
                className="shrink-0"
              >
                <Monitor className="h-4 w-4" />
              </Button>
            )}
            {value && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                {...commonProps}
                className={`flex-1 ${commonProps.className}`}
              />
              {value && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            {value && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2"
              >
                <img 
                  src={value} 
                  alt={field.key}
                  className={`${
                    field.key === 'og_image' 
                      ? 'max-h-48 w-full' 
                      : 'h-16 w-16'
                  } rounded-lg border-2 border-gray-200 dark:border-gray-700 object-contain bg-gray-50 dark:bg-gray-900`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Image+Not+Found';
                  }}
                />
              </motion.div>
            )}
          </div>
        );

      default:
        return (
          <Input
            type="text"
            {...commonProps}
            className={`w-full ${commonProps.className}`}
          />
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`space-y-2 p-4 rounded-xl border-2 transition-all duration-300 ${
        isReadOnly 
          ? 'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30' 
          : isFocused 
            ? 'border-purple-500 shadow-lg shadow-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20'
            : isChanged 
              ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20' 
              : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">
            {label}
            {isReadOnly && (
              <Badge variant="outline" className="ml-2 text-xs text-gray-400 border-gray-300">
                {isRTL ? 'قراءة فقط' : 'Read Only'}
              </Badge>
            )}
            {isChanged && !isReadOnly && (
              <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                {isRTL ? 'غير محفوظ' : 'Unsaved'}
              </Badge>
            )}
          </label>
        </div>
      </div>

      {renderField()}
    </motion.div>
  );
};