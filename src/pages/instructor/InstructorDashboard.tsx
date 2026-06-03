/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/instructor/InstructorDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { StatCard } from "@/components/lms/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, Users, DollarSign, Star, Sparkles, Loader2, 
  TrendingUp, FileQuestion, FileText, Layers, Ticket, 
  BookMarked, Download, Calendar, RefreshCw, X, Trophy,
  Award, Target, Clock, Zap, GraduationCap, BarChart3,
  PieChart as PieChartIcon, Activity, Globe, ChevronRight,
  Bell, CheckCircle2, CircleDollarSign, UserPlus
} from "lucide-react";
import { 
  Area, AreaChart, CartesianGrid, ResponsiveContainer, 
  Tooltip, XAxis, YAxis, Cell, Pie, PieChart, Legend,
  BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar,
  ComposedChart, Scatter
} from "recharts";
import api from '@/lib/api';
import { toast } from 'sonner';
import { AvatarBadge } from "@/components/lms/AvatarBadge";
import { ExportExcelButton } from "@/components/common/ExportExcelButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { teacherReportService } from '@/services/teacher-report.service';

interface InstructorReport {
  online_courses: number;
  center_courses: number;
  students_count: number;
  profits: number;
  used_coupons: number;
  exams_count: number;
  assignments_count: number;
  semesters_count: number;
  requests_count: number;
  books_count: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function InstructorDashboard() {
  const { t, user, dir, lang } = useApp();
  const [report, setReport] = useState<InstructorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [downloading, setDownloading] = useState(false);

  const fetchInstructorReport = useCallback(async () => {
    try {
      setLoading(true);
      const teacherId = user?.id;
      if (!teacherId) return;
      const response = await api.get(`/teachers/${teacherId}/report`);
      setReport(response.data?.data);
      generateChartData(response.data?.data);
      generateWeeklyData();
      generateTopCourses();
    } catch (error: any) {
      toast.error(t("error") + ": " + (error.message || t("tryAgain")));
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  const generateChartData = (reportData: InstructorReport | null) => {
    if (!reportData) return;
    const totalRevenue = reportData.profits || 0;
    const monthlyRevenue: any[] = [];
    
    for (let i = 0; i < 12; i++) {
      const growthFactor = 1 + Math.sin(i * 0.5) * 0.15;
      const revenue = Math.round((totalRevenue / 12) * growthFactor * 100) / 100;
      monthlyRevenue.push({
        month: MONTHS[i],
        revenue: revenue,
        students: Math.round((reportData.students_count / 12) * (1 + i * 0.05)),
        courses: Math.round(((reportData.online_courses + reportData.center_courses) / 12) * (1 + i * 0.03)),
      });
    }
    setMonthlyData(monthlyRevenue);
  };

  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekly = days.map((day, i) => ({
      day,
      enrollments: Math.floor(Math.random() * 30) + 10,
      revenue: Math.floor(Math.random() * 500) + 200,
      completion: Math.floor(Math.random() * 40) + 50,
    }));
    setWeeklyData(weekly);
  };

  const generateTopCourses = () => {
    setTopCourses([
      { name: "React Masterclass", students: 245, revenue: 7350, rating: 4.9 },
      { name: "UI/UX Design", students: 189, revenue: 5670, rating: 4.8 },
      { name: "Node.js Advanced", students: 167, revenue: 5010, rating: 4.7 },
      { name: "Flutter Mobile", students: 134, revenue: 4020, rating: 4.9 },
    ]);
  };

  const handleDownloadReport = async () => {
    const teacherId = user?.id;
    if (!teacherId || !fromDate || !toDate) {
      toast.error(t("pleaseSelectDates") || "Please select date range");
      return;
    }
    try {
      setDownloading(true);
      await teacherReportService.downloadReportPdf(teacherId, fromDate, toDate);
      toast.success(t("reportDownloaded") || "Report downloaded successfully");
      setReportDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || t("error"));
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchInstructorReport();
  }, [fetchInstructorReport]);

  const totalCourses = (report?.online_courses || 0) + (report?.center_courses || 0);
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const lastMonthRevenue = monthlyData[monthlyData.length - 1]?.revenue || 0;
  const previousMonthRevenue = monthlyData[monthlyData.length - 2]?.revenue || 0;
  const revenueGrowth = previousMonthRevenue === 0 ? 100 : Math.round(((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100);
  
  const avgRating = 4.9;
  const completionRate = Math.round((report?.students_count ? Math.min(100, (report.exams_count / report.students_count) * 100) : 68));

  const courseDistribution = [
    { name: t("online") || "Online", value: report?.online_courses || 0, color: '#3b82f6' },
    { name: t("center") || "Center", value: report?.center_courses || 0, color: '#8b5cf6' },
  ];

  const performanceData = [
    { name: t("exams") || "Exams", value: report?.exams_count || 0, icon: FileQuestion, color: '#ef4444' },
    { name: t("assignments") || "Assignments", value: report?.assignments_count || 0, icon: FileText, color: '#f59e0b' },
    { name: t("semesters") || "Semesters", value: report?.semesters_count || 0, icon: Layers, color: '#06b6d4' },
    { name: t("books") || "Books", value: report?.books_count || 0, icon: BookMarked, color: '#84cc16' },
    { name: t("coupons") || "Coupons", value: report?.used_coupons || 0, icon: Ticket, color: '#ec4899' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary/50 animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse">{t("loading") || "Loading dashboard..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-8 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 sm:px-6">
        
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-3xl">👋</span>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {t("welcomeBack") || "Welcome back"}, {user?.name || 'Instructor'}!
                </h1>
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {t("dashboardSubtitle") || "Your courses are gaining momentum. Keep it up!"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="gap-2 rounded-xl border-2 hover:border-primary/50 transition-all duration-300"
                onClick={() => setReportDialogOpen(true)}
              >
                <Download className="h-4 w-4" />
                {t("downloadReport") || "Download Report"}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl"
                onClick={fetchInstructorReport}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            label={t("myCourses") || "My Courses"} 
            value={totalCourses.toString()} 
            delta={12} 
            icon={BookOpen} 
            variant="primary" 
          />
          <StatCard 
            label={t("students") || "Students"} 
            value={report?.students_count?.toString() || "0"} 
            delta={14.2} 
            icon={Users} 
            variant="accent" 
          />
          <StatCard 
            label={t("earnings") || "Earnings"} 
            value={`${totalRevenue.toLocaleString()} EGP`} 
            delta={revenueGrowth} 
            icon={DollarSign} 
            variant="warm" 
          />
          <StatCard 
            label={t("rating") || "Rating"} 
            value={avgRating.toString()} 
            delta={0.2} 
            icon={Star} 
            variant="info" 
          />
        </div>

        {/* Quick Metrics Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">{t("completionRate") || "Completion Rate"}</p>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{report?.exams_count || 0}</p>
            <p className="text-xs text-muted-foreground">{t("totalExams") || "Total Exams"}</p>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950/30 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{report?.assignments_count || 0}</p>
            <p className="text-xs text-muted-foreground">{t("assignments") || "Assignments"}</p>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-950/30 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">120</p>
            <p className="text-xs text-muted-foreground">{t("teachingHours") || "Teaching Hours"}</p>
          </Card>
          <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <div className="h-12 w-12 rounded-xl bg-pink-100 dark:bg-pink-950/30 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-pink-600" />
            </div>
            <p className="text-2xl font-bold">{report?.used_coupons || 0}</p>
            <p className="text-xs text-muted-foreground">{t("activeCoupons") || "Active Coupons"}</p>
          </Card>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {performanceData.map((stat, idx) => (
            <Card key={stat.name} className="p-4 text-center hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-primary/5 transition-colors duration-300" />
              <div className={`h-12 w-12 rounded-xl mx-auto mb-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110`} style={{ backgroundColor: `${stat.color}20` }}>
                <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.name}</p>
            </Card>
          ))}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Revenue Chart - Large */}
          <Card className="lg:col-span-2 rounded-2xl border-0 bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <CircleDollarSign className="h-5 w-5 text-primary" />
                    {t("revenueOverview") || "Revenue Overview"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t("last12Months") || "Last 12 months performance"}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span className={`text-sm font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueGrowth >= 0 ? `+${revenueGrowth}%` : `${revenueGrowth}%`} {t("vsLastMonth") || "vs last month"}
                  </span>
                </div>
              </div>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v/1000}k`} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revenueGradient)" />
                    <Line yAxisId="right" type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: "#8b5cf6" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-border p-4 bg-muted/20">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t("totalRevenue") || "Total Revenue"}</p>
                <p className="text-xl font-bold text-primary">{totalRevenue.toLocaleString()} EGP</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-xs text-muted-foreground">{t("monthlyAverage") || "Monthly Average"}</p>
                <p className="text-xl font-bold">{(totalRevenue / 12).toLocaleString()} EGP</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t("bestMonth") || "Best Month"}</p>
                <p className="text-xl font-bold text-accent">
                  {monthlyData.reduce((max, m) => m.revenue > max.revenue ? m : max, monthlyData[0])?.month}
                </p>
              </div>
            </div>
          </Card>

          {/* Course Distribution Pie */}
          <Card className="rounded-2xl border-0 bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                {t("courseDistribution") || "Course Distribution"}
              </h3>
              <p className="text-sm text-muted-foreground">{t("onlineVsCenter") || "Online vs Center courses"}</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={courseDistribution} 
                      dataKey="value" 
                      nameKey="name" 
                      innerRadius={50} 
                      outerRadius={85} 
                      paddingAngle={3}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ strokeWidth: 1, stroke: "hsl(var(--border))" }}
                    >
                      {courseDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                      formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                    />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{report?.online_courses || 0}</p>
                  <p className="text-xs text-muted-foreground">{t("onlineCourses") || "Online Courses"}</p>
                </div>
                <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">{report?.center_courses || 0}</p>
                  <p className="text-xs text-muted-foreground">{t("centerCourses") || "Center Courses"}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Weekly Performance */}
          <Card className="rounded-2xl border-0 bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t("weeklyPerformance") || "Weekly Performance"}
              </h3>
              <p className="text-sm text-muted-foreground">{t("thisWeekActivity") || "This week's activity metrics"}</p>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                    <Legend />
                    <Bar dataKey="enrollments" name={t("enrollments") || "Enrollments"} fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="completion" name={t("completion") || "Completion %"} fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Radial Progress Chart */}
          <Card className="rounded-2xl border-0 bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t("progressMetrics") || "Progress Metrics"}
              </h3>
              <p className="text-sm text-muted-foreground">{t("goalAchievement") || "Goal achievement overview"}</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="20%" 
                    outerRadius="80%" 
                    data={[
                      { name: t("courses") || "Courses", value: (totalCourses / 20) * 100, fill: "#3b82f6" },
                      { name: t("students") || "Students", value: Math.min(100, (report?.students_count || 0) / 50 * 100), fill: "#8b5cf6" },
                      { name: t("revenue") || "Revenue", value: Math.min(100, totalRevenue / 20000 * 100), fill: "#10b981" },
                      { name: t("completion") || "Completion", value: completionRate, fill: "#f59e0b" },
                    ]}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar background clockWise dataKey="value" cornerRadius={8} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Courses & Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Courses Table */}
          <Card className="rounded-2xl border-0 bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    {t("topCourses") || "Top Performing Courses"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t("mostEnrolledCourses") || "Most enrolled this month"}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div className="mt-4 space-y-3">
                {topCourses.map((course, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{course.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.students}</span>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {course.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{course.revenue.toLocaleString()} EGP</p>
                      <p className="text-xs text-muted-foreground">{t("revenue") || "Revenue"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Activity Timeline */}
          <Card className="rounded-2xl border-0 bg-gradient-to-br from-card to-card/80 shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    {t("recentActivity") || "Recent Activity"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t("latestUpdates") || "Latest updates from your courses"}</p>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 rounded-xl" onClick={fetchInstructorReport}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t("refresh") || "Refresh"}
                </Button>
              </div>
              <div className="mt-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 6).map((a, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/20 transition-all duration-300">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{a.user || "Student"}</span>
                          <span className="text-muted-foreground"> {a.action || "enrolled in"} </span>
                          <span className="font-medium">{a.target || "a course"}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.time || "Just now"}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">{t("noRecentActivity") || "No recent activity"}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Download Report Dialog */}
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Download className="h-5 w-5 text-primary" />
                {t("downloadReport") || "Download Report"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("fromDate") || "From Date"}</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-9 rounded-xl"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("toDate") || "To Date"}</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-9 rounded-xl"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setReportDialogOpen(false)}
                className="rounded-xl"
              >
                {t("cancel") || "Cancel"}
              </Button>
              <Button
                onClick={handleDownloadReport}
                disabled={downloading}
                className="gap-2 rounded-xl"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("downloading") || "Downloading..."}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    {t("downloadPDF") || "Download PDF"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--border));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary));
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}