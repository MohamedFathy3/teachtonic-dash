// src/components/admin/teachers/ThemeTab.tsx
import { ThemeCustomizer } from './ThemeCustomizer';

interface ThemeTabProps {
  teacherId: number;
  teacherName: string;
}

export function ThemeTab({ teacherId, teacherName }: ThemeTabProps) {
  return <ThemeCustomizer teacherId={teacherId} teacherName={teacherName} />;
}