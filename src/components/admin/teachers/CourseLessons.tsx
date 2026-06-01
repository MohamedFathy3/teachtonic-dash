/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/course/CourseLessons.tsx
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Lock, 
  Unlock,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Users
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Lesson {
  id: number;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  content_link: string;
  lession_date: string;
  lession_time: string;
  price: string;
  discount?: string;
  must_pass_to_unlock: boolean;
  attended: boolean;
  students?: any[]; // الطلاب المسجلين في الدرس
  students_count?: number;
}

interface CourseLessonsProps {
  lessons: Lesson[];
  onViewStudents?: (lesson: Lesson, courseTitle: string) => void;
  courseTitle?: string;
}

export function CourseLessons({ lessons, onViewStudents, courseTitle }: CourseLessonsProps) {
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

  // تأكد من وجود lessons
  const safeLessons = useMemo(() => {
    if (!lessons || !Array.isArray(lessons)) {
      return [];
    }
    return lessons;
  }, [lessons]);

  const getVideoId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  const completedCount = safeLessons.filter(l => l.attended).length;
  const progress = safeLessons.length > 0 ? (completedCount / safeLessons.length) * 100 : 0;
  const totalRevenue = safeLessons.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);

  const handleViewStudents = (lesson: Lesson, e: React.MouseEvent) => {
    e.stopPropagation(); // منع فتح تفاصيل الدرس
    if (onViewStudents) {
      onViewStudents(lesson, courseTitle || 'Course');
    }
  };

  if (safeLessons.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No lessons found for this course</p>
        <Button variant="link" className="mt-2">Add your first lesson</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
          <p className="text-2xl font-bold text-blue-600">{safeLessons.length}</p>
          <p className="text-sm text-muted-foreground">Total Lessons</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
          <p className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</p>
          <p className="text-sm text-muted-foreground">Progress</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30">
          <p className="text-2xl font-bold text-amber-600">${totalRevenue}</p>
          <p className="text-sm text-muted-foreground">Revenue</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>Course Progress</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {safeLessons.map((lesson, index) => {
          const videoId = getVideoId(lesson.content_link);
          const isExpanded = expandedLesson === lesson.id;
          const studentsCount = lesson.students?.length || lesson.students_count || 0;
          
          return (
            <Card 
              key={lesson.id} 
              className={`overflow-hidden transition-all duration-300 ${
                lesson.attended ? 'border-l-4 border-l-green-500' : ''
              }`}
            >
              <div 
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Lesson Number */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">{index + 1}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{lesson.title}</h3>
                      {lesson.must_pass_to_unlock && !lesson.attended && (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Locked
                        </Badge>
                      )}
                      {lesson.attended && (
                        <Badge className="bg-green-500 gap-1">
                          <Unlock className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {lesson.description}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {lesson.lession_date ? new Date(lesson.lession_date).toLocaleDateString() : 'No date'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.lession_time || 'No time'}
                      </span>
                      {parseFloat(lesson.price) > 0 && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <DollarSign className="h-3 w-3" />
                          ${lesson.price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Students Button */}
                    {onViewStudents && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => handleViewStudents(lesson, e)}
                        className="relative"
                        title="View Students"
                      >
                        <Users className="h-4 w-4" />
                        {studentsCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">
                            {studentsCount}
                          </span>
                        )}
                      </Button>
                    )}
                    
                    {/* Expand Button */}
                    <Button variant="ghost" size="icon">
                      {isExpanded ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t p-4 bg-muted/5">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Video Player */}
                    {videoId ? (
                      <div className="rounded-lg overflow-hidden bg-black aspect-video">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={lesson.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg bg-muted/30 flex items-center justify-center aspect-video">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {lesson.description || 'No description available'}
                      </p>
                      
                      {lesson.must_pass_to_unlock && !lesson.attended && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            This lesson requires passing an exam to unlock
                          </p>
                        </div>
                      )}

                      {/* Extra Info */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <p className="font-medium">{lesson.lession_date || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time:</span>
                            <p className="font-medium">{lesson.lession_time || 'N/A'}</p>
                          </div>
                          {parseFloat(lesson.price) > 0 && (
                            <div>
                              <span className="text-muted-foreground">Price:</span>
                              <p className="font-medium text-green-600">${lesson.price}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Students List Summary */}
                      {studentsCount > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Enrolled Students ({studentsCount})
                            </h4>
                            {onViewStudents && (
                              <Button 
                                variant="link" 
                                size="sm"
                                onClick={(e) => handleViewStudents(lesson, e)}
                                className="text-xs"
                              >
                                View all
                              </Button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {lesson.students?.slice(0, 5).map((student: any) => (
                              <div key={student.id} className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded-full">
                                <span>{student.name}</span>
                              </div>
                            ))}
                            {studentsCount > 5 && (
                              <span className="text-xs text-muted-foreground">
                                +{studentsCount - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}