// src/components/admin/teachers/course/CourseExams.tsx
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileQuestion, 
  Clock, 
  Award, 
  Eye, 
  BarChart3,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Exam {
  id: number;
  title: string;
  description: string;
  total_marks: number;
  duration_minutes: number;
  questions_count?: number;
  active: boolean;
  show_result: boolean;
  passing_score?: number;
}

interface CourseExamsProps {
  exams: Exam[];
}

export function CourseExams({ exams }: CourseExamsProps) {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const getStatusColor = (active: boolean) => {
    return active ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
          <FileQuestion className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <p className="text-2xl font-bold">{exams.length}</p>
          <p className="text-sm text-muted-foreground">Total Exams</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
          <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <p className="text-2xl font-bold">
            {exams.reduce((sum, e) => sum + e.total_marks, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Marks</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30">
          <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
          <p className="text-2xl font-bold">
            {exams.reduce((sum, e) => sum + e.duration_minutes, 0)} min
          </p>
          <p className="text-sm text-muted-foreground">Total Duration</p>
        </Card>
      </div>

      {/* Exams Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {exams.map((exam) => (
          <Card 
            key={exam.id} 
            className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg line-clamp-1">{exam.title}</h3>
                <Badge className={getStatusColor(exam.active)}>
                  {exam.active ? 'Published' : 'Draft'}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {exam.description}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Questions</p>
                  <p className="font-bold">{exam.questions_count || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total Marks</p>
                  <p className="font-bold">{exam.total_marks}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-bold">{exam.duration_minutes} min</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {exam.show_result ? (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Results Visible
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Results Hidden
                    </span>
                  )}
                  {exam.passing_score && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" />
                      Pass: {exam.passing_score}%
                    </span>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedExam(exam)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Exam Details Dialog */}
      <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedExam?.title}</DialogTitle>
          </DialogHeader>
          {selectedExam && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedExam.description}</p>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{selectedExam.duration_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Marks</p>
                  <p className="font-semibold">{selectedExam.total_marks}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="font-semibold">{selectedExam.questions_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedExam.active)}>
                    {selectedExam.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <Button className="w-full gap-2">
                <BarChart3 className="h-4 w-4" />
                View Exam Analytics
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}