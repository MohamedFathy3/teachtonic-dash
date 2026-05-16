// src/components/admin/stages/StageStatusToggle.tsx

import { useApp } from '@/contexts/AppContext';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface StageStatusToggleProps {
  stageId: number;
  active: boolean;
  onToggle: (id: number) => Promise<void>;
}

export function StageStatusToggle({ stageId, active, onToggle }: StageStatusToggleProps) {
  const { t, dir } = useApp();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(stageId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : (
        <Switch
          checked={active}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-green-500"
        />
      )}
      <span className={`text-xs ${active ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
        {active ? (dir === 'rtl' ? 'نشط' : 'Active') : (dir === 'rtl' ? 'غير نشط' : 'Inactive')}
      </span>
    </div>
  );
}