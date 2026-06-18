/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from "@/contexts/AppContext";
import * as XLSX from 'xlsx';
import { 
  Users, BookOpen, DollarSign, GraduationCap, Sparkles, 
  FileQuestion, FileText, Layers, Ticket, BookMarked, Mail, RefreshCw,
  Trophy, Activity, BarChart3, PieChart as PieChartIcon,
  Crown, School, Library, FileSpreadsheet
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import api from '@/lib/api';
import { toast  } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

// ======================== الترجمة ========================
const translations: any = {
  en: {
    adminDashboard: "Admin Dashboard",
    dashboardSubtitle: "Welcome back. Here's what's happening on your platform today.",
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
    avgStudentsPerCourse: "Avg/Course",
    onlineVsCenter: "Online/Center",
    courseDistribution: "Course Distribution",
    onlineCourses: "Online",
    centerCourses: "Center",
    platformActivity: "Platform Activity",
    contentMetrics: "Content metrics",
    achievements: "Achievements",
    loading: "Loading dashboard...",
    error: "Error",
    tryAgain: "Please try again",
    exportExcel: "Export Excel",
    reportTitle: "Admin Report",
    generatedOn: "Generated on"
  },
  ar: {
    adminDashboard: "لوحة تحكم المدير",
    dashboardSubtitle: "مرحباً بعودتك. إليك ما يحدث على منصتك اليوم.",
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
    avgStudentsPerCourse: "متوسط/كورس",
    onlineVsCenter: "أونلاين/سنتر",
    courseDistribution: "توزيع الكورسات",
    onlineCourses: "أونلاين",
    centerCourses: "سنتر",
    platformActivity: "نشاط المنصة",
    contentMetrics: "مقاييس المحتوى",
    achievements: "الإنجازات",
    loading: "جاري تحميل لوحة التحكم...",
    error: "خطأ",
    tryAgain: "يرجى المحاولة مرة أخرى",
    exportExcel: "تصدير Excel",
    reportTitle: "تقرير المدير",
    generatedOn: "تم الإنشاء في"
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

export function AdminOverview() {
  const { dir, lang } = useApp();
  const isRTL = lang === 'ar' || dir === 'rtl';
  const hasFetched = useRef(false);
  const isFetching = useRef(false);

  const t = (key: string) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // جلب البيانات من الباك اند
  const fetchAdminReport = useCallback(async (showLoading = true) => {
    if (isFetching.current) return;
    
    try {
      isFetching.current = true;
      if (showLoading) setLoading(true);
      
      const response = await api.get('/admin/report');
      const fetchedData = response.data?.data;
      
      if (fetchedData) {
        setReport(fetchedData);
        hasFetched.current = true;
      } else {
        if (showLoading) toast.error(t("error") + ": No data received");
      }
    } catch (error: any) {
      console.error("Error fetching admin report:", error);
      if (showLoading) {
        toast.error(t("error") + ": " + (error.response?.data?.message || t("tryAgain")));
      }
    } finally {
      isFetching.current = false;
      if (showLoading) setLoading(false);
    }
  }, [t]);

  // طلب واحد بس عند تحميل الصفحة
  useEffect(() => {
    if (!hasFetched.current) {
      fetchAdminReport(true);
    }
  }, [fetchAdminReport]);

  // تحديث يدوي
  const handleRefresh = () => {
    if (!isFetching.current) {
      fetchAdminReport(true);
    }
  };

  // ========== تصدير Excel ==========
  const exportToExcel = () => {
    if (!report) {
      toast.error(lang === 'ar' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

    setExporting(true);
    
    try {
      const totalCourses = report.online_courses + report.center_courses;
      const date = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
      
      // Sheet 1: الأرقام الأساسية
      const mainData = [
        { [t('reportTitle')]: t('adminDashboard'), [t('generatedOn')]: date },
        {},
        { [lang === 'ar' ? 'المقياس' : 'Metric']: lang === 'ar' ? 'القيمة' : 'Value' },
        { [t('teachers')]: report.teachers_count },
        { [t('students')]: report.students_count },
        { [t('courses')]: totalCourses },
        { [t('revenue')]: `${report.profits} EGP` },
        { [t('exams')]: report.exams_count },
        { [t('books')]: report.books_count },
        { [t('coupons')]: report.used_coupons },
        { [t('requests')]: report.requests_count },
        {},
        { [lang === 'ar' ? 'تحليلات إضافية' : 'Additional Insights']: '' },
        { [t('onlineVsCenter')]: `${report.online_courses} / ${report.center_courses}` },
        { [t('avgStudentsPerCourse')]: totalCourses > 0 ? (report.students_count / totalCourses).toFixed(2) : 0 },
        { [t('completionRate')]: `${Math.min(100, report.exams_count * 10)}%` },
      ];
      
      // Sheet 2: توزيع الكورسات
      const distributionData = [
        { [lang === 'ar' ? 'نوع الكورس' : 'Course Type']: lang === 'ar' ? 'أونلاين' : 'Online', [lang === 'ar' ? 'العدد' : 'Count']: report.online_courses },
        { [lang === 'ar' ? 'نوع الكورس' : 'Course Type']: lang === 'ar' ? 'سنتر' : 'Center', [lang === 'ar' ? 'العدد' : 'Count']: report.center_courses },
      ];
      
      // Sheet 3: أداء المحتوى
      const contentData = [
        { [lang === 'ar' ? 'العنصر' : 'Item']: lang === 'ar' ? 'الاختبارات' : 'Exams', [lang === 'ar' ? 'العدد' : 'Count']: report.exams_count },
        { [lang === 'ar' ? 'العنصر' : 'Item']: lang === 'ar' ? 'الواجبات' : 'Assignments', [lang === 'ar' ? 'العدد' : 'Count']: report.assignments_count },
        { [lang === 'ar' ? 'العنصر' : 'Item']: lang === 'ar' ? 'الفصول الدراسية' : 'Semesters', [lang === 'ar' ? 'العدد' : 'Count']: report.semesters_count },
        { [lang === 'ar' ? 'العنصر' : 'Item']: lang === 'ar' ? 'الكتب' : 'Books', [lang === 'ar' ? 'العدد' : 'Count']: report.books_count },
        { [lang === 'ar' ? 'العنصر' : 'Item']: lang === 'ar' ? 'الكوبونات المستخدمة' : 'Used Coupons', [lang === 'ar' ? 'العدد' : 'Count']: report.used_coupons },
      ];
      
      // إنشاء Workbook
      const wb = XLSX.utils.book_new();
      
      // تحويل البيانات إلى Sheets
      const mainSheet = XLSX.utils.json_to_sheet(mainData, { skipHeader: true });
      const distributionSheet = XLSX.utils.json_to_sheet(distributionData);
      const contentSheet = XLSX.utils.json_to_sheet(contentData);
      
      // ضبط عرض الأعمدة
      mainSheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
      distributionSheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
      contentSheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
      
      // إضافة Sheets إلى Workbook
      XLSX.utils.book_append_sheet(wb, mainSheet, lang === 'ar' ? 'التقرير الرئيسي' : 'Main Report');
      XLSX.utils.book_append_sheet(wb, distributionSheet, lang === 'ar' ? 'توزيع الكورسات' : 'Course Distribution');
      XLSX.utils.book_append_sheet(wb, contentSheet, lang === 'ar' ? 'أداء المحتوى' : 'Content Performance');
      
      // تصدير الملف
      XLSX.writeFile(wb, `admin_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success(lang === 'ar' ? 'تم تصدير التقرير بنجاح' : 'Report exported successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء تصدير التقرير' : 'Error exporting report');
    } finally {
      setExporting(false);
    }
  };

  const totalCourses = (report?.online_courses || 0) + (report?.center_courses || 0);
  const totalRevenue = report?.profits || 0;
  
  const courseDistribution = [
    { name: t("onlineCourses"), value: report?.online_courses || 0, color: '#3b82f6' },
    { name: t("centerCourses"), value: report?.center_courses || 0, color: '#8b5cf6' },
  ];

  const performanceData = [
    { name: lang === 'ar' ? 'الاختبارات' : 'Exams', value: report?.exams_count || 0, color: '#ef4444', icon: FileQuestion },
    { name: lang === 'ar' ? 'الواجبات' : 'Assignments', value: report?.assignments_count || 0, color: '#f59e0b', icon: FileText },
    { name: lang === 'ar' ? 'الفصول' : 'Semesters', value: report?.semesters_count || 0, color: '#06b6d4', icon: Layers },
    { name: lang === 'ar' ? 'الكتب' : 'Books', value: report?.books_count || 0, color: '#84cc16', icon: BookMarked },
    { name: lang === 'ar' ? 'الكوبونات' : 'Coupons', value: report?.used_coupons || 0, color: '#ec4899', icon: Ticket },
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

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{t("error")}: No data available</p>
          <Button onClick={handleRefresh} className="mt-4">{t("refresh")}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        
        {/* الهيدر */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 p-6 backdrop-blur-sm">
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 p-2 shadow-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                  {t("adminDashboard")}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">{t("dashboardSubtitle")}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isFetching.current}
                className="gap-2 rounded-xl"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching.current ? 'animate-spin' : ''}`} />
                {t("refresh")}
              </Button>
              <Button 
                onClick={exportToExcel} 
                disabled={exporting}
                className="gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                {t("exportExcel")}
              </Button>
            </div>
          </div>
        </div>

        {/* المحتوى */}
        <div className="space-y-6">
          
          {/* البطاقات */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {[
              { label: t("teachers"), value: report.teachers_count, icon: GraduationCap, color: "from-blue-500 to-cyan-500" },
              { label: t("students"), value: report.students_count, icon: Users, color: "from-green-500 to-emerald-500" },
              { label: t("courses"), value: totalCourses, icon: BookOpen, color: "from-purple-500 to-pink-500" },
              { label: t("revenue"), value: `${totalRevenue.toLocaleString()} EGP`, icon: DollarSign, color: "from-orange-500 to-amber-500" },
              { label: t("exams"), value: report.exams_count, icon: FileQuestion, color: "from-red-500 to-rose-500" },
              { label: t("books"), value: report.books_count, icon: BookMarked, color: "from-teal-500 to-emerald-500" },
              { label: t("coupons"), value: report.used_coupons, icon: Ticket, color: "from-pink-500 to-rose-500" },
              { label: t("requests"), value: report.requests_count, icon: Mail, color: "from-amber-500 to-orange-500" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-xl bg-white dark:bg-slate-900 p-3 text-center shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r ${stat.color} shadow-md`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* الرسوم البيانية */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            
            <Card className="rounded-xl border-0 bg-white dark:bg-slate-900 shadow-md p-5">
              <h3 className={`font-semibold text-base flex items-center gap-2 mb-3 ${isRTL ? 'justify-end' : ''}`}>
                <PieChartIcon className="h-4 w-4 text-purple-500" />
                {t("courseDistribution")}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={courseDistribution} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3} label={!isRTL}>
                      {courseDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} align={isRTL ? "right" : "left"} verticalAlign="bottom" />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="rounded-xl border-0 bg-white dark:bg-slate-900 shadow-md p-5">
              <h3 className={`font-semibold text-base flex items-center gap-2 mb-4 ${isRTL ? 'justify-end' : ''}`}>
                <BarChart3 className="h-4 w-4 text-orange-500" />
                {t("platformActivity")}
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 10, right: 20, left: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} angle={isRTL ? 0 : -15} textAnchor="end" height={50} interval={0} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40} label={{ position: 'top', fontSize: 11 }}>
                      {performanceData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* الصف الثاني */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            
            <Card className="rounded-xl border-0 bg-white dark:bg-slate-900 shadow-md p-5">
              <h3 className={`font-semibold text-base flex items-center gap-2 mb-4 ${isRTL ? 'justify-end' : ''}`}>
                <Activity className="h-4 w-4 text-indigo-500" />
                {t("contentMetrics")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {performanceData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                      <item.icon className="h-4 w-4" style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{item.value}</p>
                      <p className="text-[10px] text-muted-foreground">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-xl border-0 bg-white dark:bg-slate-900 shadow-md p-5">
              <h3 className={`font-semibold text-base flex items-center gap-2 mb-4 ${isRTL ? 'justify-end' : ''}`}>
                <Trophy className="h-4 w-4 text-yellow-500" />
                {t("achievements")}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-3 text-center">
                  <School className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xl font-bold">{report.teachers_count}</p>
                  <p className="text-[10px] text-muted-foreground">{t("teachers")}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-3 text-center">
                  <Library className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xl font-bold">{report.books_count}</p>
                  <p className="text-[10px] text-muted-foreground">{t("books")}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-3 text-center">
                  <FileQuestion className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <p className="text-xl font-bold">{report.exams_count}</p>
                  <p className="text-[10px] text-muted-foreground">{t("exams")}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-3 text-center">
                  <Ticket className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-xl font-bold">{report.used_coupons}</p>
                  <p className="text-[10px] text-muted-foreground">{t("coupons")}</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs">{t("completionRate")}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (report.exams_count || 0) * 10)}%` }} />
                    </div>
                    <span className="text-xs font-semibold">{Math.min(100, (report.exams_count || 0) * 10)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs">{t("avgStudentsPerCourse")}</span>
                  <span className="text-xs font-semibold">{totalCourses > 0 ? Math.round(report.students_count / totalCourses) : 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs">{t("onlineVsCenter")}</span>
                  <span className="text-xs font-semibold">{report.online_courses} / {report.center_courses}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}