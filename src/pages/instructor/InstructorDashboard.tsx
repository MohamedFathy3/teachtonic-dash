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
  BookMarked, Download, Calendar, RefreshCw, X
} from "lucide-react";
import { 
  Area, AreaChart, CartesianGrid, ResponsiveContainer, 
  Tooltip, XAxis, YAxis, Cell, Pie, PieChart, Legend,
  BarChart, Bar
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

// أسماء الأشهر
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function InstructorDashboard() {
  const { t, user } = useApp();
  const [report, setReport] = useState<InstructorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  
  // Report dialog states
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [downloading, setDownloading] = useState(false);

  // جلب تقرير المعلم
  const fetchInstructorReport = useCallback(async () => {
    try {
      setLoading(true);
      const teacherId = user?.id;
      if (!teacherId) {
        console.error("No teacher ID found");
        return;
      }
      const response = await api.get(`/teachers/${teacherId}/report`);
      console.log("Instructor Report:", response.data);
      setReport(response.data?.data);
      
      generateMonthlyData(response.data?.data);
    } catch (error: any) {
      console.error("Error fetching instructor report:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // توليد بيانات شهرية من التقرير
  const generateMonthlyData = (reportData: InstructorReport | null) => {
    if (!reportData) return;
    
    const totalRevenue = reportData.profits || 0;
    const monthlyRevenue: any[] = [];
    
    for (let i = 0; i < 12; i++) {
      const growthFactor = 1 + (i * 0.08);
      const revenue = Math.round((totalRevenue / 12) * growthFactor * 100) / 100;
      
      monthlyRevenue.push({
        month: MONTHS[i],
        revenue: revenue,
        students: Math.round((reportData.students_count / 12) * growthFactor),
      });
    }
    
    setMonthlyData(monthlyRevenue);
  };

  // تحميل تقرير PDF
  const handleDownloadReport = async () => {
    const teacherId = user?.id;
    if (!teacherId) {
      toast.error("Teacher ID not found");
      return;
    }
    
    if (!fromDate || !toDate) {
      toast.error("Please select date range");
      return;
    }
    
    try {
      setDownloading(true);
      await teacherReportService.downloadReportPdf(teacherId, fromDate, toDate);
      toast.success("Report downloaded successfully");
      setReportDialogOpen(false);
    } catch (error: any) {
      console.error("Error downloading report:", error);
      toast.error(error.message || "Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchInstructorReport();
  }, [fetchInstructorReport]);

  // بيانات توزيع الكورسات
  const courseDistribution = report ? [
    { name: 'Online Courses', value: report.online_courses, color: '#3b82f6' },
    { name: 'Center Courses', value: report.center_courses, color: '#8b5cf6' },
  ] : [];

  // بيانات الأداء
  const performanceData = report ? [
    { name: 'Exams', value: report.exams_count, icon: FileQuestion, color: '#ef4444' },
    { name: 'Assignments', value: report.assignments_count, icon: FileText, color: '#f59e0b' },
    { name: 'Semesters', value: report.semesters_count, icon: Layers, color: '#06b6d4' },
    { name: 'Books', value: report.books_count, icon: BookMarked, color: '#84cc16' },
    { name: 'Coupons', value: report.used_coupons, icon: Ticket, color: '#ec4899' },
    { name: 'Requests', value: report.requests_count, icon: TrendingUp, color: '#f97316' },
  ] : [];

  // حساب الإجماليات
  const totalCourses = (report?.online_courses || 0) + (report?.center_courses || 0);
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const lastMonthRevenue = monthlyData[monthlyData.length - 1]?.revenue || 0;
  const previousMonthRevenue = monthlyData[monthlyData.length - 2]?.revenue || 0;
  const revenueGrowth = previousMonthRevenue === 0 ? 100 : Math.round(((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name || 'Instructor'} 👋`}
        description="Your courses are gaining momentum. Keep it up!"
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2 rounded-xl"
              onClick={() => setReportDialogOpen(true)}
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
         
          </div>
        }
      />

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label={t("myCourses")} 
          value={totalCourses.toString()} 
          delta={12} 
          icon={BookOpen} 
          variant="primary" 
        />
        <StatCard 
          label={t("students")} 
          value={report?.students_count?.toString() || "0"} 
          delta={14.2} 
          icon={Users} 
          variant="accent" 
        />
        <StatCard 
          label={t("earnings")} 
          value={`$${totalRevenue.toLocaleString()}`} 
          delta={revenueGrowth} 
          icon={DollarSign} 
          variant="warm" 
        />
        <StatCard 
          label={t("rating")} 
          value="4.9" 
          delta={0.2} 
          icon={Star} 
          variant="info" 
        />
      </div>

      {/* Secondary Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {performanceData.map((stat, idx) => (
          <Card key={stat.name} className="p-4 text-center hover:shadow-md transition-all">
            <div className={`h-10 w-10 rounded-xl mx-auto mb-2 flex items-center justify-center`} style={{ backgroundColor: `${stat.color}20` }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.name}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Earnings Chart */}
        <Card className="lg:col-span-2 rounded-2xl border-border p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t("earnings")}</h3>
              <p className="text-sm text-muted-foreground">Last 12 months</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <TrendingUp className="h-3.5 w-3.5" />
              +{revenueGrowth}% vs last month
            </div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="i-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#i-rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="p-2 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Monthly Avg</p>
              <p className="text-lg font-bold">${Math.round(totalRevenue / 12).toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Best Month</p>
              <p className="text-lg font-bold text-primary">
                {monthlyData.reduce((max, m) => m.revenue > max.revenue ? m : max, monthlyData[0])?.month}
              </p>
            </div>
          </div>
        </Card>

        {/* Course Distribution */}
        <Card className="rounded-2xl border-border p-6 shadow-soft">
          <h3 className="font-semibold">Course Distribution</h3>
          <p className="text-sm text-muted-foreground">Online vs Center</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={courseDistribution} 
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={50} 
                  outerRadius={80} 
                  paddingAngle={2}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {courseDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <p className="text-2xl font-bold text-blue-600">{report?.online_courses || 0}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <p className="text-2xl font-bold text-purple-600">{report?.center_courses || 0}</p>
              <p className="text-xs text-muted-foreground">Center</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Student Enrollment Trend */}
        <Card className="rounded-2xl border-border p-6 shadow-soft">
          <h3 className="font-semibold">Student Enrollment Trend</h3>
          <p className="text-sm text-muted-foreground">Last 6 months</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                <Bar dataKey="students" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="rounded-2xl border-border p-6 shadow-soft">
          <h3 className="font-semibold">Performance Metrics</h3>
          <p className="text-sm text-muted-foreground">Content & engagement</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {performanceData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="rounded-2xl border-border p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{t("recentActivity")}</h3>
          <Button variant="ghost" size="sm" className="gap-1" onClick={fetchInstructorReport}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <AvatarBadge initials={a.user?.split(" ").map((n: string) => n[0]).join("") || "U"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{a.user}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
              </li>
            ))
          ) : (
            <li className="text-center py-8 text-muted-foreground">
              No recent activity
            </li>
          )}
        </ul>
      </Card>

      {/* Download Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fromDate"
                  type="date"
                  className="pl-9"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="toDate"
                  type="date"
                  className="pl-9"
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
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownloadReport}
              disabled={downloading}
              className="gap-2"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}