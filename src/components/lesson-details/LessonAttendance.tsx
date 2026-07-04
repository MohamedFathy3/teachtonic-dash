// src/components/lesson-details/LessonAttendance.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, CheckCircle2, XCircle, Percent, Phone, User, Clock,
  Loader2, Download, Search 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { SummaryCard, EmptyState } from './SharedComponents';
import type { AttendanceRecord, AttendanceFilters } from '@/types/lesson.types';

interface LessonAttendanceProps {
  attendanceData: AttendanceRecord[];
  attendanceStats: {
    total: number;
    attended: number;
    absent: number;
    online: number;
    center: number;
  };
  loading: boolean;
  filters: AttendanceFilters;
  setFilters: React.Dispatch<React.SetStateAction<AttendanceFilters>>;
  filteredAttendance: AttendanceRecord[];
  onExport: () => void;
  lang: string;
}

export const LessonAttendance: React.FC<LessonAttendanceProps> = ({
  attendanceData,
  attendanceStats,
  loading,
  filters,
  setFilters,
  filteredAttendance,
  onExport,
  lang,
}) => {
  return (
    <div className="space-y-4 mt-4">
      {/* Attendance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={Users} label={lang === 'ar' ? 'إجمالي' : 'Total'} value={attendanceStats.total} color="blue" />
        <SummaryCard icon={CheckCircle2} label={lang === 'ar' ? 'حاضر' : 'Attended'} value={attendanceStats.attended} color="green" />
        <SummaryCard icon={XCircle} label={lang === 'ar' ? 'غائب' : 'Absent'} value={attendanceStats.absent} color="red" />
        <SummaryCard 
          icon={Percent} 
          label={lang === 'ar' ? 'نسبة الحضور' : 'Attendance Rate'} 
          value={`${attendanceStats.total > 0 ? Math.round((attendanceStats.attended / attendanceStats.total) * 100) : 0}%`} 
          color="purple" 
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          <select
            value={filters.attended}
            onChange={(e) => setFilters(prev => ({ ...prev, attended: e.target.value }))}
            className="px-3 py-2 rounded-xl border bg-background text-sm"
          >
            <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
            <option value="1">✅ {lang === 'ar' ? 'حاضر' : 'Attended'}</option>
            <option value="0">❌ {lang === 'ar' ? 'غائب' : 'Absent'}</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2"
            disabled={attendanceData.length === 0}
          >
            <Download className="h-4 w-4" />
            {lang === 'ar' ? 'تصدير Excel' : 'Export Excel'}
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={lang === 'ar' ? 'بحث باسم الطالب...' : 'Search by student name...'}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {lang === 'ar' 
          ? `عرض ${filteredAttendance.length} من ${attendanceStats.total} سجل`
          : `Showing ${filteredAttendance.length} of ${attendanceStats.total} records`}
      </p>

      {/* Attendance List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAttendance.length === 0 ? (
        <EmptyState icon={CheckCircle2} message={lang === 'ar' ? 'لا توجد سجلات حضور' : 'No attendance records'} />
      ) : (
        <div className="space-y-3">
          {filteredAttendance.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2">
                  <AvatarFallback className="bg-gradient-to-r from-primary/20 to-secondary/20 text-lg font-bold">
                    {item.student?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-semibold">{item.student?.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">ID: {item.student?.id || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.attended ? "default" : "destructive"} className="gap-1">
                        {item.attended ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {item.attended ? (lang === 'ar' ? 'حاضر' : 'Attended') : (lang === 'ar' ? 'غائب' : 'Absent')}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {item.student?.type_of_attendance === 'online' ? '💻 أونلاين' : '🏢 سنتر'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{item.student?.phone || '—'}</span>
                    </div>
                    {item.student?.phone_parent && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{lang === 'ar' ? 'ولي الأمر:' : 'Parent:'} {item.student.phone_parent}</span>
                      </div>
                    )}
                    {item.attended_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{lang === 'ar' ? 'وقت الحضور:' : 'Time:'} {new Date(item.attended_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};