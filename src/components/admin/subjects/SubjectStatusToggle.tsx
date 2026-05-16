// src/components/admin/subjects/SubjectStatusToggle.tsx

import { useApp } from '@/contexts/AppContext';
import { Switch } from '@/components/ui/switch';

interface SubjectStatusToggleProps {
  subjectId: number;
  active: boolean;
  onToggle: (id: number) => Promise<void>;
}

export function SubjectStatusToggle({ subjectId, active, onToggle }: SubjectStatusToggleProps) {
  const { dir } = useApp();

  const handleToggle = async () => {
    await onToggle(subjectId);
  };

  return (
    <div className="flex items-center gap-2" dir="ltr">
      <Switch
        checked={active}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
      />
      <span className={`text-xs font-medium ${
        active ? 'text-green-600' : 'text-gray-500'
      }`}>
        {active ? (dir === 'rtl' ? 'نشط' : 'Active') : (dir === 'rtl' ? 'غير نشط' : 'Inactive')}
      </span>
    </div>
  );
}