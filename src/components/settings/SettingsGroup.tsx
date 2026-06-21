// src/components/settings/SettingsGroup.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SettingsField } from './SettingsField';
import { OGPreview } from './OGPreview';

interface SettingsGroupProps {
  group: {
    id: string;
    label: string;
    label_ar: string;
    description: string;
    description_ar: string;
    icon: React.ElementType;
  };
  fields: Array<{
    key: string;
    label: string;
    label_ar: string;
    type: 'text' | 'textarea' | 'url' | 'image';
    readOnly?: boolean;
    placeholder: string;
    placeholder_ar: string;
  }>;
  formData: Record<string, string>;
  originalData: Record<string, string>;
  isRTL: boolean;
  onFieldChange: (key: string, value: string) => void;
  showPreview?: boolean;
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({
  group,
  fields,
  formData,
  originalData,
  isRTL,
  onFieldChange,
  showPreview = false,
}) => {
  const Icon = group.icon;
  const groupHasChanges = fields.some(f => formData[f.key] !== originalData[f.key]);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                <Icon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {isRTL ? group.label_ar : group.label}
                  <Badge variant="secondary" className="ml-2">
                    {fields.length} {isRTL ? 'حقل' : 'fields'}
                  </Badge>
                  {groupHasChanges && (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {isRTL ? 'تغييرات' : 'changes'}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isRTL ? group.description_ar : group.description}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {fields.map((field) => {
            const value = formData[field.key] || '';
            const isChanged = formData[field.key] !== originalData[field.key];
            
            return (
              <SettingsField
                key={field.key}
                field={field}
                value={value}
                isChanged={isChanged}
                isRTL={isRTL}
                onChange={onFieldChange}
              />
            );
          })}
        </CardContent>
      </Card>

      {showPreview && (
        <OGPreview formData={formData} isRTL={isRTL} />
      )}
    </div>
  );
};