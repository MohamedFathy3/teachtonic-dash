/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/TeacherDashboard.tsx
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { AvatarBadge } from '@/components/lms/AvatarBadge';
import { StatusBadge } from '@/components/lms/StatusBadge';
import { ThemePicker } from './ThemePicker';
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard';
import {
  BookOpen, Users, FileText, Star, TrendingUp, Download,
  Calendar, CheckCircle, Award, BarChart3,
  Eye, Edit, Trash2, Plus, Search
} from 'lucide-react';


interface TeacherDashboardProps {
  teacherId: number;
  teacherName: string;
}

const staticReviews = [
  { id: 1, student: 'Ahmed Mohamed', rating: 5, comment: 'Excellent course! Very well structured.', date: '2024-01-10', course: 'React Mastery' },
  { id: 2, student: 'Sara Hassan', rating: 4, comment: 'Great content, but could use more examples.', date: '2024-01-08', course: 'TypeScript' },
  { id: 3, student: 'Omar Khaled', rating: 5, comment: 'Best backend course I\'ve taken!', date: '2024-01-05', course: 'Node.js' },
];

export function TeacherDashboard({ teacherId, teacherName }: TeacherDashboardProps) {
  const { dir } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('overview');

const {
  teacherData,
  loading,
  dashboardCourses,
  dashboardStudents,
  dashboardAssignments,
  dashboardExams,
  dashboardBooks,
} = useTeacherDashboard(teacherId);

  const stats = [
    { label: 'Total Courses', value: '12', icon: BookOpen, change: '+2', color: 'bg-blue-500' },
    { label: 'Active Students', value: '1,847', icon: Users, change: '+156', color: 'bg-green-500' },
    { label: 'Assignments', value: '48', icon: FileText, change: '+12', color: 'bg-orange-500' },
    { label: 'Avg Rating', value: '4.8', icon: Star, change: '+0.3', color: 'bg-yellow-500' },
  ];

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'exams', label: 'Exams', icon: CheckCircle },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'theme', label: 'Theme', icon: Award },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg font-semibold">Loading teacher data...</p>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`h-12 w-12 rounded-full ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-semibold">Top Courses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Course</th>
                <th className="text-left p-4 text-sm font-medium">Students</th>

              </tr>
            </thead>
            <tbody>
              {dashboardCourses.map((course) => (
                <tr key={course.id} className="border-t">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.category}</p>
                    </div>
                  </td>
                  <td className="p-4">{course.students}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderCourses = () => (

    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {dashboardCourses.map((course) => (
        <Card
          key={course.id}
          className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          {/* IMAGE */}
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={course.image || '/placeholder-course.png'}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* status */}
            <div className="absolute top-3 right-3">
              <StatusBadge status={course.status as any} />
            </div>

            {/* price */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-black">
                ${course.price}
              </span>

              {course.discount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                  -{course.discount}%
                </span>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-4 space-y-4">
            {/* TITLE */}
            <div>
              <h3 className="text-base font-semibold line-clamp-1">
                {course.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {course.semesterName ?? course.category}
              </p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-muted/40 p-2 text-center">
                <p className="text-sm font-bold">{course.students}</p>
                <p className="text-[11px] text-muted-foreground">Students</p>
              </div>

              <div className="rounded-xl bg-muted/40 p-2 text-center">
                <p className="text-sm font-bold">{course.lessonsCount}</p>
                <p className="text-[11px] text-muted-foreground">Lessons</p>
              </div>

              <div className="rounded-xl bg-muted/40 p-2 text-center">
                <p className="text-sm font-bold">{course.examsCount}</p>
                <p className="text-[11px] text-muted-foreground">Exams</p>
              </div>
            </div>

            {/* SECOND ROW STATS */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-muted/40 p-2 text-center">
                <p className="text-sm font-bold">{course.assignmentsCount}</p>
                <p className="text-[11px] text-muted-foreground">Assignments</p>
              </div>

              <div className="rounded-xl bg-muted/40 p-2 text-center">
                <p className="text-sm font-bold">{course.totalContent}</p>
                <p className="text-[11px] text-muted-foreground">Total</p>
              </div>
            </div>

            {/* PRICE INFO */}
            {course.priceBeforeDiscount &&
              course.priceBeforeDiscount > course.price && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Original Price
                  </span>
                  <span className="line-through text-muted-foreground">
                    ${course.priceBeforeDiscount}
                  </span>
                </div>
              )}

            {/* ACTIONS */}
            <div className="flex items-center justify-end gap-1 border-t pt-3">
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>

  );

  const renderStudents = () => (
    <Card className="rounded-2xl overflow-hidden">
      <div className="p-4 border-b">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-9" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4 text-sm font-medium">Student</th>
              <th className="text-left p-4 text-sm font-medium">Course</th>
              <th className="text-left p-4 text-sm font-medium">Progress</th>
              <th className="text-left p-4 text-sm font-medium">Last Active</th>
              <th className="text-left p-4 text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {dashboardStudents.map((student) => (
              <tr key={student.id} className="border-t">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <AvatarBadge initials={student.avatar} size="sm" />
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  {student.enrolledCourses ?? 0} Courses
                </td>

                <td className="p-4">

                  <div className="flex items-center gap-2 max-w-[150px]">
                    <Progress value={student.progress} className="h-2" />
                    <span className="text-xs">{student.progress}%</span>
                  </div>
                </td>
                <td className="p-4 text-sm"><AvatarBadge
                  initials={student.avatar ?? student.name.charAt(0)}
                  size="sm"
                />
                </td>

                <td className="p-4"><StatusBadge status={student.status as any} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderAssignments = () => (
    <Card className="rounded-2xl overflow-hidden">
      <div className="p-4 border-b">
        <Button className="gap-2"><Plus className="h-4 w-4" />New Assignment</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4 text-sm font-medium">
                Assignment
              </th>
              <th className="text-left p-4 text-sm font-medium">
                Course
              </th>
              <th className="text-left p-4 text-sm font-medium">
                Questions
              </th>
              <th className="text-left p-4 text-sm font-medium">
                Marks
              </th>
              <th className="text-left p-4 text-sm font-medium">
                Duration
              </th>
              <th className="text-left p-4 text-sm font-medium">
                Status
              </th>
              <th className="text-left p-4 text-sm font-medium">
                Created
              </th>
            
            </tr>
          </thead>
          <tbody>
            {dashboardAssignments.map((assignment) => (
              <tr
                key={assignment.id}
                className="border-t hover:bg-muted/20 transition"
              >
                {/* Assignment */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        assignment.imageUrl ||
                        '/placeholder-course.png'
                      }
                      alt={assignment.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />

                    <div>
                      <p className="font-medium line-clamp-1">
                        {assignment.title}
                      </p>

                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {assignment.description}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Course */}
                <td className="p-4">
                  React Course
                </td>

                {/* Questions */}
                <td className="p-4">
                  {assignment.questions.length}
                </td>

                {/* Marks */}
                <td className="p-4 font-semibold">
                  {assignment.total_marks}
                </td>

                {/* Duration */}
                <td className="p-4">
                  {assignment.duration_minutes} min
                </td>

                {/* Status */}
                <td className="p-4">
                  <StatusBadge
                    status={
                      assignment.active
                        ? 'published'
                        : 'draft'
                    }
                  />
                </td>

                {/* Created */}
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(
                    assignment.created_at
                  ).toLocaleDateString()}
                </td>

             
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderExams = () => (
    <Card className="rounded-2xl overflow-hidden">
      <div className="p-4 border-b">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Exam
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4 text-sm font-medium">
                Exam
              </th>

              <th className="text-left p-4 text-sm font-medium">
                Course
              </th>

              <th className="text-left p-4 text-sm font-medium">
                Questions
              </th>

              <th className="text-left p-4 text-sm font-medium">
                Total Marks
              </th>

              <th className="text-left p-4 text-sm font-medium">
                Duration
              </th>

              <th className="text-left p-4 text-sm font-medium">
                Result
              </th>

              <th className="text-left p-4 text-sm font-medium">
                Status
              </th>

            
            </tr>
          </thead>

          <tbody>
            {dashboardExams.map((exam: any) => (
              <tr
                key={exam.id}
                className="border-t hover:bg-muted/20 transition"
              >
                {/* Exam */}
                <td className="p-4">
                  <div className="flex items-center gap-3">

                    <img
                      src={
                        exam.imageUrl ||
                        '/placeholder-course.png'
                      }
                      alt={exam.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />

                    <div>
                      <p className="font-medium line-clamp-1">
                        {exam.title}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {exam.description}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Course */}
                <td className="p-4">
                  {exam.courseTitle}
                </td>

                {/* Questions */}
                <td className="p-4">
                  {exam.questions?.length ?? 0}
                </td>

                {/* Marks */}
                <td className="p-4 font-semibold">
                  {exam.total_marks}
                </td>

                {/* Duration */}
                <td className="p-4">
                  {exam.duration_minutes} min
                </td>

                {/* Result */}
                <td className="p-4">
                  {exam.show_result ? (
                    <span className="text-green-600 text-sm font-medium">
                      Visible
                    </span>
                  ) : (
                    <span className="text-red-500 text-sm font-medium">
                      Hidden
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="p-4">
                  <StatusBadge
                    status={
                      exam.active
                        ? 'published'
                        : 'draft'
                    }
                  />
                </td>

             
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
const renderBooks = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {dashboardBooks.map((book) => (
      <Card
        key={book.id}
        className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      >
        {/* IMAGE */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={book.imageUrl || '/placeholder-book.png'}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <div className="absolute top-3 right-3">
            <StatusBadge
              status={book.active ? 'published' : 'draft'}
            />
          </div>

          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-black">
              ${book.price}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-base font-semibold line-clamp-1">
              {book.title}
            </h3>

            <p className="text-sm text-muted-foreground">
              By {book.writer}
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-muted/40 p-3 text-center">
              <p className="text-sm font-bold">
                {book.pagesCount}
              </p>

              <p className="text-[11px] text-muted-foreground">
                Pages
              </p>
            </div>

            <div className="rounded-xl bg-muted/40 p-3 text-center">
              <p className="text-sm font-bold">
                {new Date(book.createdAt).toLocaleDateString()}
              </p>

              <p className="text-[11px] text-muted-foreground">
                Created
              </p>
            </div>
          </div>

          {/* <div className="flex items-center justify-end gap-1 border-t pt-3">
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div> */}
        </div>
      </Card>
    ))}
  </div>
);

  const renderReviews = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Star className="h-8 w-8 fill-yellow-500 text-yellow-500" />
          <div><p className="text-2xl font-bold">4.8</p><p className="text-xs text-muted-foreground">Overall Rating</p></div>
        </div>
      </div>
      {staticReviews.map((review) => (
        <Card key={review.id} className="p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <AvatarBadge initials={review.student.charAt(0)} size="md" />
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div><p className="font-semibold">{review.student}</p><p className="text-xs text-muted-foreground">{review.course}</p></div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm mt-2">{review.comment}</p>
              <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );




  const renderReports = () => (
    <Card className="p-5 rounded-xl">
      <h4 className="font-semibold mb-4">Generate Report for {teacherName}</h4>
      <div className="space-y-4">
        <div>
          <Label>Report Type</Label>
          <select className="w-full mt-1 rounded-lg border p-2">
            <option>Student Progress</option>
            <option>Course Analytics</option>
            <option>Revenue Report</option>
          </select>
        </div>
        <div>
          <Label>Date Range</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Input type="date" placeholder="From" />
            <Input type="date" placeholder="To" />
          </div>
        </div>
        <Button className="w-full gap-2"><Download className="h-4 w-4" />Generate Report</Button>
      </div>
    </Card>
  );

  const renderTheme = () => <ThemePicker />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Teacher Dashboard</h2>
        <Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" />Jan 1 - Jan 31, 2024</Button>
      </div>

      <div className="flex overflow-x-auto gap-1 pb-2 border-b">
        {subTabs.map((tab) => (
          <Button key={tab.id} variant={activeSubTab === tab.id ? 'default' : 'ghost'} onClick={() => setActiveSubTab(tab.id)} className="gap-2 shrink-0">
            <tab.icon className="h-4 w-4" />{tab.label}
          </Button>
        ))}
      </div>

      {activeSubTab === 'overview' && renderOverview()}
      {activeSubTab === 'courses' && renderCourses()}
      {activeSubTab === 'students' && renderStudents()}
      {activeSubTab === 'assignments' && renderAssignments()}
      {activeSubTab === 'exams' && renderExams()}
      {activeSubTab === 'books' && renderBooks()}
      {activeSubTab === 'reviews' && renderReviews()}
      {activeSubTab === 'reports' && renderReports()}
      {activeSubTab === 'theme' && renderTheme()}
    </div>
  );
}