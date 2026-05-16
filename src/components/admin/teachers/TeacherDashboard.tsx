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
import {
  BookOpen, Users, FileText, Star, TrendingUp, Download,
  Calendar, CheckCircle, Award, BarChart3,
  Eye, Edit, Trash2, Plus, Search
} from 'lucide-react';

interface TeacherDashboardProps {
  teacherId: number;
  teacherName: string;
}

// Static Data
const staticCourses = [
  { id: 1, title: 'React Mastery 2024', category: 'Frontend', students: 245, rating: 4.8, price: 99, progress: 75, status: 'published' },
  { id: 2, title: 'Advanced TypeScript', category: 'Programming', students: 189, rating: 4.9, price: 79, progress: 60, status: 'published' },
  { id: 3, title: 'Node.js Backend', category: 'Backend', students: 312, rating: 4.7, price: 89, progress: 45, status: 'draft' },
  { id: 4, title: 'UI/UX Design', category: 'Design', students: 167, rating: 4.6, price: 69, progress: 30, status: 'published' },
];

const staticStudents = [
  { id: 1, name: 'Ahmed Mohamed', avatar: 'A', email: 'ahmed@email.com', course: 'React Mastery', progress: 85, lastActive: '2024-01-15', status: 'active' },
  { id: 2, name: 'Sara Hassan', avatar: 'S', email: 'sara@email.com', course: 'TypeScript', progress: 92, lastActive: '2024-01-14', status: 'active' },
  { id: 3, name: 'Omar Khaled', avatar: 'O', email: 'omar@email.com', course: 'Node.js', progress: 45, lastActive: '2024-01-10', status: 'inactive' },
  { id: 4, name: 'Laila Ahmed', avatar: 'L', email: 'laila@email.com', course: 'UI/UX', progress: 78, lastActive: '2024-01-12', status: 'active' },
];

const staticAssignments = [
  { id: 1, title: 'React Hooks Project', student: 'Ahmed Mohamed', submitted: '2024-01-14', status: 'submitted', grade: 92 },
  { id: 2, title: 'TypeScript Generics', student: 'Sara Hassan', submitted: '2024-01-13', status: 'graded', grade: 88 },
  { id: 3, title: 'REST API Design', student: 'Omar Khaled', submitted: '2024-01-09', status: 'pending', grade: null },
  { id: 4, title: 'Figma Prototype', student: 'Laila Ahmed', submitted: '2024-01-11', status: 'submitted', grade: null },
];

const staticReviews = [
  { id: 1, student: 'Ahmed Mohamed', rating: 5, comment: 'Excellent course! Very well structured.', date: '2024-01-10', course: 'React Mastery' },
  { id: 2, student: 'Sara Hassan', rating: 4, comment: 'Great content, but could use more examples.', date: '2024-01-08', course: 'TypeScript' },
  { id: 3, student: 'Omar Khaled', rating: 5, comment: 'Best backend course I\'ve taken!', date: '2024-01-05', course: 'Node.js' },
];

export function TeacherDashboard({ teacherId, teacherName }: TeacherDashboardProps) {
  const { dir } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('overview');

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
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'theme', label: 'Theme', icon: Award },
  ];

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
                <th className="text-left p-4 text-sm font-medium">Rating</th>
                <th className="text-left p-4 text-sm font-medium">Progress</th>
              </tr>
            </thead>
            <tbody>
              {staticCourses.map((course) => (
                <tr key={course.id} className="border-t">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.category}</p>
                    </div>
                  </td>
                  <td className="p-4">{course.students}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      {course.rating}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 max-w-[150px]">
                      <Progress value={course.progress} className="h-2" />
                      <span className="text-xs">{course.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderCourses = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {staticCourses.map((course) => (
        <Card key={course.id} className="p-4 rounded-xl hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{course.title}</h4>
                <p className="text-xs text-muted-foreground">{course.category}</p>
              </div>
            </div>
            <StatusBadge status={course.status as any} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div><p className="font-bold">{course.students}</p><p className="text-xs text-muted-foreground">Students</p></div>
            <div><p className="font-bold">{course.rating}</p><p className="text-xs text-muted-foreground">Rating</p></div>
            <div><p className="font-bold">${course.price}</p><p className="text-xs text-muted-foreground">Price</p></div>
          </div>
          <div className="mt-3 flex gap-2">
            <Progress value={course.progress} className="h-1 flex-1" />
            <span className="text-xs">{course.progress}%</span>
          </div>
          <div className="mt-4 flex justify-end gap-1">
            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
            {staticStudents.map((student) => (
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
                <td className="p-4">{student.course}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 max-w-[150px]">
                    <Progress value={student.progress} className="h-2" />
                    <span className="text-xs">{student.progress}%</span>
                  </div>
                </td>
                <td className="p-4 text-sm">{student.lastActive}</td>
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
              <th className="text-left p-4 text-sm font-medium">Title</th>
              <th className="text-left p-4 text-sm font-medium">Student</th>
              <th className="text-left p-4 text-sm font-medium">Submitted</th>
              <th className="text-left p-4 text-sm font-medium">Status</th>
              <th className="text-left p-4 text-sm font-medium">Grade</th>
            </tr>
          </thead>
          <tbody>
            {staticAssignments.map((assignment) => (
              <tr key={assignment.id} className="border-t">
                <td className="p-4 font-medium">{assignment.title}</td>
                <td className="p-4">{assignment.student}</td>
                <td className="p-4 text-sm">{assignment.submitted}</td>
                <td className="p-4"><StatusBadge status={assignment.status as any} /></td>
                <td className="p-4">
                  {assignment.grade ? (
                    <span className="font-semibold text-green-600">{assignment.grade}/100</span>
                  ) : <span className="text-muted-foreground">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
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
      {activeSubTab === 'reviews' && renderReviews()}
      {activeSubTab === 'reports' && renderReports()}
      {activeSubTab === 'theme' && renderTheme()}
    </div>
  );
}