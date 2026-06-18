/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/assignments/AssignmentForm.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { assignmentService } from '@/services/assignment.service';
import { useTeacherMeta } from '@/hooks/useTeacherMeta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AsyncSelect } from '@/components/ui/AsyncSelect';
import FileUploader from '@/components/FileUploader';
import { Loader2, Sparkles, Save, ChevronLeft, Settings2, Calendar, Clock, Monitor, Building2 } from 'lucide-react';
import { toast  } from "@/hooks/use-toast";

interface AssignmentFormProps {
  assignmentId?: number | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface AssignmentFormData {
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  total_marks: number;
  total_marks_pass_marks: number;
  duration_minutes: number;
  course_detail_id: number | null;
  stage_id: number | null;
  type_exam: 'center' | 'online' | '';
  time_start: string | null;
  time_end: string | null;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({ assignmentId, onSuccess, onCancel }) => {
  const { t, lang, user } = useApp();
  const { stages } = useTeacherMeta(user?.id);
  const isRTL = lang === 'ar';
  const [loading, setLoading] = useState(false);
  const [imageId, setImageId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    total_marks: 0,
    total_marks_pass_marks: 0,
    duration_minutes: 0,
    course_detail_id: null,
    stage_id: null,
    type_exam: '',
    time_start: null,
    time_end: null,
  });

  useEffect(() => {
    if (assignmentId) {
      loadAssignmentData();
    }
  }, [assignmentId]);

  const loadAssignmentData = async () => {
    setLoading(true);
    try {
      const assignment = await assignmentService.getAssignment(assignmentId!);
      setFormData({
        title: assignment.title || '',
        title_ar: assignment.title_ar || '',
        description: assignment.description || '',
        description_ar: assignment.description_ar || '',
        total_marks: assignment.total_marks || 0,
        total_marks_pass_marks: assignment.total_marks_pass_marks || 0,
        duration_minutes: assignment.duration_minutes || 0,
        course_detail_id: assignment.course_detail_id?.id || assignment.course_detail_id || null,
        stage_id: assignment.stage_id?.id || assignment.stage_id || null,
        type_exam: assignment.type_exam || '',
        time_start: assignment.time_start || null,
        time_end: assignment.time_end || null,
      });
      setImageId(assignment.image?.id || null);
    } catch (error) {
      console.error('Error loading assignment:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل بيانات الواجب' : 'Error loading assignment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error(lang === 'ar' ? 'يرجى إدخال عنوان الواجب' : 'Please enter assignment title');
      return;
    }
    if (!formData.stage_id) {
      toast.error(lang === 'ar' ? 'يرجى اختيار المرحلة' : 'Please select stage');
      return;
    }
    if (!formData.course_detail_id) {
      toast.error(lang === 'ar' ? 'يرجى اختيار الدرس' : 'Please select lesson');
      return;
    }

    setLoading(true);
    try {
      const assignmentData = {
        ...formData,
        teacher_id: user?.id || 1,
        image: imageId || undefined,
      };

      if (assignmentId) {
        await assignmentService.updateAssignment(assignmentId, assignmentData);
        toast.success(lang === 'ar' ? 'تم تحديث الواجب بنجاح' : 'Assignment updated successfully');
      } else {
        await assignmentService.createAssignment(assignmentData);
        toast.success(lang === 'ar' ? 'تم إنشاء الواجب بنجاح' : 'Assignment created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ في حفظ الواجب' : 'Error saving assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (id: number) => {
    setImageId(id);
    toast.success(lang === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
  };

  const handleRemoveImage = () => {
    setImageId(null);
  };

  const formatDateTimeLocal = (dateTime: string | null) => {
    if (!dateTime) return '';
    return dateTime.slice(0, 16);
  };

  const getLessonExtraFilters = () => {
    const filters: Record<string, any> = {};
    if (user?.id) {
      filters.teacher_id = user.id;
    }
    if (formData.stage_id) {
      filters.stage_id = formData.stage_id;
    }
    return filters;
  };

  if (loading && assignmentId) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: isRTL ? -100 : 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRTL ? 100 : -100 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="max-w-5xl mx-auto px-4 py-6"
    >
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" onClick={onCancel} className="rounded-2xl gap-2">
          <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          {t('back')}
        </Button>
        <div className="text-end">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {assignmentId ? (lang === 'ar' ? 'تعديل واجب' : 'Edit Assignment') : (lang === 'ar' ? 'إنشاء واجب جديد' : 'Create New Assignment')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {lang === 'ar' ? 'أنشئ واجب احترافي للطلاب' : 'Create a professional assignment for students'}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-2xl rounded-3xl bg-background/80 backdrop-blur-xl">
        <div className="relative h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
        <CardHeader className="pb-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
              <Settings2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">{lang === 'ar' ? 'بيانات الواجب' : 'Assignment Information'}</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">{lang === 'ar' ? 'أدخل جميع البيانات المطلوبة' : 'Fill all required assignment information'}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="rounded-2xl border border-dashed p-5 bg-muted/30">
              <Label className="mb-3 block text-sm font-semibold">{lang === 'ar' ? 'صورة الواجب' : 'Assignment Image'}</Label>
              <FileUploader
                label={lang === 'ar' ? 'ارفع صورة الواجب' : 'Upload Assignment Image'}
                onUploadSuccess={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                multiple={false}
                accept="image/*"
                preview
                uniqueId="assignment-image-upload"
                maxFiles={1}
                defaultImageId={imageId}
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>{t('title')}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={lang === 'ar' ? 'عنوان الواجب' : 'Assignment title'}
                className="rounded-2xl h-12"
                required
              />
            </div>

            {/* Arabic Title (optional) */}
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'العنوان بالعربية' : 'Arabic Title'}</Label>
              <Input
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                placeholder={lang === 'ar' ? 'عنوان الواجب بالعربية (اختياري)' : 'Arabic title (optional)'}
                className="rounded-2xl h-12"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{t('description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder={lang === 'ar' ? 'وصف الواجب' : 'Assignment description'}
                className="rounded-2xl resize-none"
              />
            </div>

            {/* Arabic Description (optional) */}
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={4}
                placeholder={lang === 'ar' ? 'وصف الواجب بالعربية (اختياري)' : 'Arabic description (optional)'}
                className="rounded-2xl resize-none"
              />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label>{t('totalMarks')}</Label>
                <Input
                  type="number"
                  value={formData.total_marks}
                  onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) || 0 })}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('durationMinutes')}</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Date and Time Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {lang === 'ar' ? 'توقيت الواجب' : 'Assignment Schedule'}
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    {lang === 'ar' ? 'وقت البداية' : 'Start Time'}
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeLocal(formData.time_start)}
                    onChange={(e) => setFormData({ ...formData, time_start: e.target.value ? `${e.target.value}:00` : null })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    {lang === 'ar' ? 'وقت النهاية' : 'End Time'}
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeLocal(formData.time_end)}
                    onChange={(e) => setFormData({ ...formData, time_end: e.target.value ? `${e.target.value}:00` : null })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* 🔥 Exam Type - أونلاين / سنتر */}
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                {lang === 'ar' ? 'نوع الواجب' : 'Assignment Type'}
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type_exam: 'online' })}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    formData.type_exam === 'online'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-3 rounded-full ${
                      formData.type_exam === 'online'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      <Monitor className="h-6 w-6" />
                    </div>
                    <span className="font-semibold">💻 {lang === 'ar' ? 'أونلاين' : 'Online'}</span>
                    <span className="text-xs text-muted-foreground">
                      {lang === 'ar' ? 'واجب يتم عبر الإنترنت' : 'Assignment done online'}
                    </span>
                  </div>
                  {formData.type_exam === 'online' && (
                    <motion.div
                      layoutId="activeType"
                      className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      ✓
                    </motion.div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type_exam: 'center' })}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    formData.type_exam === 'center'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-3 rounded-full ${
                      formData.type_exam === 'center'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      <Building2 className="h-6 w-6" />
                    </div>
                    <span className="font-semibold">🏢 {lang === 'ar' ? 'سنتر' : 'Center'}</span>
                    <span className="text-xs text-muted-foreground">
                      {lang === 'ar' ? 'واجب يتم في المركز' : 'Assignment done at center'}
                    </span>
                  </div>
                  {formData.type_exam === 'center' && (
                    <motion.div
                      layoutId="activeType"
                      className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      ✓
                    </motion.div>
                  )}
                </button>
              </div>
            </div>

            {/* Stage & Lesson */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t('stage')}</Label>
                <select
                  value={formData.stage_id || ''}
                  onChange={(e) => {
                    const newStageId = e.target.value ? Number(e.target.value) : null;
                    setFormData({ 
                      ...formData, 
                      stage_id: newStageId,
                      course_detail_id: null 
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border bg-background"
                  required
                >
                  <option value="">{lang === 'ar' ? 'اختر المرحلة' : 'Select Stage'}</option>
                  {stages?.map((stage: any) => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>{t('lesson')}</Label>
                <AsyncSelect
                  key={`lesson-${formData.stage_id}-${user?.id}`}
                  configKey="lessons"
                  value={formData.course_detail_id}
                  onChange={(id) => setFormData({ ...formData, course_detail_id: id })}
                  extraFilters={getLessonExtraFilters()}
                  placeholder={lang === 'ar' ? 'اختر الدرس' : 'Select Lesson'}
                  required
                />
              </div>
            </div>

            {/* Info Box */}
            {formData.type_exam && (
              <div className={`p-4 rounded-xl ${
                formData.type_exam === 'online'
                  ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'
                  : 'bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800'
              }`}>
                <div className="flex items-center gap-2">
                  {formData.type_exam === 'online' ? (
                    <Monitor className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Building2 className="h-5 w-5 text-purple-500" />
                  )}
                  <p className={`text-sm ${
                    formData.type_exam === 'online'
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-purple-700 dark:text-purple-400'
                  }`}>
                    {formData.type_exam === 'online'
                      ? (lang === 'ar' ? '📱 هذا الواجب مخصص للطلاب أونلاين' : '📱 This assignment is for online students')
                      : (lang === 'ar' ? '🏢 هذا الواجب مخصص لطلاب السنتر' : '🏢 This assignment is for center students')}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:scale-[1.01] transition-all shadow-xl"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin me-2" />{lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</>
              ) : (
                <><Save className="h-5 w-5 me-2" />{assignmentId ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (lang === 'ar' ? 'إنشاء الواجب' : 'Create Assignment')}</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};