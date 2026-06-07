/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/courses/CourseDetails.tsx

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, DollarSign, BookOpen, GraduationCap, User, MapPin, Globe, ChevronLeft, Edit2, Heart, Share2, Eye, Award, Target, CheckCircle2, Plus, Trash2, Video, Link as LinkIcon, Loader2, Phone, Mail, Star, UserCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { courseDetailService } from '@/services/course-detail.service';
import { courseService } from '@/services/course.service';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Course } from '@/types/course.types';
import type { CourseDetail } from '@/types/course-detail.types';
import FileUploader from '@/components/FileUploader';
import { Switch } from '@/components/ui/switch';

interface CourseDetailsProps {
  courseId: number;
  onBack?: () => void;
  onEdit?: () => void;
}

// ✅ أنيميشن
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const InfoCard: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode; color?: string }> = ({
  icon: Icon, label, value, color = "primary"
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-card to-muted/30 border border-border/50 shadow-sm"
  >
    <div className={`p-2.5 rounded-xl bg-gradient-to-r from-${color}-500/20 to-${color}-600/10`}>
      <Icon className={`h-5 w-5 text-${color}-500`} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-semibold mt-1 text-lg">{value || '—'}</p>
    </div>
  </motion.div>
);

export const CourseDetails: React.FC<CourseDetailsProps> = ({ courseId, onBack, onEdit }) => {
  const { t, lang } = useApp();
  const isRTL = lang === 'ar';

  // ✅ State للكورس
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiked, setIsLiked] = useState(false);

  // 🔥 State للدروس - استخدام show API
  const [lessons, setLessons] = useState<CourseDetail[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsPagination, setLessonsPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1
  });

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<CourseDetail | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<CourseDetail | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedPdfId, setSelectedPdfId] = useState<number | null>(null);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  // فرم الدرس
  const [lessonForm, setLessonForm] = useState({
    title: '',        // هيُحفظ في titles عند الإرسال
    title_ar: '',
    description: '',
    description_ar: '',
    content_link: '',
    lession_date: new Date().toISOString().split('T')[0],
    lession_time: '20:00',
    price: 0,
    image_id: null as number | null,
    pdf_id: null as number | null,     // ✨ جديد
  });


  // ✅ جلب بيانات الكورس من API
  const fetchCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseService.getCourse(courseId);
      console.log('📚 Course data:', response);
      setCourse(response);
    } catch (err: any) {
      console.error('Error fetching course:', err);
      setError(err.message || 'Failed to load course');
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل الكورس' : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 جلب الدروس باستخدام show API (index مع فلتر)
  const fetchLessons = async (page = 1) => {
    if (!courseId) return;
    setLessonsLoading(true);
    try {
      const response = await courseDetailService.getAll({
        course_id: courseId,
        page: page,
        perPage: lessonsPagination.perPage
      });

      console.log('📚 Lessons from API:', response);

      // التعامل مع استجابة الـ API
      const lessonsData = response?.data || [];
      setLessons(lessonsData);

      // تحديث معلومات الـ pagination
      if (response?.pagination) {
        setLessonsPagination({
          currentPage: response.pagination.currentPage || page,
          perPage: response.pagination.perPage || 10,
          total: response.pagination.total || 0,
          lastPage: response.pagination.lastPage || 1
        });
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل الدروس' : 'Error loading lessons');
    } finally {
      setLessonsLoading(false);
    }
  };

  // 🔥 دالة تبديل must_pass_to_unlock
  const handleToggleMustPass = async (lesson: CourseDetail, checked: boolean) => {
    try {
      await courseDetailService.toggleMustPassToUnlock(lesson.id, checked);

      // تحديث القائمة المحلية
      setLessons(prev => prev.map(l =>
        l.id === lesson.id ? { ...l, must_pass_to_unlock: checked } : l
      ));

      // عرض رسالة نجاح
      toast.success(
        checked
          ? (lang === 'ar' ? 'تم تفعيل شرط اجتياز الامتحان' : 'Exam pass requirement enabled')
          : (lang === 'ar' ? 'تم إلغاء شرط اجتياز الامتحان' : 'Exam pass requirement disabled')
      );
    } catch (error) {
      console.error('Error toggling must_pass_to_unlock:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء تغيير الإعداد' : 'Error changing setting');
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  // جلب الدروس بعد تحميل الكورس
  useEffect(() => {
    if (courseId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchLessons();
    }
  }, [courseId]);

  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string, time: string) => {
    if (!date) return '—';
    const formattedDate = format(new Date(date), 'dd/MM/yyyy', {
      locale: lang === 'ar' ? arSA : enUS,
    });
    if (time) {
      return `${formattedDate} • ${time.slice(0, 5)}`;
    }
    return formattedDate;
  };

  // 🔥 معالج رفع الصورة
  const handleImageUpload = (imageId: number) => {
    setSelectedImageId(imageId);
    setLessonForm(prev => ({ ...prev, image_id: imageId }));
    toast.success(lang === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
  };

  const handleRemoveImage = () => {
    setSelectedImageId(null);
    setSelectedImageUrl(null);
    setLessonForm(prev => ({ ...prev, image_id: null }));
  };

  // معالج إضافة/تعديل درس
  const handleSaveLesson = async () => {
    if (!courseId) return;

    if (!lessonForm.title && !lessonForm.title_ar) {
      toast.error(lang === 'ar' ? 'يرجى إدخال عنوان الدرس' : 'Please enter lesson title');
      return;
    }

    const payload: any = {
      course_id: courseId,
      titles: lessonForm.title ? [lessonForm.title] : [],
      titles_ar: lessonForm.title_ar ? [lessonForm.title_ar] : [],
      description: lessonForm.description,
      description_ar: lessonForm.description_ar,
      content_link: lessonForm.content_link,
      lession_date: lessonForm.lession_date,
      lession_time: lessonForm.lession_time,
      price: lessonForm.price,
      pdf_id: lessonForm.pdf_id, // ✅ fixed
    };

    if (lessonForm.pdf_id) {
      payload.pdf = lessonForm.pdf_id;
    }

    if (selectedImageId) {
      payload.image = selectedImageId;
    } else if (lessonForm.image_id) {
      payload.image = lessonForm.image_id;
    }

    try {
      if (editingLesson) {
        const result = await courseDetailService.update(editingLesson.id, payload);
          await fetchLessons(1);
        console.log("selectedPdfId", selectedPdfId);
        console.log("lessonForm.pdf_id", lessonForm.pdf_id);
        console.log("payload", payload);
        console.log("result", result);


        toast.success(lang === 'ar' ? 'تم تحديث الدرس بنجاح' : 'Lesson updated successfully');
      } else {
        await courseDetailService.create(payload);
        toast.success(lang === 'ar' ? 'تم إضافة الدرس بنجاح' : 'Lesson added successfully');
      }

      await fetchLessons(lessonsPagination.currentPage);

      setShowLessonModal(false);
      resetLessonForm();

    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء حفظ الدرس' : 'Error saving lesson');
    }
  };


  // معالج حذف درس
  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    try {
      await courseDetailService.deleteDetail(deletingLesson.id);
      toast.success(lang === 'ar' ? 'تم حذف الدرس بنجاح' : 'Lesson deleted successfully');
      await fetchLessons(lessonsPagination.currentPage);
      setDeletingLesson(null);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء حذف الدرس' : 'Error deleting lesson');
    }
  };

  const resetLessonForm = () => {
    setLessonForm({
      title: '', title_ar: '',
      description: '', description_ar: '',
      content_link: '',
      lession_date: new Date().toISOString().split('T')[0],
      lession_time: '20:00',
      price: 0,
      image_id: null,
      pdf_id: null,   // ✨ جديد
    });
    setSelectedImageId(null);
    setSelectedImageUrl(null);
    setSelectedPdfId(null);    // ✨ جديد
    setSelectedPdfUrl(null);   // ✨ جديد
    setEditingLesson(null);
  };
  const openEditLesson = async (lesson: CourseDetail) => {
    setEditingLesson(lesson);

    setLessonForm({
      title: Array.isArray(lesson.titles) ? (lesson.titles[0] ?? '') : '',
      title_ar: Array.isArray(lesson.titles_ar) ? (lesson.titles_ar[0] ?? '') : '',
      description: lesson.description ?? '',
      description_ar: lesson.description_ar ?? '',
      content_link: lesson.content_link ?? '',
      lession_date: lesson.lession_date,
      lession_time: lesson.lession_time || '20:00',
      price: parseFloat(lesson.price as any) || 0,
      image_id: lesson.image?.id ?? null,
      pdf_id: lesson.pdf?.id ?? null,
    });

    // ✅ Image
    if (lesson.image?.fullUrl) {
      setSelectedImageUrl(lesson.image.fullUrl);
      setSelectedImageId(lesson.image.id);
    } else {
      setSelectedImageUrl(null);
      setSelectedImageId(null);
    }

    // ✅ PDF — استخدم pdf.fullUrl أو pdfUrl كـ fallback
    const pdfUrl = lesson.pdf?.fullUrl || lesson.pdfUrl || null;
    const pdfId = lesson.pdf?.id ?? null;
    setSelectedPdfId(pdfId);
    setSelectedPdfUrl(pdfUrl);


    // ✅ افتح الـ modal بعد ما كل الـ state اتسيت
    setShowLessonModal(true);
  };
  const features = [
    t('certificateOfCompletion'),
    t('lifetimeAccess'),
    t('support247'),
    t('downloadableResources')
  ];

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{lang === 'ar' ? 'جاري تحميل الكورس...' : 'Loading course...'}</p>
      </div>
    );
  }

  // عرض الخطأ
  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <p className="text-muted-foreground mb-4">{error || 'Course not found'}</p>
          <Button onClick={onBack} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
        </div>
      </div>
    );
  }

  // استخراج البيانات من course object
  const title = isRTL && course.title_ar ? course.title_ar : course.title;
  const description = isRTL && course.description_ar ? course.description_ar : course.description;
  const about = isRTL && course.about_ar ? course.about_ar : course.about;
  const stageName = isRTL && course.stage?.name_ar ? course.stage.name_ar : course.stage?.name;
  const subjectName = isRTL && course.subject?.name_ar ? course.subject.name_ar : course.subject?.name;
  const semesterName = isRTL && course.semester?.name_ar ? course.semester.name_ar : course.semester?.name;
  const teacherName = course.teacher?.name;
  const teacherEmail = course.teacher?.email;
  const teacherPhone = course.teacher?.phone;

  const students = (course as any)?.students || [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6 max-w-7xl mx-auto px-4 pb-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <motion.div whileHover={{ x: -5 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-1 shrink-0"
              >
                <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                {t('back')}
              </Button>
            </motion.div>
          )}
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            >
              {title}
            </motion.h1>
            <p className="text-sm text-muted-foreground mt-1">
              {subjectName} • {stageName} • {semesterName}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={() => setIsLiked(!isLiked)} className="gap-1">
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              {isLiked ? t('liked') : t('like')}
            </Button>
          </motion.div>
          {onEdit && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={onEdit} size="sm" className="gap-1 bg-gradient-to-r from-primary to-secondary">
                <Edit2 className="h-4 w-4" />
                {t('edit')}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl overflow-hidden shadow-xl"
      >
        {(course.image?.fullUrl || course.imageUrl) ? (
          <img
            src={course.image?.fullUrl || course.imageUrl}
            alt={title}
            className="w-full h-56 md:h-80 object-cover"
          />
        ) : (
          <div className="w-full h-56 md:h-80 flex items-center justify-center bg-gradient-to-r from-primary/20 to-secondary/20">
            <BookOpen className="h-20 w-20 text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
              {course.type === 'online' ? <Globe className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
              {t(course.type)}
            </Badge>
            <Badge variant={course.active === 1 ? "default" : "destructive"} className="backdrop-blur-sm">
              {course.active === 1 ? t('active') : t('inactive')}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div variants={fadeIn} whileHover={{ y: -3 }} className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-200/50">
          <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{course.count_student || 0}</p>
          <p className="text-xs text-muted-foreground">{t('students')}</p>
        </motion.div>
        <motion.div variants={fadeIn} whileHover={{ y: -3 }} className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-200/50">
          <Clock className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{course.hour_time_course || '—'}</p>
          <p className="text-xs text-muted-foreground">{t('duration')}</p>
        </motion.div>
        <motion.div variants={fadeIn} whileHover={{ y: -3 }} className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-200/50">
          <DollarSign className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">${course.price}</p>
          <p className="text-xs text-muted-foreground">{t('price')}</p>
        </motion.div>
        <motion.div variants={fadeIn} whileHover={{ y: -3 }} className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-200/50">
          <Eye className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">—</p>
          <p className="text-xs text-muted-foreground">{t('views')}</p>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg gap-2">{t('overview')}</TabsTrigger>
          <TabsTrigger value="lessons" className="rounded-lg gap-2">📚 {t('lessons') || 'الدروس'}</TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg gap-2">👥 {t('students') || 'الطلاب'}</TabsTrigger>
          <TabsTrigger value="details" className="rounded-lg gap-2">{t('details')}</TabsTrigger>
          <TabsTrigger value="instructor" className="rounded-lg gap-2">{t('instructor')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-5 mt-4">
          <motion.div variants={fadeIn}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t('description')}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed bg-muted/30 p-4 rounded-xl">
              {description || about || t('noDescription')}
            </p>
          </motion.div>

          <motion.div variants={fadeIn}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {t('keyFeatures')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoCard icon={Calendar} label={t('startDate')} value={formatDate(course.start_date)} />
            <InfoCard icon={Calendar} label={t('endDate')} value={formatDate(course.end_date)} />
            <InfoCard icon={Clock} label={t('duration')} value={course.hour_time_course || '—'} />
            <InfoCard icon={Users} label={t('maxStudents')} value={course.count_student} />
            <InfoCard icon={DollarSign} label={t('price')} value={`$${course.price}`} color="yellow" />
            {course.discount !== '0.00' && (
              <InfoCard icon={DollarSign} label={t('discount')} value={`$${course.discount}`} color="red" />
            )}
          </motion.div>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              {t('courseLessons') || 'دروس الكورس'} ({lessonsPagination.total})
            </h3>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="sm" onClick={() => {
                resetLessonForm();
                setShowLessonModal(true);
              }} className="gap-1">
                <Plus className="h-4 w-4" />
                {t('addLesson') || 'إضافة درس'}
              </Button>
            </motion.div>
          </div>

          {lessonsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : lessons.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-gradient-to-br from-muted/30 to-muted/20 rounded-xl"
            >
              <Video className="h-16 w-16 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{t('noLessonsYet') || 'لا توجد دروس بعد'}</p>
              <Button variant="outline" size="sm" onClick={() => setShowLessonModal(true)} className="mt-3">
                <Plus className="h-4 w-4 mr-1" />
                {t('addFirstLesson') || 'أضف أول درس'}
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {lessons.map((lesson: any, idx: number) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-card to-muted/20 border hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className="text-xs rounded-full px-2 py-0.5">
                            #{((lessonsPagination.currentPage - 1) * lessonsPagination.perPage) + idx + 1}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(lesson.lession_date, lesson.lession_time)}
                          </span>
                          {parseFloat(lesson.price as any) > 0 && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <DollarSign className="h-3 w-3" />
                              {lesson.price}
                            </Badge>
                          )}

                          {/* 🔥 شارة شرط اجتياز الامتحان */}
                          {lesson.must_pass_to_unlock && (
                            <Badge variant="warning" className="text-xs gap-1 bg-amber-500/20 text-amber-600 border-amber-300">
                              <Lock className="h-3 w-3" />
                              {lang === 'ar' ? 'يجب اجتياز الامتحان' : 'Must pass exam'}
                            </Badge>
                          )}

                          {/* 🔥 شارة الحضور (للطلاب) */}
                          {lesson.attended && (
                            <Badge variant="success" className="text-xs gap-1 bg-green-500/20 text-green-600 border-green-300">
                              <CheckCircle2 className="h-3 w-3" />
                              {lang === 'ar' ? 'تم الحضور' : 'Attended'}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-base">
                          {isRTL && lesson.titles_ar ? lesson.titles_ar : (lesson.titles || '—')}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {isRTL && lesson.description_ar ? lesson.description_ar : lesson.description}
                        </p>

                        {lesson.content_link && (
                          <a
                            href={lesson.content_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                          >
                            <LinkIcon className="h-3 w-3" />
                            {t('watchLesson') || 'مشاهدة الدرس'}
                          </a>
                        )}
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* 🔥 Switch لتحديد شرط اجتياز الامتحان (للمعلم/admin فقط) */}
                        <div className="flex items-center gap-1 mr-2 px-2 py-1 rounded-lg bg-muted/50">
                          <label className="text-[10px] text-muted-foreground cursor-pointer whitespace-nowrap">
                            {lang === 'ar' ? 'امتحان إجباري' : 'Exam required'}
                          </label>
                          <Switch
                            checked={lesson.must_pass_to_unlock || false}
                            onCheckedChange={(checked) => handleToggleMustPass(lesson, checked)}
                            className="data-[state=checked]:bg-amber-500 scale-75"
                          />
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full hover:bg-primary/10"
                          onClick={() => openEditLesson(lesson)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                          onClick={() => setDeletingLesson(lesson)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* 🔥 Pagination buttons */}
              {lessonsPagination.lastPage > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLessons(lessonsPagination.currentPage - 1)}
                    disabled={lessonsPagination.currentPage === 1}
                  >
                    {lang === 'ar' ? 'السابق' : 'Previous'}
                  </Button>
                  <span className="text-sm text-muted-foreground py-2 px-3">
                    {lessonsPagination.currentPage} / {lessonsPagination.lastPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLessons(lessonsPagination.currentPage + 1)}
                    disabled={lessonsPagination.currentPage === lessonsPagination.lastPage}
                  >
                    {lang === 'ar' ? 'التالي' : 'Next'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t('enrolledStudents') || 'الطلاب المسجلين'} ({students.length})
            </h3>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl">
              <User className="h-16 w-16 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{t('noStudentsYet') || 'لا يوجد طلاب مسجلين بعد'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student: any, idx: number) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-card to-muted/20 border shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-r from-primary/20 to-secondary/20">
                        {student.name?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{student.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{student.phone}</span>
                      </div>
                      {student.type_of_attendance && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {student.type_of_attendance === 'online' ? '🖥️ أونلاين' : '🏢 مركز'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-5 mt-4">
          <motion.div variants={fadeIn}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {t('aboutCourse')}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed bg-muted/30 p-4 rounded-xl">
              {about || description || t('noDescription')}
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoCard icon={GraduationCap} label={t('stage')} value={stageName} />
            <InfoCard icon={BookOpen} label={t('subject')} value={subjectName} />
            <InfoCard icon={Calendar} label={t('semester')} value={semesterName} />
            <InfoCard icon={Clock} label={t('createdAt')} value={formatDate(course.createdAt)} />
          </motion.div>
        </TabsContent>

        {/* Instructor Tab */}
        <TabsContent value="instructor" className="mt-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-5 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border"
          >
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg">
              {teacherName?.charAt(0) || 'T'}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{teacherName || t('notAvailable')}</h3>
              <div className="flex flex-wrap gap-4 mt-2">
                {teacherEmail && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {teacherEmail}
                  </div>
                )}
                {teacherPhone && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {teacherPhone}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground ml-2">(4.8)</span>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Modal لإضافة/تعديل درس */}
      <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {editingLesson ? (t('editLesson') || 'تعديل درس') : (t('addLesson') || 'إضافة درس جديد')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('title')} (EN)</label>
                <Input
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Lesson title in English"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('title')} (AR)</label>
                <Input
                  value={lessonForm.title_ar}
                  onChange={(e) => setLessonForm({ ...lessonForm, title_ar: e.target.value })}
                  placeholder="عنوان الدرس بالعربية"
                  className="rounded-xl text-right"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('description')} (EN)</label>
                <Textarea
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  placeholder="Lesson description in English"
                  rows={2}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('description')} (AR)</label>
                <Textarea
                  value={lessonForm.description_ar}
                  onChange={(e) => setLessonForm({ ...lessonForm, description_ar: e.target.value })}
                  placeholder="وصف الدرس بالعربية"
                  rows={2}
                  className="rounded-xl text-right"
                  dir="rtl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('videoLink') || 'رابط الفيديو'}</label>
              <Input
                value={lessonForm.content_link}
                onChange={(e) => setLessonForm({ ...lessonForm, content_link: e.target.value })}
                placeholder="https://youtube.com/... or https://example.com/video"
                className="rounded-xl"
              />
            </div>



            <FileUploader
              label={t('lessonImage') || 'صورة الدرس (اختياري)'}
              onUploadSuccess={handleImageUpload}
              multiple={false}
              accept="image/*"
              preview={true}
              uniqueId="lesson-image"
              defaultImageUrl={selectedImageUrl || undefined}
              defaultImageId={selectedImageId}
              onRemoveImage={handleRemoveImage}
            />
            {/* PDF uploader ✨ جديد */}
            {/* PDF uploader ✨ جديد */}
            <FileUploader
              label={t('lessonPdf')}
              onUploadSuccess={(pdfId: number) => {
                setSelectedPdfId(pdfId);
                setLessonForm(prev => ({ ...prev, pdf_id: pdfId }));
              }}
              multiple={false}
              accept="application/pdf"
              preview={false}
              uniqueId="lesson-pdf"
              defaultImageUrl={selectedPdfUrl ?? undefined}
              defaultImageId={selectedPdfId ?? undefined}
              onRemoveImage={() => {
                setSelectedPdfId(null);
                setSelectedPdfUrl(null);
                setLessonForm(prev => ({ ...prev, pdf_id: null }));
              }}
            />


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('date') || 'التاريخ'}</label>
                <Input
                  type="date"
                  value={lessonForm.lession_date}
                  onChange={(e) => setLessonForm({ ...lessonForm, lession_date: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('time') || 'الوقت'}</label>
                <Input
                  type="time"
                  value={lessonForm.lession_time}
                  onChange={(e) => setLessonForm({ ...lessonForm, lession_time: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('price') || 'السعر'}</label>
                <Input
                  type="number"
                  value={lessonForm.price}
                  onChange={(e) => setLessonForm({ ...lessonForm, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowLessonModal(false)} className="rounded-xl">
                {t('cancel') || 'إلغاء'}
              </Button>
              <Button onClick={handleSaveLesson} className="rounded-xl bg-gradient-to-r from-primary to-secondary">
                {editingLesson ? (t('update') || 'تحديث') : (t('add') || 'إضافة')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!deletingLesson} onOpenChange={() => setDeletingLesson(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('confirmDelete') || 'تأكيد الحذف'}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            {t('deleteLessonConfirm') || 'هل أنت متأكد من حذف هذا الدرس؟ لا يمكن التراجع عن هذا الإجراء.'}
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeletingLesson(null)}>
              {t('cancel') || 'إلغاء'}
            </Button>
            <Button variant="destructive" onClick={handleDeleteLesson}>
              {t('delete') || 'حذف'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};