// src/components/admin/teachers/dashboard/DashboardHeader.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  teacherName: string;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  teacherName, 
  onRefresh 
}) => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {teacherName}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};