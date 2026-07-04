/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/exam/QuestionForm.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, Trash2 } from 'lucide-react';
import FileUploader from '@/components/FileUploader';

interface QuestionFormProps {
  onAdd: (question: any) => void;
  onCancel: () => void;
  initialData?: any;
  lang: string;
  t: (key: string) => string;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  onAdd,
  onCancel,
  initialData,
  lang,
  t
}) => {
  const isRTL = lang === 'ar';
  const [questionType, setQuestionType] = useState<'mcq' | 'essay' | 'true_false'>(
    initialData?.question_type || 'mcq'
  );
  const [questionText, setQuestionText] = useState(initialData?.question || '');
  const [questionMark, setQuestionMark] = useState(initialData?.mark || 1);
  const [options, setOptions] = useState<string[]>(initialData?.options || ['', '']);
  const [correctAnswer, setCorrectAnswer] = useState<string | number>(
    initialData?.correct_answer || ''
  );
  const [imageId, setImageId] = useState<number | null>(initialData?.image || null);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (!questionText.trim()) {
      toast.error(lang === 'ar' ? 'يرجى إدخال نص السؤال' : 'Please enter question text');
      return;
    }

    const question: any = {
      question_type: questionType,
      question: questionText,
      mark: questionMark,
      ...(imageId && { image: imageId }),
    };

    if (questionType === 'mcq') {
      const filteredOptions = options.filter(opt => opt.trim());
      if (filteredOptions.length < 2) {
        toast.error(lang === 'ar' ? 'يرجى إدخال خيارين على الأقل' : 'Please enter at least 2 options');
        return;
      }
      if (!correctAnswer) {
        toast.error(lang === 'ar' ? 'يرجى تحديد الإجابة الصحيحة' : 'Please select the correct answer');
        return;
      }
      question.options = filteredOptions;
      question.correct_answer = correctAnswer;
    } else if (questionType === 'true_false') {
      if (!correctAnswer) {
        toast.error(lang === 'ar' ? 'يرجى تحديد الإجابة الصحيحة' : 'Please select the correct answer');
        return;
      }
      question.options = ['true', 'false'];
      question.correct_answer = correctAnswer;
    }

    onAdd(question);
  };

  const handleImageUpload = (id: number) => {
    setImageId(id);
  };

  const handleRemoveImage = () => {
    setImageId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {initialData
                ? (lang === 'ar' ? 'تعديل سؤال' : 'Edit Question')
                : (lang === 'ar' ? 'إضافة سؤال جديد' : 'Add New Question')}
            </h3>
            <Button variant="ghost" size="sm" onClick={onCancel} className="rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <Label>{lang === 'ar' ? 'نوع السؤال' : 'Question Type'}</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setQuestionType('mcq')}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  questionType === 'mcq'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                }`}
              >
                {lang === 'ar' ? 'اختيار من متعدد' : 'MCQ'}
              </button>
              <button
                type="button"
                onClick={() => setQuestionType('true_false')}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  questionType === 'true_false'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                }`}
              >
                {lang === 'ar' ? 'صح / خطأ' : 'True/False'}
              </button>
              <button
                type="button"
                onClick={() => setQuestionType('essay')}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  questionType === 'essay'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                }`}
              >
                {lang === 'ar' ? 'مقالي' : 'Essay'}
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label>{lang === 'ar' ? 'نص السؤال' : 'Question Text'}</Label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              placeholder={lang === 'ar' ? 'أدخل نص السؤال' : 'Enter question text'}
              className="rounded-xl resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="rounded-xl border border-dashed p-4 bg-muted/30">
            <Label className="mb-2 block text-sm font-semibold">
              {lang === 'ar' ? 'صورة السؤال (اختياري)' : 'Question Image (Optional)'}
            </Label>
            <FileUploader
              label={lang === 'ar' ? 'ارفع صورة' : 'Upload Image'}
              onUploadSuccess={handleImageUpload}
              onRemoveImage={handleRemoveImage}
              multiple={false}
              accept="image/*"
              preview
              uniqueId={`question-image-${Date.now()}`}
              maxFiles={1}
              defaultImageId={imageId}
            />
          </div>

          {/* Options for MCQ */}
          {questionType === 'mcq' && (
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'الخيارات' : 'Options'}</Label>
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`${lang === 'ar' ? 'خيار' : 'Option'} ${index + 1}`}
                    className="rounded-xl flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    disabled={options.length <= 2}
                    className="rounded-xl text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="rounded-xl gap-2"
              >
                <Plus className="h-4 w-4" />
                {lang === 'ar' ? 'إضافة خيار' : 'Add Option'}
              </Button>

              {/* Correct Answer */}
              <div className="space-y-2 mt-4">
                <Label>{lang === 'ar' ? 'الإجابة الصحيحة' : 'Correct Answer'}</Label>
                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-background"
                >
                  <option value="">{lang === 'ar' ? 'اختر الإجابة الصحيحة' : 'Select correct answer'}</option>
                  {options.map((option, index) => (
                    option.trim() && (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    )
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* True/False */}
          {questionType === 'true_false' && (
            <div className="space-y-2">
              <Label>{lang === 'ar' ? 'الإجابة الصحيحة' : 'Correct Answer'}</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCorrectAnswer('true')}
                  className={`px-6 py-2 rounded-xl border transition-all ${
                    correctAnswer === 'true'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-600'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  ✅ {lang === 'ar' ? 'صح' : 'True'}
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectAnswer('false')}
                  className={`px-6 py-2 rounded-xl border transition-all ${
                    correctAnswer === 'false'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-600'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  ❌ {lang === 'ar' ? 'خطأ' : 'False'}
                </button>
              </div>
            </div>
          )}

          {/* Mark */}
          <div className="space-y-2">
            <Label>{lang === 'ar' ? 'درجة السؤال' : 'Question Mark'}</Label>
            <Input
              type="number"
              min={0}
              value={questionMark}
              onChange={(e) => setQuestionMark(parseInt(e.target.value) || 0)}
              className="rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary"
            >
              {initialData
                ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                : (lang === 'ar' ? 'إضافة السؤال' : 'Add Question')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-xl"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};