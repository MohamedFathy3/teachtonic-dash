/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/sections/SubjectsSection.tsx

import { useApp } from '@/contexts/AppContext';
import { BaseSection } from './BaseSection';
import { Card } from '@/components/ui/card';
import { BookOpen, Check } from 'lucide-react';

interface SubjectsSectionProps {
  subjects: any[];
}

export function SubjectsSection({ subjects }: SubjectsSectionProps) {
  const { lang } = useApp();

  const getSubjectName = (subject: any) => {
    if (!subject) return 'Unknown';
    if (lang === 'ar' && subject.name_ar) return subject.name_ar;
    return subject.name;
  };

  const subjectsList = Array.isArray(subjects) ? subjects : [];

  return (
    <BaseSection
      title="Subjects"
      icon={<BookOpen className="h-5 w-5 text-primary" />}
      emptyMessage="No subjects assigned to this teacher"
    >
      <div className="flex flex-wrap gap-2">
        {subjectsList.map((subject) => (
          <Card key={subject.id} className="px-4 py-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-medium">{getSubjectName(subject)}</span>
            {subject.active && <Check className="h-3 w-3 text-green-500" />}
          </Card>
        ))}
      </div>
    </BaseSection>
  );
}