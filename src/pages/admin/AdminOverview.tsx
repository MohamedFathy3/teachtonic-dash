/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { AvatarBadge } from "@/components/lms/AvatarBadge";
import { 
  Users, BookOpen, DollarSign, GraduationCap, TrendingUp, Sparkles, 
  FileQuestion, FileText, Layers, Ticket, BookMarked, Mail, RefreshCw,
  Trophy, Award, Zap, Clock, Target, Globe2, Building2, CheckCircle,
  XCircle, Activity, BarChart3, PieChart as PieChartIcon, Calendar,
  ArrowUpRight, ArrowDownRight, Eye, UserPlus, CreditCard, Crown, Gem, Rocket,
  Server, Database, Cloud, Shield, Download, Upload, Bell, Settings, School, Library
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, 
  Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend, Line, LineChart,
  RadialBarChart, RadialBar
} from "recharts";
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// ======================== الترجمة ========================
const translations: any = {
  en: {
    adminDashboard: "Admin Dashboard",
    dashboardSubtitle: "Welcome back. Here's what's happening on your platform today.",
    generateReport: "Generate Report",
    refresh: "Refresh",
    teachers: "Teachers",
    students: "Students", 
    courses: "Courses",
    revenue: "Revenue",
    exams: "Exams",
    books: "Books",
    coupons: "Coupons",
    requests: "Requests",
    completionRate: "Completion Rate",
    engagementRate: "Engagement Rate",
    onlineVsCenter: "Online/Center",
    avgStudentsPerCourse: "Avg/Course",
    profitMargin: "Profit Margin",
    revenueOverview: "Revenue Overview",
    last12Months: "Last 12 months",
    vsLastMonth: "vs last month",
    monthlyAverage: "Monthly average",
    bestMonth: "Best month",
    totalRevenue: "Total Revenue",
    courseDistribution: "Course Distribution",
    onlineCourses: "Online",
    centerCourses: "Center",
    platformActivity: "Platform Activity",
    contentMetrics: "Content metrics",
    enrollmentTrend: "Enrollment Trend",
    last6Months: "Last 6 months",
    totalEnrolled: "Total Enrolled",
    growthRate: "Growth Rate",
    latestUpdates: "Latest Updates",
    viewAll: "View All",
    loading: "Loading dashboard...",
    error: "Error",
    tryAgain: "Please try again",
    active: "Active",
    inactive: "Inactive",
    totalCourses: "Total Courses",
    totalStudents: "Total Students",
    weeklyActivity: "Weekly Activity",
    performanceScore: "Performance Score",
    studentSatisfaction: "Student Satisfaction",
    courseCompletion: "Course Completion",
    achievements: "Achievements",
    topPerformers: "Top Performers",
    insights: "Insights",
    noData: "No data available",
    totalTeachers: "Total Teachers",
    totalExams: "Total Exams",
    totalBooks: "Total Books",
    usedCoupons: "Used Coupons",
    pendingRequests: "Pending Requests",
    semesters: "Semesters"
  },
  ar: {
    adminDashboard: "لوحة تحكم المدير",
    dashboardSubtitle: "مرحباً بعودتك. إليك ما يحدث على منصتك اليوم.",
    generateReport: "إنشاء تقرير",
    refresh: "تحديث",
    teachers: "المعلمون",
    students: "الطلاب",
    courses: "الكورسات",
    revenue: "الإيرادات",
    exams: "الاختبارات",
    books: "الكتب",
    coupons: "الكوبونات",
    requests: "الطلبات",
    completionRate: "نسبة الإكمال",
    engagementRate: "نسبة التفاعل",
    onlineVsCenter: "أونلاين/سنتر",
    avgStudentsPerCourse: "متوسط/كورس",
    profitMargin: "هامش الربح",
    revenueOverview: "نظرة عامة على الإيرادات",
    last12Months: "آخر 12 شهراً",
    vsLastMonth: "مقابل الشهر الماضي",
    monthlyAverage: "المتوسط الشهري",
    bestMonth: "أفضل شهر",
    totalRevenue: "إجمالي الإيرادات",
    courseDistribution: "توزيع الكورسات",
    onlineCourses: "أونلاين",
    centerCourses: "سنتر",
    platformActivity: "نشاط المنصة",
    contentMetrics: "مقاييس المحتوى",
    enrollmentTrend: "اتجاه التسجيل",
    last6Months: "آخر 6 أشهر",
    totalEnrolled: "إجمالي المسجلين",
    growthRate: "معدل النمو",
    latestUpdates: "آخر التحديثات",
    viewAll: "عرض الكل",
    loading: "جاري تحميل لوحة التحكم...",
    error: "خطأ",
    tryAgain: "يرجى المحاولة مرة أخرى",
    active: "نشط",
    inactive: "غير نشط",
    totalCourses: "إجمالي الكورسات",
    totalStudents: "إجمالي الطلاب",
    weeklyActivity: "النشاط الأسبوعي",
    performanceScore: "درجة الأداء",
    studentSatisfaction: "رضا الطلاب",
    courseCompletion: "إكمال الكورس",
    achievements: "الإنجازات",
    topPerformers: "الأفضل أداءً",
    insights: "رؤى وتحليلات",
    noData: "لا توجد بيانات متاحة",
    totalTeachers: "إجمالي المعلمين",
    totalExams: "إجمالي الاختبارات",
    totalBooks: "إجمالي الكتب",
    usedCoupons: "الكوبونات المستخدمة",
    pendingRequests: "الطلبات المعلقة",
    semesters: "الفصول الدراسية"
  }
};

interface AdminReport {
  teachers_count: number;
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

export function AdminOverview() {
  const { dir, lang } = useApp();
  const t = (key: string) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };
  
  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const fetchAdminReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/report');
      setReport(response.data?.data);
    } catch (error: any) {
      console.error("Error fetching admin report:", error);
      toast.error(t("error") + ": " + (error.response?.data?.message || t("tryAgain")));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminReport();
  }, [fetchAdminReport]);

  const totalCourses = (report?.online_courses || 0) + (report?.center_courses || 0);
  const totalRevenue = report?.profits || 0;
  
  // بيانات الرسم البياني لتوزيع الكورسات - من البيانات الحقيقية
  const courseDistribution = [
    { name: t("onlineCourses"), value: report?.online_courses || 0, color: '#3b82f6' },
    { name: t("centerCourses"), value: report?.center_courses || 0, color: '#8b5cf6' },
  ];

  // بيانات الأداء - من البيانات الحقيقية
  const performanceData = [
    { name: t("exams"), value: report?.exams_count || 0, color: '#ef4444', icon: FileQuestion },
    { name: t("assignments"), value: report?.assignments_count || 0, color: '#f59e0b', icon: FileText },
    { name: t("semesters"), value: report?.semesters_count || 0, color: '#06b6d4', icon: Layers },
    { name: t("books"), value: report?.books_count || 0, color: '#84cc16', icon: BookMarked },
    { name: t("coupons"), value: report?.used_coupons || 0, color: '#ec4899', icon: Ticket },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        
        {/* ==================== HEADER ==================== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 p-6 backdrop-blur-sm">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 p-2 shadow-lg">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
                    {t("adminDashboard")}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">{t("dashboardSubtitle")}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchAdminReport} className="gap-2 rounded-xl border-2 hover:border-indigo-500/50 transition-all">
                <RefreshCw className="h-4 w-4" />
                {t("refresh")}
              </Button>
              <Button className="gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300">
                <Sparkles className="h-4 w-4" />
                {t("generateReport")}
              </Button>
            </div>
          </div>
        </div>

        {/* ==================== STATS CARDS - 8 CARDS ==================== */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { label: t("teachers"), value: report?.teachers_count || 0, icon: GraduationCap, gradient: "from-blue-500 to-cyan-500", bg: "from-blue-500/20 to-cyan-500/10" },
            { label: t("students"), value: report?.students_count || 0, icon: Users, gradient: "from-green-500 to-emerald-500", bg: "from-green-500/20 to-emerald-500/10" },
            { label: t("courses"), value: totalCourses, icon: BookOpen, gradient: "from-purple-500 to-pink-500", bg: "from-purple-500/20 to-pink-500/10" },
            { label: t("revenue"), value: `${totalRevenue.toLocaleString()} EGP`, icon: DollarSign, gradient: "from-orange-500 to-amber-500", bg: "from-orange-500/20 to-amber-500/10" },
            { label: t("exams"), value: report?.exams_count || 0, icon: FileQuestion, gradient: "from-red-500 to-rose-500", bg: "from-red-500/20 to-rose-500/10" },
            { label: t("books"), value: report?.books_count || 0, icon: BookMarked, gradient: "from-teal-500 to-emerald-500", bg: "from-teal-500/20 to-emerald-500/10" },
            { label: t("coupons"), value: report?.used_coupons || 0, icon: Ticket, gradient: "from-pink-500 to-rose-500", bg: "from-pink-500/20 to-rose-500/10" },
            { label: t("requests"), value: report?.requests_count || 0, icon: Mail, gradient: "from-amber-500 to-orange-500", bg: "from-amber-500/20 to-orange-500/10" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ y: -4 }}
              className={`rounded-xl bg-gradient-to-br ${stat.bg} p-3 text-center shadow-md hover:shadow-lg transition-all duration-300`}
            >
              <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r ${stat.gradient} shadow-md`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ==================== MAIN CHARTS ROW ==================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Course Distribution Pie Chart */}
          <Card className="overflow-hidden rounded-xl border-0 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="p-5">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-3">
                <PieChartIcon className="h-4 w-4 text-purple-500" />
                {t("courseDistribution")}
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={courseDistribution} dataKey="value" innerRadius={45} outerRadius={65} paddingAngle={3}>
                      {courseDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="rounded-lg bg-blue-500/10 p-2 text-center">
                  <p className="text-xl font-bold text-blue-600">{report?.online_courses || 0}</p>
                  <p className="text-[10px] text-muted-foreground">{t("onlineCourses")}</p>
                </div>
                <div className="rounded-lg bg-purple-500/10 p-2 text-center">
                  <p className="text-xl font-bold text-purple-600">{report?.center_courses || 0}</p>
                  <p className="text-[10px] text-muted-foreground">{t("centerCourses")}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance Bar Chart */}
          <Card className="overflow-hidden rounded-xl border-0 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="p-5">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-orange-500" />
                {t("platformActivity")}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={dir === 'rtl' ? 80 : 65} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", fontSize: "11px" }} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {performanceData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Quick Stats Summary */}
          <Card className="overflow-hidden rounded-xl border-0 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="p-5">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-emerald-500" />
                {t("insights")}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs">{t("completionRate")}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (report?.exams_count || 0) * 10)}%` }} />
                    </div>
                    <span className="text-xs font-semibold">{Math.min(100, (report?.exams_count || 0) * 10)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs">{t("avgStudentsPerCourse")}</span>
                  <span className="text-xs font-semibold">{totalCourses > 0 ? Math.round((report?.students_count || 0) / totalCourses) : 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs">{t("onlineVsCenter")}</span>
                  <span className="text-xs font-semibold">{report?.online_courses || 0} / {report?.center_courses || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs">{t("profitMargin")}</span>
                  <span className="text-xs font-semibold text-emerald-600">0%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ==================== SECOND ROW ==================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Performance Metrics Grid */}
          <Card className="overflow-hidden rounded-xl border-0 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="p-5">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-indigo-500" />
                {t("contentMetrics")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {performanceData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                      <item.icon className="h-4 w-4" style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{item.value}</p>
                      <p className="text-[10px] text-muted-foreground">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Summary Stats */}
          <Card className="overflow-hidden rounded-xl border-0 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="p-5">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                <Trophy className="h-4 w-4 text-yellow-500" />
                {t("achievements")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-3 text-center">
                  <School className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xl font-bold">{report?.teachers_count || 0}</p>
                  <p className="text-[10px] text-muted-foreground">{t("teachers")}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-3 text-center">
                  <Library className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xl font-bold">{report?.books_count || 0}</p>
                  <p className="text-[10px] text-muted-foreground">{t("books")}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-3 text-center">
                  <FileQuestion className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <p className="text-xl font-bold">{report?.exams_count || 0}</p>
                  <p className="text-[10px] text-muted-foreground">{t("exams")}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-3 text-center">
                  <Ticket className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-xl font-bold">{report?.used_coupons || 0}</p>
                  <p className="text-[10px] text-muted-foreground">{t("coupons")}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

    
      </div>
    </div>
  );
}