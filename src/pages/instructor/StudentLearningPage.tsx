// src/pages/instructor/StudentLearningPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { studentService, StudentLearningData } from '@/services/student.service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Phone, Calendar, CheckCircle, XCircle,
  BookOpen, GraduationCap, Video, Clock, DollarSign,
  Loader2, Sparkles, Trophy, Award, Calendar as CalendarIcon,
  Monitor, Building2, Users, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface StudentLearningPageProps {
  studentId: number;
  onBack: () => void;
}

export const StudentLearningPage: React.FC<StudentLearningPageProps> = ({ studentId, onBack }) => {
  const { t, lang } = useApp();
  const isRTL = lang === 'ar';
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentLearningData | null>(null);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await studentService.getStudentLearning(studentId);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch student learning data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t('loading') || 'جاري التحميل...'}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('noData') || 'لا توجد بيانات'}</p>
        <Button onClick={onBack} className="mt-4">{t('back') || 'رجوع'}</Button>
      </div>
    );
  }

  const { student, semesters, courses, lessons } = data;
  const studentName = isRTL && (student as any).name_ar ? (student as any).name_ar : student.name;
  const stageName = isRTL && student.stage?.name_ar ? student.stage.name_ar : student.stage?.name;

  const getAttendanceBadge = (type: string | null) => {
    if (type === 'online') {
      return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 gap-1 px-3 py-1"><Monitor className="h-3 w-3" /> أونلاين</Badge>;
    }
    if (type === 'center') {
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 gap-1 px-3 py-1"><Building2 className="h-3 w-3" /> سنتر</Badge>;
    }
    return <Badge variant="outline" className="gap-1 px-3 py-1">غير محدد</Badge>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // إحصائيات
  const stats = {
    totalCourses: courses?.length || 0,
    totalSemesters: semesters?.length || 0,
    totalLessons: lessons?.length || 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t('backToStudents') || 'رجوع للطلاب'}
          </Button>
        </div>

        {/* Student Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="relative overflow-hidden rounded-3xl border-0 shadow-xl">
            {/* Header Gradient */}
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-cyan-600">
              <div className="absolute -bottom-12 left-6">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800">
                  <span className="text-3xl font-bold text-primary">
                    {studentName?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="p-6 pt-14">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{studentName}</h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getAttendanceBadge(student.type_of_attendance)}
                    {student.active ? (
                      <Badge className="bg-green-500 gap-1 px-3 py-1"><CheckCircle className="h-3 w-3" /> نشط</Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1 px-3 py-1"><XCircle className="h-3 w-3" /> غير نشط</Badge>
                    )}
                    <Badge variant="outline" className="gap-1 px-3 py-1">
                      <GraduationCap className="h-3 w-3" />
                      {stageName || `المرحلة ${student.stage_id}`}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-muted/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('phone') || 'الهاتف'}</p>
                    <p className="font-medium">{student.phone}</p>
                  </div>
                </div>
                {student.phone_parent && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('parentPhone') || 'هاتف ولي الأمر'}</p>
                      <p className="font-medium">{student.phone_parent}</p>
                    </div>
                  </div>
                )}
                {student.code_parent && (
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('parentCode') || 'كود ولي الأمر'}</p>
                      <p className="font-mono font-medium">{student.code_parent}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('registeredDate') || 'تاريخ التسجيل'}</p>
                    <p className="font-medium">{formatDate(student.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: t('courses') || 'الكورسات', value: stats.totalCourses, icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
            { label: t('semesters') || 'الترم', value: stats.totalSemesters, icon: CalendarIcon, color: 'from-purple-500 to-pink-500' },
            { label: t('lessons') || 'الدروس', value: stats.totalLessons, icon: Video, color: 'from-green-500 to-emerald-500' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative overflow-hidden rounded-xl p-4 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${stat.color.split(' ')[1]}20, ${stat.color.split(' ')[3]}10)` }}
            >
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur">
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Learning Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto rounded-2xl bg-muted/60 p-1 h-auto flex-nowrap">
            <TabsTrigger value="courses" className="rounded-xl px-4 py-2 gap-2">
              <BookOpen className="h-4 w-4" />
              {t('courses') || 'الكورسات'} ({stats.totalCourses})
            </TabsTrigger>
            <TabsTrigger value="semesters" className="rounded-xl px-4 py-2 gap-2">
              <CalendarIcon className="h-4 w-4" />
              {t('semesters') || 'الترم'} ({stats.totalSemesters})
            </TabsTrigger>
            <TabsTrigger value="lessons" className="rounded-xl px-4 py-2 gap-2">
              <Video className="h-4 w-4" />
              {t('lessons') || 'الدروس'} ({stats.totalLessons})
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-6">
            {courses?.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t('noCourses') || 'لا توجد كورسات مسجلة لهذا الطالب'}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses?.map((course: any, idx: number) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -3 }}
                  >
                    <Card className="p-4 rounded-xl hover:shadow-lg transition-all">
                      <div className="flex gap-3">
                        {course.image?.fullUrl ? (
                          <img src={course.image.fullUrl} alt={course.title} className="w-20 h-20 rounded-xl object-cover" />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{isRTL ? course.title_ar : course.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{course.hour_time_course}</span>
                            <DollarSign className="h-3 w-3 ml-1" />
                            <span>{course.price} EGP</span>
                          </div>
                          {course.progress !== undefined && (
                            <div className="mt-2">
                              <Progress value={course.progress} className="h-1" />
                              <p className="text-xs text-muted-foreground mt-1">{course.progress}% مكتمل</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Semesters Tab */}
          <TabsContent value="semesters" className="mt-6">
            {semesters?.length === 0 ? (
              <Card className="p-12 text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t('noSemesters') || 'لا توجد ترم مسجلة لهذا الطالب'}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {semesters?.map((semester: any, idx: number) => (
                  <motion.div
                    key={semester.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -3 }}
                  >
                    <Card className="p-4 rounded-xl hover:shadow-lg transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <CalendarIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{isRTL ? semester.name_ar : semester.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>السعر: {semester.price} EGP</span>
                            {semester.discount > 0 && <span>خصم: {semester.discount}%</span>}
                          </div>
                          <Badge variant={semester.active ? "default" : "secondary"} className="mt-2 text-xs">
                            {semester.active ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="mt-6">
            {lessons?.length === 0 ? (
              <Card className="p-12 text-center">
                <Video className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t('noLessons') || 'لا توجد دروس مسجلة لهذا الطالب'}</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {lessons?.map((lesson: any, idx: number) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card className="p-4 rounded-xl hover:shadow-lg transition-all">
                      <div className="flex items-start gap-4">
                        {lesson.image?.fullUrl ? (
                          <img src={lesson.image.fullUrl} alt={lesson.title} className="w-16 h-16 rounded-xl object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{isRTL ? lesson.title_ar : lesson.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{lesson.description}</p>
                            </div>
                            {lesson.completed && (
                              <Badge className="bg-green-500 gap-1">
                                <CheckCircle className="h-3 w-3" />
                                مكتمل
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                            {lesson.lession_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(lesson.lession_date)}
                              </span>
                            )}
                            {lesson.lession_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lesson.lession_time}
                              </span>
                            )}
                            {lesson.price > 0 && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {lesson.price} EGP
                              </span>
                            )}
                          </div>
                          {lesson.content_link && (
                            <a
                              href={lesson.content_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                            >
                              <Eye className="h-3 w-3" />
                              مشاهدة الدرس
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default StudentLearningPage;