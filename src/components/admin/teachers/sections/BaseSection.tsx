// src/components/admin/teachers/sections/BaseSection.tsx
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

interface BaseSectionProps {
  title: string;
  icon?: ReactNode;
  loading?: boolean;
  onAdd?: () => void;
  children: ReactNode;
  emptyMessage?: string;
}

// 🔥 مفتوح للتوسعة (extends)، مغلق للتعديل
export function BaseSection({ 
  title, 
  icon, 
  loading, 
  onAdd, 
  children, 
  emptyMessage = "No items found" 
}: BaseSectionProps) {
  return (
    <Card className="rounded-2xl border-border p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        {onAdd && (
          <Button onClick={onAdd} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : children}
    </Card>
  );
}