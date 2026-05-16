// src/components/admin/features/FeatureStatusToggle.tsx

import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

interface Props {
  featureId: number;
  active: boolean;
  onToggle: (id: number) => Promise<void>;
}

export function FeatureStatusToggle({ featureId, active, onToggle }: Props) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(featureId);
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