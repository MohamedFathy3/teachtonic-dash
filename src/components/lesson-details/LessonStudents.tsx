// src/components/lesson-details/LessonStudents.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle2, XCircle, Globe, Phone, User, Calendar as CalendarIcon,
  Search, Filter, X, Download, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SummaryCard, EmptyState } from './SharedComponents';
import type { Student, StudentFilters, Stats } from '@/types/lesson.types';

interface LessonStudentsProps {
  students: Student[];
  filteredStudents: Student[];
  stats: Stats;
  filters: StudentFilters;
  setFilters: React.Dispatch<React.SetStateAction<StudentFilters>>;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  onExport: () => void;
  lang: string;
  formatDate: (date: string) => string;
}

export const LessonStudents: React.FC<LessonStudentsProps> = ({
  students,
  filteredStudents,
  stats,
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  clearFilters,
  hasActiveFilters,
  onExport,
  lang,
  formatDate,
}) => {
  if (students.length === 0) {
    return <EmptyState icon={Users} message={lang === 'ar' ? 'لا يوجد طلاب مسجلين في هذا الكورس' : 'No students enrolled in this course'} />;
  }

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <SummaryCard icon={Users} label={lang === 'ar' ? 'إجمالي الطلاب' : 'Total'} value={stats.total} color="blue" />
        <SummaryCard icon={CheckCircle2} label={lang === 'ar' ? 'نشط' : 'Active'} value={stats.active} color="green" />
        <SummaryCard icon={XCircle} label={lang === 'ar' ? 'غير نشط' : 'Inactive'} value={stats.inactive} color="red" />
        <SummaryCard icon={Globe} label={lang === 'ar' ? 'أونلاين' : 'Online'} value={stats.online} color="purple" />
      </div>

      {/* Filter Button and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {lang === 'ar' ? 'فلاتر متقدمة' : 'Advanced Filters'}
            {hasActiveFilters && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {[filters.search, filters.typeOfAttendance, filters.active, filters.attended].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          
          {filteredStudents.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {lang === 'ar' ? 'تصدير Excel' : 'Export Excel'}
            </Button>
          )}
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-red-500">
              <X className="h-4 w-4" />
              {lang === 'ar' ? 'مسح الكل' : 'Clear All'}
            </Button>
          )}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={lang === 'ar' ? 'بحث بالاسم أو المعرف...' : 'Search by name or ID...'}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-xl rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {lang === 'ar' ? 'نوع الحضور' : 'Attendance Type'}
                  </label>
                  <select
                    value={filters.typeOfAttendance}
                    onChange={(e) => setFilters(prev => ({ ...prev, typeOfAttendance: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border bg-background"
                  >
                    <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                    <option value="online">💻 {lang === 'ar' ? 'أونلاين' : 'Online'}</option>
                    <option value="center">🏢 {lang === 'ar' ? 'سنتر' : 'Center'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {lang === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={filters.active}
                    onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border bg-background"
                  >
                    <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                    <option value="active">✅ {lang === 'ar' ? 'نشط' : 'Active'}</option>
                    <option value="inactive">❌ {lang === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {lang === 'ar' ? 'حضور الدرس' : 'Lesson Attendance'}
                  </label>
                  <select
                    value={filters.attended}
                    onChange={(e) => setFilters(prev => ({ ...prev, attended: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border bg-background"
                  >
                    <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                    <option value="attended">✅ {lang === 'ar' ? 'حاضر' : 'Attended'}</option>
                    <option value="absent">❌ {lang === 'ar' ? 'غائب' : 'Absent'}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <Button size="sm" onClick={() => setShowFilters(false)} className="gap-2 bg-gradient-to-r from-primary to-secondary">
                  <CheckCircle2 className="h-3 w-3" />
                  {lang === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
                </Button>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'الفلاتر النشطة:' : 'Active Filters:'}</span>
                  {filters.typeOfAttendance && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      {filters.typeOfAttendance === 'online' ? '💻 أونلاين' : '🏢 سنتر'}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, typeOfAttendance: '' }))} />
                    </Badge>
                  )}
                  {filters.active && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      {filters.active === 'active' ? '✅ نشط' : '❌ غير نشط'}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, active: '' }))} />
                    </Badge>
                  )}
                  {filters.attended && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      {filters.attended === 'attended' ? '✅ حاضر' : '❌ غائب'}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, attended: '' }))} />
                    </Badge>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          {lang === 'ar' 
            ? `عرض ${filteredStudents.length} من ${stats.total} طالب`
            : `Showing ${filteredStudents.length} of ${stats.total} students`}
        </p>
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <Search className="h-16 w-16 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{lang === 'ar' ? 'لا توجد نتائج مطابقة للبحث' : 'No matching students found'}</p>
          <Button variant="link" onClick={clearFilters} className="mt-2">
            {lang === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, idx) => (
            <StudentCard 
              key={student.id} 
              student={student} 
              idx={idx} 
              lang={lang} 
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </>
  );
};

// Student Card Component
const StudentCard: React.FC<{ student: Student; idx: number; lang: string; formatDate: (date: string) => string }> = ({ 
  student, idx, lang, formatDate 
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: idx * 0.05 }}
    whileHover={{ y: -3 }}
    className="p-4 rounded-xl bg-gradient-to-r from-card to-muted/20 border shadow-sm"
  >
    <div className="flex items-start gap-3">
      <Avatar className="h-12 w-12 border-2 border-primary/20">
        {student.imageUrl ? (
          <AvatarImage src={student.imageUrl} alt={student.name} />
        ) : null}
        <AvatarFallback className="bg-gradient-to-r from-primary/20 to-secondary/20 text-lg font-bold">
          {student.name?.charAt(0)?.toUpperCase() || 'S'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold">{student.name}</p>
            <p className="text-xs text-muted-foreground">ID: {student.id}</p>
          </div>
          <Badge variant={student.active ? "default" : "secondary"} className="text-[10px]">
            {student.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
          </Badge>
        </div>
        
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{student.phone}</span>
          </div>
          {student.phone_parent && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{lang === 'ar' ? 'ولي الأمر:' : 'Parent:'} {student.phone_parent}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {student.type_of_attendance === 'online' ? (
              <Globe className="h-3 w-3 text-blue-500" />
            ) : (
              <MapPin className="h-3 w-3 text-green-500" />
            )}
            <span>
              {student.type_of_attendance === 'online' 
                ? (lang === 'ar' ? 'أونلاين' : 'Online')
                : (lang === 'ar' ? 'سنتر' : 'Center')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            <span>{lang === 'ar' ? 'تاريخ التسجيل:' : 'Joined:'} {formatDate(student.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);