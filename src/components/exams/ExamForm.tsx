/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/exams/ExamForm.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ChevronLeft, Save, FileText } from 'lucide-react';
import type { Exam, ExamFormData } from '@/types/exam.types';
import FileUploader from '@/components/FileUploader';
import { AsyncSelect } from '@/components/ui/AsyncSelect'; // 🔥 استخدم AsyncSelect
import { courseDetailService } from '@/services/course-detail.service';
interface ExamFormProps {
  exam?: Exam;
  onSubmit: (data: ExamFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  courseDetailId?: number; // 🔥 يمكن تمرير course_detail_id من الخارج
}

export const ExamForm: React.FC<ExamFormProps> = ({
  exam,
  onSubmit,
  onCancel,
  loading = false,
  courseDetailId
}) => {
  const { t, lang, user } = useApp();
  const isRTL = lang === 'ar';

  const initialFormData: ExamFormData = exam
    ? {
      title: exam.title || '',
      title_ar: exam.title_ar || '',
      description: exam.description || '',
      description_ar: exam.description_ar || '',
      type: exam.type || 'exam',
      teacher_id: exam.teacher_id,
      course_detail_id: exam.course_detail_id,
      stage_id: exam.stage_id,
      total_marks: exam.total_marks || 0,
      total_marks_pass_marks:
        exam.total_marks_pass_marks || 0,
      duration_minutes: exam.duration_minutes || 0,
      image: exam.image?.id,
    }
    : {
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      type: 'exam',
      teacher_id: user?.id || 1,
      course_detail_id: courseDetailId ?? null, // 🔥 استخدم courseDetailId إذا تم تمريره، وإلا null
      stage_id: 1,
      total_marks: 0,
      total_marks_pass_marks: 0,
      duration_minutes: 0,
    };

  const [formData, setFormData] =
    useState<ExamFormData>(initialFormData);





  const [error, setError] = useState<string | null>(null);
  const [imageId, setImageId] =
    useState<number | null>(exam?.image?.id || null);

  const isFormValid =
    formData.title.trim() &&
    formData.total_marks > 0 &&
    formData.duration_minutes > 0 &&
    formData.total_marks_pass_marks <= formData.total_marks;



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setError(null);

    if (!formData.title.trim()) {
      setError(t('required'));
      return;
    }

    if (
      formData.total_marks_pass_marks >
      formData.total_marks
    ) {
      setError(
        lang === 'ar'
          ? 'درجة النجاح لا يمكن أن تتجاوز الدرجة الكلية'
          : 'Pass marks cannot exceed total marks'
      );
      return;
    }

    try {
      await onSubmit({
        ...formData,
        ...(imageId && { image: imageId }),
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (field: keyof ExamFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (id: number) => {
    setImageId(id);
  };

  const handleRemoveImage = () => {
    setImageId(null);
  };





  const [lessons, setLessons] = useState<{ label: string; value: number }[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  useEffect(() => {
    const fetchLessons = async () => {
      setLoadingLessons(true);
      try {
        const res = await courseDetailService.getAll({ perPage: 50 });

        const data = res?.data ?? [];

        const options = data.map((lesson: any) => ({
          label:
            lesson.titles?.[0] ||
            lesson.titles_ar?.[0] ||
            lesson.description?.slice(0, 20) ||
            `Lesson #${lesson.id}`,
          value: String(lesson.id), // 👈 مهم جدًا
        }));

        setLessons(options);

        // 👇 مهم: set default value بعد التحميل
        if (!formData.course_detail_id && options.length > 0) {
          setFormData(prev => ({
            ...prev,
            course_detail_id: Number(options[0].value),
          }));
        }

      } finally {
        setLoadingLessons(false);
      }
    };

    fetchLessons();
  }, []);
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
            <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t('back')}
          </Button>
        )}
        <h1 className="text-2xl font-bold">
          {exam ? t('editExam') : t('createNewExam')}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t('examInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>{t('examImage')}</Label>
              <FileUploader
                label={t('uploadExamImage')}
                onUploadSuccess={handleImageUpload}
                multiple={false}
                accept="image/*"
                preview={true}
                uniqueId="exam-image-upload"
                maxFiles={1}
                defaultImageUrl={exam?.image?.fullUrl || exam?.imageUrl}
                defaultImageId={exam?.image?.id}
                onRemoveImage={handleRemoveImage}
              />
            </div>

            {/* Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('title')} (EN) *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Exam title in English"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('title')} (AR)</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => handleChange('title_ar', e.target.value)}
                  placeholder="عنوان الامتحان بالعربية"
                  className="rounded-xl text-right"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('description')} (EN)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Exam description"
                  rows={3}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('description')} (AR)</Label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => handleChange('description_ar', e.target.value)}
                  placeholder="وصف الامتحان بالعربية"
                  rows={3}
                  className="rounded-xl text-right"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Marks, Pass Marks & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('totalMarks')} *</Label>
                <Input
                  type="number"
                  value={formData.total_marks}
                  onChange={(e) => handleChange('total_marks', parseInt(e.target.value) || 0)}
                  placeholder="Total marks"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('passMarks') || 'Pass Marks'} *</Label>
                <Input
                  type="number"
                  value={formData.total_marks_pass_marks}
                  onChange={(e) => handleChange('total_marks_pass_marks', parseInt(e.target.value) || 0)}
                  placeholder="Marks needed to pass"
                  required
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  {lang === 'ar' ? 'الدرجة المطلوبة للنجاح' : 'Minimum marks to pass'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t('durationMinutes')} *</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value) || 0)}
                  placeholder="Duration in minutes"
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Course Detail (Lesson) - باستخدام AsyncSelect */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('lesson') || 'Lesson'} *</Label>
                <Select
                  value={
                    formData.course_detail_id != null
                      ? String(formData.course_detail_id)
                      : undefined
                  }
                  onValueChange={(val) =>
                    handleChange('course_detail_id', Number(val))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={lang === 'ar' ? 'اختر الدرس' : 'Select lesson'} />
                  </SelectTrigger>

                  <SelectContent>
                    {loadingLessons ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : lessons.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No lessons found
                      </SelectItem>
                    ) : (
                      lessons.map((l) => (
                        <SelectItem key={l.value} value={l.value.toString()}>
                          {l.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('stage')} *</Label>
                <AsyncSelect
                  configKey="stages"
                  value={formData.stage_id}
                  onChange={(id) => handleChange('stage_id', id || 1)}
                  placeholder={lang === 'ar' ? 'اختر المرحلة' : 'Select stage'}
                  required
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
                  {t('cancel')}
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading || !isFormValid}
                className="gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                <Save className="h-4 w-4" />

                {exam ? t('update') : t('create')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};