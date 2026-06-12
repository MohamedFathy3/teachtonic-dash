/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/teachers/OverviewTab.tsx
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, Users, TrendingUp, Activity, Target, 
  Eye, DollarSign, Building, Calendar, CheckCircle 
} from 'lucide-react';
import { AvatarBadge } from '@/components/lms/AvatarBadge';
import { StatusBadge } from '@/components/lms/StatusBadge';

interface OverviewTabProps {
  teacherName: string;
  dashboardCourses: any[];
  dashboardStudents: any[];
  onViewCourse: (course: any) => void;
  onViewCourseStudents: (course: any) => void;
}

const StatsCard = ({ stat, index, gradient }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500`} />
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {stat.change} from last month
            </p>
          </div>
          <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <stat.icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export function OverviewTab({ 
  teacherName, 
  dashboardCourses, 
  dashboardStudents, 
  onViewCourse, 
  onViewCourseStudents 
}: OverviewTabProps) {
  
  const dynamicStats = [
    { label: 'Total Courses', value: dashboardCourses.length, icon: BookOpen, gradient: 'from-blue-500 to-blue-600', change: '+12%' },
    { label: 'Total Students', value: dashboardStudents.length, icon: Users, gradient: 'from-emerald-500 to-emerald-600', change: '+23%' },
    { label: 'Online Courses', value: dashboardCourses.filter(c => c.type === 'online').length, icon: Building, gradient: 'from-purple-500 to-purple-600', change: '+8%' },
    { label: 'Center Courses', value: dashboardCourses.filter(c => c.type === 'center').length, icon: DollarSign, gradient: 'from-amber-500 to-amber-600', change: '+15%' },
  ];

  const secondaryStatsData = [
    { label: 'Active Students', value: dashboardStudents.filter(s => s.active).length, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Completion Rate', value: '68%', icon: Target, color: 'from-blue-500 to-blue-600' },
    { label: 'Assignments', value: '24', icon: Activity, color: 'from-orange-500 to-orange-600' },
    { label: 'Exams', value: '12', icon: CheckCircle, color: 'from-red-500 to-red-600' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-2xl font-bold">Welcome back, {teacherName}! 👋</h3>
            <p className="text-muted-foreground mt-1">Here's what's happening with your teaching journey today.</p>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm">Completion rate: 78%</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map((stat, index) => (
          <StatsCard key={stat.label} stat={stat} index={index} gradient={stat.gradient} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {secondaryStatsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Card className="p-4 text-center group hover:shadow-md transition-all">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-2 shadow-md`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="rounded-2xl overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-muted/50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Top Performing Courses</h3>
              <p className="text-sm text-muted-foreground">Your best-selling courses this month</p>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left p-4 text-sm font-medium">Course Name</th>
                <th className="text-left p-4 text-sm font-medium">Type</th>
                <th className="text-left p-4 text-sm font-medium">Students</th>
                <th className="text-left p-4 text-sm font-medium">Revenue</th>
                <th className="text-left p-4 text-sm font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {dashboardCourses.slice(0, 5).map((course, idx) => (
                <motion.tr 
                  key={course.id} 
                  className="border-t hover:bg-muted/30 transition-colors group"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.category}</p>
                      </div>
                    </div>
                   </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${course.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {course.type}
                    </span>
                   </td>
                  <td className="p-4 font-medium">{course.students}</td>
                  <td className="p-4 font-medium text-green-600">${course.price}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onViewCourse(course)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onViewCourseStudents(course)}>
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                   </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}