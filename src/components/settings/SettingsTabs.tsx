/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/settings/SettingsTabs.tsx

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsGroup } from './SettingsGroup';

interface SettingsTabsProps {
  groups: Array<{
    id: string;
    label: string;
    label_ar: string;
    description: string;
    description_ar: string;
    icon: React.ElementType;
    fields: Array<any>;
  }>;
  activeTab: string;
  onTabChange: (value: string) => void;
  formData: Record<string, string>;
  originalData: Record<string, string>;
  isRTL: boolean;
  onFieldChange: (key: string, value: string) => void;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({
  groups,
  activeTab,
  onTabChange,
  formData,
  originalData,
  isRTL,
  onFieldChange,
}) => {
  // تحديد المجموعات التي تظهر لها معاينة
  const previewGroups = ['seo', 'favicon'];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid grid-cols-2 lg:grid-cols-7 gap-2 p-1 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl">
        {groups.map(group => {
          const Icon = group.icon;
          const isActive = activeTab === group.id;
          return (
            <TabsTrigger 
              key={group.id} 
              value={group.id}
              className={`gap-2 transition-all duration-300 ${
                isActive 
                  ? 'bg-white dark:bg-gray-900 shadow-lg' 
                  : ''
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : ''}`} />
              <span className="hidden sm:inline">
                {isRTL ? group.label_ar : group.label}
              </span>
              <span className="sm:hidden">
                {isRTL ? group.label_ar.slice(0, 4) : group.label.slice(0, 4)}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {groups.map(group => (
        <TabsContent key={group.id} value={group.id}>
          <SettingsGroup
            group={group}
            fields={group.fields}
            formData={formData}
            originalData={originalData}
            isRTL={isRTL}
            onFieldChange={onFieldChange}
            showPreview={previewGroups.includes(group.id)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};