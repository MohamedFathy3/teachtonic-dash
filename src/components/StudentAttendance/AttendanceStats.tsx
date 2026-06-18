// src/pages/instructor/StudentAttendance/components/AttendanceStats.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

interface AttendanceStatsProps {
  totalStudents: number;
  present: number;
  absent: number;
  isRTL: boolean;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({
  totalStudents,
  present,
  absent,
  isRTL,
}) => {
  const stats = [
    {
      label: isRTL ? 'إجمالي الطلاب' : 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      label: isRTL ? 'حاضر' : 'Present',
      value: present,
      icon: UserCheck,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      label: isRTL ? 'غائب' : 'Absent',
      value: absent,
      icon: UserX,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-950/20',
    },
    {
      label: isRTL ? 'نسبة الحضور' : 'Attendance Rate',
      value: totalStudents > 0 ? `${Math.round((present / totalStudents) * 100)}%` : '0%',
      icon: Clock,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};