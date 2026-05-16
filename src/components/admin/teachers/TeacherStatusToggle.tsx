// src/components/admin/teachers/TeacherStatusToggle.tsx

import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

interface Props {
  teacherId: number;
  active: boolean;
  onToggle: (id: number) => Promise<void>;
}

export function TeacherStatusToggle({ teacherId, active, onToggle }: Props) {
  const [loading, setLoading] = useState(false);
  const { t } = useApp();

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(teacherId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Switch
        checked={active}
        onCheckedChange={handleToggle}
        disabled={loading}
        className="data-[state=checked]:bg-green-500"
      />
    </div>
  );
}