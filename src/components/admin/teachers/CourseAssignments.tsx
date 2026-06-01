// src/components/admin/teachers/course/CourseAssignments.tsx
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Download,
  Upload,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  description: string;
  total_marks: number;
  duration_minutes: number;
  active: boolean;
  submissions_count?: number;
  average_grade?: number;
}

interface CourseAssignmentsProps {
  assignments: Assignment[];
}

export function CourseAssignments({ assignments }: CourseAssignmentsProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Assignments</h2>
        
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <FileText className="h-6 w-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{assignments.length}</p>
          <p className="text-sm text-muted-foreground">Total Assignments</p>
        </Card>
        <Card className="p-4">
          <Users className="h-6 w-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold">
            {assignments.reduce((sum, a) => sum + (a.submissions_count || 0), 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Submissions</p>
        </Card>
        <Card className="p-4">
          <TrendingUp className="h-6 w-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">
            {Math.round(assignments.reduce((sum, a) => sum + (a.average_grade || 0), 0) / assignments.length) || 0}%
          </p>
          <p className="text-sm text-muted-foreground">Average Grade</p>
        </Card>
        <Card className="p-4">
          <Award className="h-6 w-6 text-orange-500 mb-2" />
          <p className="text-2xl font-bold">
            {assignments.reduce((sum, a) => sum + a.total_marks, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Marks</p>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{assignment.title}</h3>
                  <Badge variant={assignment.active ? 'default' : 'secondary'}>
                    {assignment.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {assignment.description}
                </p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {assignment.duration_minutes} minutes
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {assignment.total_marks} marks
                  </span>
                  {assignment.submissions_count && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {assignment.submissions_count} submissions
                    </span>
                  )}
                </div>

                {assignment.average_grade && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Average Grade</span>
                      <span>{assignment.average_grade}%</span>
                    </div>
                    <Progress value={assignment.average_grade} className="h-1.5" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-3 w-3" />
                  Submissions
                </Button>
                <Button variant="outline" size="sm">
                  Grade
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No assignments found for this course</p>
          <Button variant="link" className="mt-2">Create your first assignment</Button>
        </div>
      )}
    </div>
  );
}