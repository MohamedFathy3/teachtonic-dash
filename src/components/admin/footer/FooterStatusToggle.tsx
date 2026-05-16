// src/components/admin/footer/FooterStatusToggle.tsx

import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

interface Props {
  footerId: number;
  active: boolean;
  onToggle: (id: number) => Promise<void>;
}

export function FooterStatusToggle({ footerId, active, onToggle }: Props) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(footerId);
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