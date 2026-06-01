/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/TeacherCoursesTab.tsx
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/lms/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Building, Eye, ChevronRight, DollarSign, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeacherCoursesTabProps {
  dashboardCourses: any[];
  dashboardSemesters: any[];
  teacherReport: any;
  onViewCourse: (course: any) => void;
}

const CourseCard = ({ course, onView, idx }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.1 }}
  >
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => onView(course)}>
      <div className="relative h-48 overflow-hidden">
        <img src={course.image || '/placeholder-course.png'} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-3 right-3"><StatusBadge status={course.status} /></div>
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-black">${course.price}</span>
            {course.discount > 0 && <span className="px-2 py-1 rounded-lg bg-red-500 text-xs text-white">-{course.discount}%</span>}
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{course.semesterName ?? course.category}</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center p-2 rounded-lg bg-muted/30"><p className="text-lg font-bold">{course.students}</p><p className="text-[10px] text-muted-foreground">Students</p></div>
          <div className="text-center p-2 rounded-lg bg-muted/30"><p className="text-lg font-bold">{course.lessonsCount}</p><p className="text-[10px] text-muted-foreground">Lessons</p></div>
          <div className="text-center p-2 rounded-lg bg-muted/30"><p className="text-lg font-bold">{course.examsCount}</p><p className="text-[10px] text-muted-foreground">Exams</p></div>
        </div>
        <Button variant="outline" className="w-full mt-4 gap-2 group-hover:bg-primary group-hover:text-white transition-all">
          <Eye className="h-4 w-4" /> View Details <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  </motion.div>
);

export function TeacherCoursesTab({ dashboardCourses, dashboardSemesters, teacherReport, onViewCourse }: TeacherCoursesTabProps) {
  const [activeCourseTab, setActiveCourseTab] = useState<'online' | 'center' | 'semester'>('online');

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-3 p-1 bg-muted/50 rounded-xl w-fit flex-wrap">
        <button onClick={() => setActiveCourseTab('online')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeCourseTab === 'online' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <BookOpen className="h-4 w-4" /> Online Courses <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{teacherReport?.online_courses || 0}</span>
        </button>
        <button onClick={() => setActiveCourseTab('center')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeCourseTab === 'center' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <Building className="h-4 w-4" /> Center Courses <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{teacherReport?.center_courses || 0}</span>
        </button>
        <button onClick={() => setActiveCourseTab('semester')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeCourseTab === 'semester' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <GraduationCap className="h-4 w-4" /> Semesters <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{dashboardSemesters?.length || 0}</span>
        </button>
      </div>

      {/* Online Courses */}
      {activeCourseTab === 'online' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboardCourses.filter(c => c.type === 'online').map((course, idx) => <CourseCard key={course.id} course={course} onView={onViewCourse} idx={idx} />)}
        </div>
      )}

      {/* Center Courses */}
      {activeCourseTab === 'center' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboardCourses.filter(c => c.type === 'center').map((course, idx) => <CourseCard key={course.id} course={course} onView={onViewCourse} idx={idx} />)}
        </div>
      )}

      {/* Semesters */}
      {activeCourseTab === 'semester' && (
        <div className="space-y-6">
          {dashboardSemesters?.map((semester, idx) => (
            <motion.div key={semester.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-primary/10 to-transparent border-b">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div><h3 className="text-xl font-bold">{semester.name}</h3><p className="text-sm text-muted-foreground">{semester.name_ar}</p></div>
                    <div className="flex items-center gap-3">
                      <Badge variant={semester.active ? 'default' : 'secondary'}>{semester.active ? 'Active' : 'Inactive'}</Badge>
                      <div className="flex items-center gap-2 text-sm"><DollarSign className="h-4 w-4 text-green-600" /><span className="font-medium">${semester.price}</span></div>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-semibold mb-4">Courses ({semester.courses?.length || 0})</h4>
                  {semester.courses?.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {semester.courses.map((course: any) => {
                        const matchedCourse = dashboardCourses.find(c => c.id === course.id);
                        return (
                          <Card key={course.id} className="group cursor-pointer hover:shadow-md transition-all overflow-hidden" onClick={() => onViewCourse(course)}>
                            <div className="relative h-32 overflow-hidden">
                              <img src={course.imageUrl || '/placeholder-course.png'} alt={course.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              <div className="absolute bottom-2 left-2"><span className={`text-xs px-2 py-0.5 rounded-full ${course.type === 'online' ? 'bg-blue-500' : 'bg-purple-500'} text-white`}>{course.type === 'online' ? 'Online' : 'Center'}</span></div>
                            </div>
                            <div className="p-3">
                              <h5 className="font-semibold line-clamp-1">{course.title}</h5>
                              <div className="flex items-center justify-between mt-2 text-sm"><span className="text-muted-foreground">👥 {matchedCourse?.students || course.count_student || 0} students</span><span className="text-green-600 font-medium">${matchedCourse?.price || course.price || 0}</span></div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : <div className="text-center py-8 bg-muted/20 rounded-lg"><BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">No courses in this semester</p></div>}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}