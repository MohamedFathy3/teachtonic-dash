/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/TeacherStats.tsx
import { StatCard } from '@/components/lms/StatCard';
import { BookOpen, Users, Layers, FileText } from 'lucide-react';

interface TeacherStatsProps {
  teacher: any;
}

export function TeacherStats({ teacher }: TeacherStatsProps) {
  const stats = [
    { label: "Stages", value: String(teacher.website?.stages?.length || 0), icon: Layers, variant: "primary" as const },
    { label: "Subjects", value: String(teacher.website?.subjects?.length || 0), icon: BookOpen, variant: "accent" as const },
    { label: "Hero Sections", value: "0", icon: FileText, variant: "warm" as const },
    { label: "Features", value: "0", icon: Users, variant: "info" as const },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}