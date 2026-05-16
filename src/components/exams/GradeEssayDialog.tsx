// src/components/exams/GradeEssayDialog.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Award } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface GradeEssayDialogProps {
  open: boolean;
  onClose: () => void;
  onGrade: (mark: number) => Promise<void>;
  questionText: string;
  studentAnswer: string;
  maxMark: number;
  loading?: boolean;
}

export const GradeEssayDialog: React.FC<GradeEssayDialogProps> = ({
  open,
  onClose,
  onGrade,
  questionText,
  studentAnswer,
  maxMark,
  loading = false,
}) => {
  const { t } = useApp();
  const [mark, setMark] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (mark < 0 || mark > maxMark) {
      setError(`Marks must be between 0 and ${maxMark}`);
      return;
    }
    setError(null);
    await onGrade(mark);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {t('gradeEssayQuestion')}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Question */}
          <div>
            <Label className="text-muted-foreground">{t('question')}</Label>
            <Card className="p-3 bg-muted/30 mt-1">
              <p className="text-sm">{questionText}</p>
            </Card>
          </div>

          {/* Student Answer */}
          <div>
            <Label className="text-muted-foreground">{t('studentAnswer')}</Label>
            <Card className="p-3 bg-muted/30 mt-1">
              <p className="text-sm whitespace-pre-wrap">{studentAnswer}</p>
            </Card>
          </div>

          {/* Grade Input */}
          <div>
            <Label>{t('marks')} (0 - {maxMark})</Label>
            <Input
              type="number"
              value={mark}
              onChange={(e) => setMark(parseInt(e.target.value) || 0)}
              min={0}
              max={maxMark}
              className="mt-1"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <XCircle className="h-4 w-4 mr-2" />
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <CheckCircle className="h-4 w-4" />
            {t('submitGrade')}
          </Button>
        </div>
      </div>
    </div>
  );
};