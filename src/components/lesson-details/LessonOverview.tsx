// src/components/lesson-details/LessonOverview.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Info, Calendar, DollarSign, Percent, Lock, CheckCircle2,
  Award, GraduationCap, Users, Globe
} from 'lucide-react';
import { InfoRow, Hash } from './SharedComponents';
import type { LessonDetail } from '@/types/lesson.types';

interface LessonOverviewProps {
  lesson: LessonDetail;
  lang: string;
  isRTL: boolean;
}

export const LessonOverview: React.FC<LessonOverviewProps> = ({ lesson, lang, isRTL }) => {
  const getTitle = () => {
    if (isRTL && lesson?.titles_ar?.length) return lesson.titles_ar[0];
    if (lesson?.titles?.length) return lesson.titles[0];
    return '—';
  };

  const getAllTitles = () => {
    return isRTL ? lesson?.titles_ar : lesson?.titles;
  };

  const getDescription = () => {
    return isRTL ? lesson?.description_ar : lesson?.description;
  };

  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const title = getTitle();
  const allTitles = getAllTitles();
  const description = getDescription();
  const courseTitle = isRTL ? lesson.course?.title_ar : lesson.course?.title;
  const stageName = isRTL ? lesson.course?.stage?.name_ar : lesson.course?.stage?.name;

  return (
    <div className="space-y-5 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="rounded-xl overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {lang === 'ar' ? 'وصف الدرس' : 'Lesson Description'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {description || (lang === 'ar' ? 'لا يوجد وصف' : 'No description')}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              {lang === 'ar' ? 'معلومات أساسية' : 'Basic Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <InfoRow icon={Hash} label="ID" value={lesson.id} />
              <InfoRow icon={Calendar} label={lang === 'ar' ? 'تاريخ الإنشاء' : 'Created At'} value={formatDate(lesson.createdAt)} />
              <InfoRow icon={DollarSign} label={lang === 'ar' ? 'السعر' : 'Price'} value={`EGP ${lesson.price}`} />
              {lesson.discount !== '0.00' && (
                <InfoRow icon={Percent} label={lang === 'ar' ? 'الخصم' : 'Discount'} value={`EGP ${lesson.discount}`} />
              )}
              <InfoRow icon={Lock} label={lang === 'ar' ? 'امتحان إجباري' : 'Exam Required'} value={lesson.must_pass_to_unlock ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')} />
              <InfoRow icon={CheckCircle2} label={lang === 'ar' ? 'تم الحضور' : 'Attended'} value={lesson.attended ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub Titles */}
      {allTitles && allTitles.length > 0 && (
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {lang === 'ar' ? 'العناوين' : 'Titles'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allTitles.map((t, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm py-1 px-3">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Info */}
      {lesson.course && (
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              {lang === 'ar' ? 'معلومات الكورس' : 'Course Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoRow icon={BookOpen} label={lang === 'ar' ? 'عنوان الكورس' : 'Course Title'} value={courseTitle} />
              <InfoRow icon={DollarSign} label={lang === 'ar' ? 'سعر الكورس' : 'Course Price'} value={`EGP ${lesson.course.price}`} />
              {lesson.course.discount !== '0.00' && (
                <InfoRow icon={Percent} label={lang === 'ar' ? 'خصم الكورس' : 'Course Discount'} value={`EGP ${lesson.course.discount}`} />
              )}
              <InfoRow icon={Users} label={lang === 'ar' ? 'عدد الطلاب' : 'Students Count'} value={lesson.course.count_student} />
              <InfoRow icon={Globe} label={lang === 'ar' ? 'نوع الكورس' : 'Course Type'} value={lesson.course.type === 'online' ? (lang === 'ar' ? 'أونلاين' : 'Online') : (lang === 'ar' ? 'سنتر' : 'Center')} />
              {stageName && <InfoRow icon={GraduationCap} label={lang === 'ar' ? 'المرحلة' : 'Stage'} value={stageName} />}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};