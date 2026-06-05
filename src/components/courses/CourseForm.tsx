/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/courses/CourseForm.tsx
import api from '@/lib/api';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useCourses } from '@/hooks/useCourses';
import FileUploader from '@/components/FileUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ChevronLeft, Save } from 'lucide-react';
import type { Course, CourseFormData } from '@/types/course.types';
import { AsyncSelect } from '@/components/ui/AsyncSelect'; // 🔥 أضف هذا الاستيراد
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { useTeacherMeta } from '@/hooks/useTeacherMeta'; // عدّل المسار حسب مشروعك

interface CourseFormProps {
  course?: Course;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({ course, onSuccess, onCancel }) => {
  const { t, lang, user } = useApp();
  const teacherId = user?.id;
  const { stages, subjects } = useTeacherMeta(teacherId);
  const { createCourse, updateCourse, loading, error } = useCourses({ autoFetch: false });
  const [formData, setFormData] = useState<Partial<CourseFormData>>({
    teacher_id: user?.id || 1,
    stage_id: 1,
    subject_id: 1,
    semester_id: 1,
    image: course?.image?.id || 0, // ✅ استخدام ID الصورة الموجودة
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    about: '',
    about_ar: '',
    hour_time_course: '',
    type: 'center',
    count_student: 0,
    price: 0,
    start_date: '',
    end_date: '',
  });

  // ✅ تحميل بيانات الكورس عند التعديل
  useEffect(() => {
    if (course) {
      setFormData({
        teacher_id: course.teacher_id,
        stage_id: course.stage_id,
        subject_id: course.subject_id,
        semester_id: course.semester_id,
        image: course.image?.id || 0,
        title: course.title,
        title_ar: course.title_ar,
        description: course.description,
        description_ar: course.description_ar,
        about: course.about,
        about_ar: course.about_ar,
        hour_time_course: course.hour_time_course,
        type: course.type,
        count_student: course.count_student,
        price: parseFloat(course.price),
        start_date: course.start_date,
        end_date: course.end_date,
      });
    }
  }, [course]);

  // ✅ معالج رفع الصورة
  const handleImageUpload = (imageId: number) => {
    setFormData(prev => ({ ...prev, image: imageId }));
    console.log('✅ Image uploaded/updated with ID:', imageId);
  };

  // ✅ معالج إزالة الصورة
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: 0 }));
    console.log('🗑️ Image removed from form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ التحقق من وجود صورة
    if (!formData.image || formData.image === 0) {
      alert(t('pleaseUploadImage') || 'Please upload a course image');
      return;
    }

    try {
      if (course) {
        await updateCourse(course.id, formData);
      } else {
        await createCourse(formData as CourseFormData);
      }
      onSuccess?.();
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  const handleChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('back')}
        </Button>
        <h1 className="text-2xl font-bold">
          {course ? t('editCourse') : t('createNewCourse')}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>{t('courseInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* ✅ Course Image Upload - مع دعم الصورة الحالية */}
            <div className="space-y-2">
              <Label>{t('courseImage')} *</Label>
              <FileUploader
                label={t('uploadCourseImage')}
                onUploadSuccess={handleImageUpload}
                multiple={false}
                accept="image/*"
                preview={true}
                uniqueId="course-image-upload"
                maxFiles={1}
                defaultImageUrl={course?.image?.fullUrl || course?.imageUrl}
                defaultImageId={course?.image?.id}
                onRemoveImage={handleRemoveImage}
              />
              <p className="text-xs text-muted-foreground">
                {t('recommendedImageSize') || 'Recommended size: 1280x720px (16:9 ratio)'}
              </p>
            </div>

            {/* Basic Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">{t('basicInfo')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('title')} (EN) *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Course title in English"
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('title')} (AR)</Label>
                  <Input
                    value={formData.title_ar}
                    onChange={(e) => handleChange('title_ar', e.target.value)}
                    placeholder="عنوان الدورة بالعربية"
                    className="rounded-xl text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('description')} (EN)</Label>
                  <RichTextEditor
                    value={formData.description || ''}
                    onChange={(value) => handleChange('description', value)}
                    placeholder="Brief description of the course..."
                    label=""
                    minHeight="150px"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('description')} (AR)</Label>
                  <RichTextEditor
                    value={formData.description_ar || ''}
                    onChange={(value) => handleChange('description_ar', value)}
                    placeholder="وصف مختصر للدورة..."
                    label=""
                    minHeight="150px"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('about')} (EN)</Label>
                  <RichTextEditor
                    value={formData.about || ''}
                    onChange={(value) => handleChange('about', value)}
                    placeholder="Detailed information about the course..."
                    label=""
                    minHeight="250px"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('about')} (AR)</Label>
                  <RichTextEditor
                    value={formData.about_ar || ''}
                    onChange={(value) => handleChange('about_ar', value)}
                    placeholder="معلومات تفصيلية عن الدورة..."
                    label=""
                    minHeight="250px"
                  />
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">{t('courseDetails')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('type')} *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => handleChange('type', value)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">{t('center')}</SelectItem>
                      <SelectItem value="online">{t('online')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('duration')}</Label>
                  <Input
                    value={formData.hour_time_course}
                    onChange={(e) => handleChange('hour_time_course', e.target.value)}
                    placeholder="e.g., 40 hours"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('maxStudents')} *</Label>
                  <Input
                    type="number"
                    value={formData.count_student}
                    onChange={(e) => handleChange('count_student', parseInt(e.target.value) || 0)}
                    placeholder="Maximum students"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('price')} ($) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="Course price"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('startDate')} *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('endDate')} *</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Stage, Subject, Semester - يمكن إضافتها من API منفصل */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">{t('academicInfo')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('stage')} *</Label>

                  <Select
                    value={formData.stage_id?.toString()}
                    onValueChange={(value) => handleChange('stage_id', Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Stage" />
                    </SelectTrigger>

                    <SelectContent>
                      {stages.map((stage: any) => (
                        <SelectItem key={stage.id} value={stage.id.toString()}>
                          {lang === 'ar' ? stage.name_ar : stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('subject')} *</Label>

                  <Select
                    value={formData.subject_id?.toString()}
                    onValueChange={(value) => handleChange('subject_id', Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>

                    <SelectContent>
                      {subjects
                        .filter((s: any) => s.stage_id === formData.stage_id)
                        .map((subject: any) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {lang === 'ar' ? subject.name_ar : subject.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('semester')} *</Label>
                  <AsyncSelect
                    configKey="semesters"
                    value={formData.semester_id}
                    onChange={(id, semester) => {
                      handleChange('semester_id', id || 1);
                      console.log('Selected semester:', id, semester);
                    }}
                    label=""
                    placeholder={lang === 'ar' ? 'اختر الترم' : 'Select Semester'}
                    required
                    extraFilters={{ teacher_id: user?.id }}
                  />
                </div>
              </div>
            </div>


            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">{t('academicInfo')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('startDate')} *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('endDate')} *</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>


              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="rounded-xl"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="gap-2 rounded-xl gradient-primary border-0"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                {course ? t('update') : t('create')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};