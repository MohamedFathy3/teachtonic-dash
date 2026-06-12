/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/CourseDetailsDialog.tsx
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, BookOpen, FileQuestion, FileText, BookMarked } from 'lucide-react';
import { CourseLessons } from './CourseLessons';
import { CourseAssignments } from './CourseAssignments';
import { CourseExams } from './CourseExams';
import { CourseBooks } from './CourseBooks';

interface CourseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: any;
  onViewLessonStudents: (lesson: any, courseTitle: string) => void;
}

export function CourseDetailsDialog({ 
  open, 
  onOpenChange, 
  course, 
  onViewLessonStudents 
}: CourseDetailsDialogProps) {
  const [activeDetailTab, setActiveDetailTab] = useState('lessons');

  if (!course) return null;

  const lessons = course.details || [];
  const exams = course.exams || [];
  const assignments = course.assignments || [];
  const books = course.books || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        <div className="relative h-80 w-full">
          <img src={course.image || '/placeholder-course.png'} alt={course.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white z-10 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h2 className="text-4xl font-bold">{course.title}</h2>
            <p className="text-white/80 mt-2 max-w-2xl">{course.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm">
                {course.type === 'online' ? '📺 Online Course' : '🏛️ Center Course'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm">
                👥 {course.students} Students
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab} className="space-y-6">
            <TabsList className="bg-muted/50 rounded-xl p-1 h-auto inline-flex flex-wrap gap-1">
              <TabsTrigger value="lessons" className="rounded-lg px-4 py-2 gap-2">
                <BookOpen className="h-4 w-4" /> Lessons
                <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{lessons.length}</span>
              </TabsTrigger>
              <TabsTrigger value="exams" className="rounded-lg px-4 py-2 gap-2">
                <FileQuestion className="h-4 w-4" /> Exams
                <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{exams.length}</span>
              </TabsTrigger>
              <TabsTrigger value="assignments" className="rounded-lg px-4 py-2 gap-2">
                <FileText className="h-4 w-4" /> Assignments
                <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{assignments.length}</span>
              </TabsTrigger>
              <TabsTrigger value="books" className="rounded-lg px-4 py-2 gap-2">
                <BookMarked className="h-4 w-4" /> Resources
                <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">{books.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="mt-6">
              <CourseLessons 
                lessons={lessons} 
                onViewStudents={onViewLessonStudents}
                courseTitle={course?.title}
              />
            </TabsContent>
            <TabsContent value="exams" className="mt-6">
              <CourseExams exams={exams} />
            </TabsContent>
            <TabsContent value="assignments" className="mt-6">
              <CourseAssignments assignments={assignments} />
            </TabsContent>
            <TabsContent value="books" className="mt-6">
              <CourseBooks books={books} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}