/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/course/CourseSemesters.tsx
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  DollarSign, 
  BookOpen,
  ChevronRight,
  Users,
  Clock
} from 'lucide-react';

interface Semester {
  id: number;
  name: string;
  name_ar: string;
  active: boolean;
  price: string;
  discount: string;
  courses?: any[];
}

interface CourseSemestersProps {
  semesters: Semester[];
}

export function CourseSemesters({ semesters }: CourseSemestersProps) {
  const [expandedSemester, setExpandedSemester] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Semesters</h2>
          <p className="text-muted-foreground">Manage semesters and their content</p>
        </div>
        <Button className="gap-2">
          <Calendar className="h-4 w-4" />
          Add Semester
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Calendar className="h-6 w-6 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{semesters.length}</p>
          <p className="text-sm text-muted-foreground">Total Semesters</p>
        </Card>
        <Card className="p-4 text-center">
          <BookOpen className="h-6 w-6 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold">
            {semesters.reduce((sum, s) => sum + (s.courses?.length || 0), 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Courses</p>
        </Card>
        <Card className="p-4 text-center">
          <DollarSign className="h-6 w-6 mx-auto text-orange-500 mb-2" />
          <p className="text-2xl font-bold">
            ${semesters.reduce((sum, s) => sum + parseFloat(s.price), 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </Card>
      </div>

      {/* Semesters List */}
      <div className="space-y-3">
        {semesters.map((semester) => (
          <Card key={semester.id} className="overflow-hidden">
            <div 
              className="p-5 cursor-pointer hover:bg-muted/10 transition-colors"
              onClick={() => setExpandedSemester(expandedSemester === semester.id ? null : semester.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{semester.name}</h3>
                    <Badge variant={semester.active ? 'default' : 'secondary'}>
                      {semester.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {semester.name_ar}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                      <DollarSign className="h-4 w-4" />
                      ${semester.price}
                      {parseFloat(semester.discount) > 0 && (
                        <span className="text-xs line-through text-muted-foreground ml-1">
                          ${parseFloat(semester.price) + parseFloat(semester.discount)}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {semester.courses?.length || 0} Courses
                    </span>
                  </div>
                </div>

                <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${expandedSemester === semester.id ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {expandedSemester === semester.id && semester.courses && semester.courses.length > 0 && (
              <div className="border-t p-4 bg-muted/5">
                <h4 className="font-medium mb-3">Courses in this semester</h4>
                <div className="space-y-2">
                  {semester.courses.map((course: any) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.lessons?.length || 0} lessons • {course.exams?.length || 0} exams
                        </p>
                      </div>
                      <Badge variant="outline">{course.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {semesters.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No semesters assigned to this course</p>
          <Button variant="link" className="mt-2">Add a semester</Button>
        </div>
      )}
    </div>
  );
}