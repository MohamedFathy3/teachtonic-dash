/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/instructor/InstructorDashboard.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, Users, DollarSign, Star, Sparkles, Loader2, 
  TrendingUp, FileQuestion, FileText, Layers, Ticket, 
  BookMarked, Download, Calendar, RefreshCw, Trophy,
  Award, Target, Zap, BarChart3, PieChart as PieChartIcon, 
  Activity, Globe, Crown, Gem, Medal, Flame, Gift,
  Wallet, School, MonitorPlay, ArrowUpRight, ArrowDownRight,
  ChartLine, ChartPie, Gauge, Database, BadgeDollarSign,
  CheckCircle2, HelpCircle, Building2,
  GraduationCap, MapPin, UsersRound, BarChart4, PieChart as PieChartIcon2,
  CircleDollarSign, CalendarDays, ChartNoAxesCombined, ListChecks
} from "lucide-react";
import { 
  Area, AreaChart, CartesianGrid, ResponsiveContainer, 
  Tooltip, XAxis, YAxis, Cell, Pie, PieChart, Legend,
  BarChart, Bar, LineChart, Line, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart
} from "recharts";
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { teacherReportService } from '@/services/teacher-report.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

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
  students_per_month?: Array<{ year: number; month: number; total: number; media?: any[] }>;
  students_by_governorate?: Array<{ governorate: string; total: number; media?: any[] }>;
  students_by_region?: Array<{ region: string; total: number; media?: any[] }>;
  students_by_gender?: Array<{ gender: string; total: number; media?: any[] }>;
  students_by_stage?: Array<{ id: number; name: string; total: number; media?: any[] }>;
  last_month_subscriptions?: { course: number; semester: number; lesson: number };
}

// ترجمة المحافظات الكاملة
const governorateNames: Record<string, { ar: string; en: string }> = {
  cairo: { ar: "القاهرة", en: "Cairo" },
  alexandria: { ar: "الإسكندرية", en: "Alexandria" },
  giza: { ar: "الجيزة", en: "Giza" },
  sharqia: { ar: "الشرقية", en: "Sharqia" },
  dakahlia: { ar: "الدقهلية", en: "Dakahlia" },
  beheira: { ar: "البحيرة", en: "Beheira" },
  qalyubia: { ar: "القليوبية", en: "Qalyubia" },
  monufia: { ar: "المنوفية", en: "Monufia" },
  gharbia: { ar: "الغربية", en: "Gharbia" },
  sohag: { ar: "سوهاج", en: "Sohag" },
  asyut: { ar: "أسيوط", en: "Asyut" },
  minya: { ar: "المنيا", en: "Minya" },
  qena: { ar: "قنا", en: "Qena" },
  luxor: { ar: "الأقصر", en: "Luxor" },
  aswan: { ar: "أسوان", en: "Aswan" },
  port_said: { ar: "بورسعيد", en: "Port Said" },
  suez: { ar: "السويس", en: "Suez" },
  ismailia: { ar: "الإسماعيلية", en: "Ismailia" },
  damietta: { ar: "دمياط", en: "Damietta" },
  north_sinai: { ar: "شمال سيناء", en: "North Sinai" },
  south_sinai: { ar: "جنوب سيناء", en: "South Sinai" },
  red_sea: { ar: "البحر الأحمر", en: "Red Sea" },
  new_valley: { ar: "الوادي الجديد", en: "New Valley" },
  faiyum: { ar: "الفيوم", en: "Faiyum" },
  beni_suef: { ar: "بني سويف", en: "Beni Suef" },
  kafr_el_sheikh: { ar: "كفر الشيخ", en: "Kafr El Sheikh" },
  matrouh: { ar: "مطروح", en: "Matrouh" },
};

// ترجمة المناطق
const regionNames: Record<string, { ar: string; en: string }> = {
  // القاهرة
  "Nasr City": { ar: "مدينة نصر", en: "Nasr City" },
  "Maadi": { ar: "المعادي", en: "Maadi" },
  "Heliopolis": { ar: "مصر الجديدة", en: "Heliopolis" },
  "Downtown": { ar: "وسط البلد", en: "Downtown" },
  "Mohandessin": { ar: "المهندسين", en: "Mohandessin" },
  "Zamalek": { ar: "الزمالك", en: "Zamalek" },
  "Abbassia": { ar: "العباسية", en: "Abbassia" },
  "Shubra": { ar: "شبرا", en: "Shubra" },
  
  // الجيزة
  "October": { ar: "السادس من أكتوبر", en: "October 6" },
  "Sheikh Zayed": { ar: "الشيخ زايد", en: "Sheikh Zayed" },
  "Dokki": { ar: "الدقي", en: "Dokki" },
  "Agouza": { ar: "العجوزة", en: "Agouza" },
  "Haram": { ar: "الهرم", en: "Haram" },
  
  // الإسكندرية
  "Borg El Arab": { ar: "برج العرب", en: "Borg El Arab" },
  "Smouha": { ar: "سموحة", en: "Smouha" },
  "Alexandria": { ar: "الإسكندرية", en: "Alexandria" },
  "Montaza": { ar: "المنتزة", en: "Montaza" },
  "Sidi Gaber": { ar: "سيدي جابر", en: "Sidi Gaber" },
  
  // الدقهلية
  "Mansoura": { ar: "المنصورة", en: "Mansoura" },
  
  // الغربية
  "Tanta": { ar: "طنطا", en: "Tanta" },
  
  // أخرى
  "Cairo": { ar: "القاهرة", en: "Cairo" },
  "Giza": { ar: "الجيزة", en: "Giza" },
};

const MONTHS_EG = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function InstructorDashboard() {
  const { t: tOriginal, user, dir, lang } = useApp();
  const navigate = useNavigate();
  
  // دالة الترجمة
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        welcomeBack: "مرحباً بعودتك",
        dashboardSubtitle: "تابع أدائك وأدر كورساتك",
        myCourses: "كورساتي",
        students: "الطلاب",
        earnings: "الأرباح",
        exams: "الامتحانات",
        books: "الكتب",
        semesters: "الفصول الدراسية",
        onlineCourses: "أونلاين",
        centerCourses: "سنتر",
        totalCourses: "إجمالي الكورسات",
        totalStudents: "إجمالي الطلاب",
        totalRevenue: "إجمالي الأرباح",
        completionRate: "نسبة الإنجاز",
        engagementRate: "نسبة التفاعل",
        revenueOverview: "نظرة عامة على الأرباح",
        courseDistribution: "توزيع الكورسات",
        platformActivity: "نشاط المنصة",
        refresh: "تحديث",
        downloadReport: "تحميل التقرير",
        fromDate: "من تاريخ",
        toDate: "إلى تاريخ",
        cancel: "إلغاء",
        downloading: "جاري التحميل...",
        downloadPDF: "تحميل PDF",
        error: "خطأ",
        tryAgain: "حاول مرة أخرى",
        pleaseSelectDates: "الرجاء تحديد نطاق التواريخ",
        reportDownloaded: "تم تحميل التقرير بنجاح",
        loading: "جاري تحميل لوحة التحكم...",
        overview: "نظرة عامة",
        analytics: "تحليلات",
        performance: "الأداء",
        newCourse: "كورس جديد",
        createExam: "إنشاء امتحان",
        inviteStudents: "دعوة طلاب",
        createCoupon: "إنشاء كود",
        online: "أونلاين",
        center: "سنتر",
        examsTaken: "الامتحانات المأخوذة",
        assignments: "الواجبات",
        male: "ذكر",
        female: "أنثى",
        studentGrowth: "نمو الطلاب",
        studentsByGender: "الطلاب حسب النوع",
        studentsByGovernorate: "🏛️ توزيع الطلاب حسب المحافظات",
        studentsByRegion: "📍 توزيع الطلاب حسب المناطق",
        performanceRadar: "رادار الأداء",
        progressMetrics: "مقاييس التقدم",
        monthlyTrends: "الاتجاهات الشهرية",
        detailedStats: "إحصائيات مفصلة",
        achievements: "الإنجازات",
        earningsSummary: "ملخص الأرباح",
        lifetimeEarnings: "إجمالي الأرباح مدى الحياة",
        activeCourses: "الكورسات النشطة",
        avgPerCourse: "متوسط لكل كورس",
        efficiencyScore: "نسبة الكفاءة",
        studentGrowth2: "نمو الطلاب",
        overallRating: "تقييم الأداء العام",
        topCreator: "أفضل منشئ",
        popularMentor: "مرشد شعبي",
        examMaster: "خبير امتحانات",
        risingStar: "نجم صاعد",
        reqCourses: "10+ كورسات",
        reqStudents: "50+ طالب",
        reqExams: "20+ امتحان",
        reqActive: "نشط لمدة 30 يوم",
        lastUpdated: "آخر تحديث: اليوم",
        performanceInsights: "رؤى الأداء",
        noDataAvailable: "لا توجد بيانات متاحة حالياً",
        governorate: "المحافظة",
        numberOfStudents: "عدد الطلاب",
        totalGovernorates: "عدد المحافظات",
        governorateDistribution: "توزيع الطلاب حسب المحافظات",
        topGovernorate: "🏆 أعلى محافظة",
        ofTotalStudents: "من إجمالي الطلاب",
        avgStudentsPerGovernorate: "📊 متوسط الطلاب لكل محافظة",
        governoratesList: "📋 قائمة المحافظات",
        eachColorRepresents: "🎨 كل لون يمثل محافظة",
        sortedDescending: "📈 مرتبة تنازلياً حسب عدد الطلاب",
        geographicalDistribution: "توزيع جغرافي للطلاب على مستوى المحافظات",
        realData: "بيانات حقيقية",
        region: "المنطقة",
        numberOfStudentsInRegion: "عدد الطلاب في المنطقة",
        totalRegions: "عدد المناطق",
        topRegion: "🏆 أعلى منطقة",
        regionsList: "📋 قائمة المناطق",
        regionDistribution: "توزيع الطلاب حسب المناطق",
        avgStudentsPerRegion: "📊 متوسط الطلاب لكل منطقة",
      },
      en: {
        welcomeBack: "Welcome back",
        dashboardSubtitle: "Track your performance and manage your courses",
        myCourses: "My Courses",
        students: "Students",
        earnings: "Earnings",
        exams: "Exams",
        books: "Books",
        semesters: "Semesters",
        onlineCourses: "Online",
        centerCourses: "Center",
        totalCourses: "Total Courses",
        totalStudents: "Total Students",
        totalRevenue: "Total Revenue",
        completionRate: "Completion Rate",
        engagementRate: "Engagement Rate",
        revenueOverview: "Revenue Overview",
        courseDistribution: "Course Distribution",
        platformActivity: "Platform Activity",
        refresh: "Refresh",
        downloadReport: "Download Report",
        fromDate: "From Date",
        toDate: "To Date",
        cancel: "Cancel",
        downloading: "Downloading...",
        downloadPDF: "Download PDF",
        error: "Error",
        tryAgain: "Try again",
        pleaseSelectDates: "Please select date range",
        reportDownloaded: "Report downloaded successfully",
        loading: "Loading dashboard...",
        overview: "Overview",
        analytics: "Analytics",
        performance: "Performance",
        newCourse: "New Course",
        createExam: "Create Exam",
        inviteStudents: "Invite Students",
        createCoupon: "Create Code",
        online: "Online",
        center: "Center",
        examsTaken: "Exams Taken",
        assignments: "Assignments",
        male: "Male",
        female: "Female",
        studentGrowth: "Student Growth",
        studentsByGender: "Students by Gender",
        studentsByGovernorate: "🏛️ Students by Governorate",
        studentsByRegion: "📍 Students by Region",
        performanceRadar: "Performance Radar",
        progressMetrics: "Progress Metrics",
        monthlyTrends: "Monthly Trends",
        detailedStats: "Detailed Statistics",
        achievements: "Achievements",
        earningsSummary: "Earnings Summary",
        lifetimeEarnings: "Total Lifetime Earnings",
        activeCourses: "Active Courses",
        avgPerCourse: "Avg per Course",
        efficiencyScore: "Efficiency Score",
        studentGrowth2: "Student Growth",
        overallRating: "Overall Performance Rating",
        topCreator: "Top Creator",
        popularMentor: "Popular Mentor",
        examMaster: "Exam Master",
        risingStar: "Rising Star",
        reqCourses: "10+ Courses",
        reqStudents: "50+ Students",
        reqExams: "20+ Exams",
        reqActive: "Active for 30 days",
        lastUpdated: "Last updated: Today",
        performanceInsights: "Performance Insights",
        noDataAvailable: "No data available",
        governorate: "Governorate",
        numberOfStudents: "Number of Students",
        totalGovernorates: "Total Governorates",
        governorateDistribution: "Student Distribution by Governorate",
        topGovernorate: "🏆 Top Governorate",
        ofTotalStudents: "of total students",
        avgStudentsPerGovernorate: "📊 Avg students per governorate",
        governoratesList: "📋 Governorates List",
        eachColorRepresents: "🎨 Each color represents a governorate",
        sortedDescending: "📈 Sorted descending by student count",
        geographicalDistribution: "Geographical distribution of students across governorates",
        realData: "Real Data",
        region: "Region",
        numberOfStudentsInRegion: "Number of Students in Region",
        totalRegions: "Total Regions",
        topRegion: "🏆 Top Region",
        regionsList: "📋 Regions List",
        regionDistribution: "Student Distribution by Region",
        avgStudentsPerRegion: "📊 Avg students per region",
      }
    };
    
    const langCode = lang === 'ar' ? 'ar' : 'en';
    return translations[langCode][key] || tOriginal(key) || key;
  };
  
  const [report, setReport] = useState<InstructorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [downloading, setDownloading] = useState(false);
  const [greeting, setGreeting] = useState("");
  
  const fetchedRef = useRef(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (lang === 'ar') {
      if (hour < 12) setGreeting("صباح الخير");
      else if (hour < 18) setGreeting("مساء الخير");
      else setGreeting("مساء الخير");
    } else {
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 18) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    }
  }, [lang]);

  const fetchInstructorReport = useCallback(async () => {
    try {
      setLoading(true);
      const teacherId = user?.id;
      if (!teacherId) return;
      const response = await api.get(`/teachers/${teacherId}/report`);
      console.log("📊 Report data:", response.data?.data);
      setReport(response.data?.data);
    } catch (error: any) {
      console.error("Error fetching report:", error);
      toast.error(t("error") + ": " + (error.message || t("tryAgain")));
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    if (!fetchedRef.current && user?.id) {
      fetchedRef.current = true;
      fetchInstructorReport();
    }
  }, [user?.id, fetchInstructorReport]);

  const handleDownloadReport = async () => {
    const teacherId = user?.id;
    if (!teacherId || !fromDate || !toDate) {
      toast.error(t("pleaseSelectDates"));
      return;
    }
    try {
      setDownloading(true);
      await teacherReportService.downloadReportPdf(teacherId, fromDate, toDate);
      toast.success(t("reportDownloaded"));
      setReportDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || t("error"));
    } finally {
      setDownloading(false);
    }
  };

  // حساب البيانات الأساسية
  const totalCourses = (report?.online_courses || 0) + (report?.center_courses || 0);
  const totalRevenue = report?.profits || 0;
  
  const completionRate = report?.students_count && report?.students_count > 0 
    ? Math.min(100, Math.round(((report?.exams_count || 0) / (report?.students_count || 1)) * 100))
    : 0;
  
  const engagementRate = report?.students_count && report?.students_count > 0
    ? Math.min(100, Math.round((((report?.exams_count || 0) + (report?.assignments_count || 0)) / (report?.students_count || 1)) * 100))
    : 0;

  // بيانات الرسم البياني الشهري
  const monthlyData = (lang === 'ar' ? MONTHS_EG : MONTHS_EN).map((month, i) => {
    const currentMonth = i + 1;
    const studentData = report?.students_per_month?.find(s => s.month === currentMonth);
    const studentValue = studentData?.total || 0;
    
    return {
      month,
      students: studentValue,
      revenue: totalRevenue > 0 ? Math.round(totalRevenue / 12) : 0,
    };
  });

  const courseDistribution = [
    { name: t("online"), value: report?.online_courses || 0, color: '#3b82f6' },
    { name: t("center"), value: report?.center_courses || 0, color: '#8b5cf6' },
  ];

  // بيانات الأداء
  const performanceData = [
    { name: t("exams"), value: report?.exams_count || 0, color: '#ef4444', icon: FileQuestion, bg: 'bg-red-500/10', text: 'text-red-500' },
    { name: t("assignments"), value: report?.assignments_count || 0, color: '#f59e0b', icon: FileText, bg: 'bg-amber-500/10', text: 'text-amber-500' },
    { name: t("semesters"), value: report?.semesters_count || 0, color: '#06b6d4', icon: Layers, bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
    { name: t("books"), value: report?.books_count || 0, color: '#84cc16', icon: BookMarked, bg: 'bg-lime-500/10', text: 'text-lime-500' },
    { name: "الكوبونات", value: report?.used_coupons || 0, color: '#ec4899', icon: Ticket, bg: 'bg-pink-500/10', text: 'text-pink-500' },
    { name: "الطلبات", value: report?.requests_count || 0, color: '#f97316', icon: HelpCircle, bg: 'bg-orange-500/10', text: 'text-orange-500' },
  ];

  // بيانات الرادار
  const radarData = [
    { subject: t("myCourses"), A: Math.min(100, (totalCourses / 20) * 100), fullMark: 100 },
    { subject: t("students"), A: Math.min(100, (report?.students_count || 0) / 100 * 100), fullMark: 100 },
    { subject: t("exams"), A: Math.min(100, (report?.exams_count || 0) / 50 * 100), fullMark: 100 },
    { subject: t("books"), A: Math.min(100, (report?.books_count || 0) / 20 * 100), fullMark: 100 },
    { subject: t("semesters"), A: Math.min(100, (report?.semesters_count || 0) / 10 * 100), fullMark: 100 },
  ];

  // بيانات نمو الطلاب
  const studentGrowthData = (lang === 'ar' ? MONTHS_EG : MONTHS_EN).map((month, i) => ({
    month,
    students: report?.students_per_month?.find(s => s.month === i + 1)?.total || 0,
  }));

  // بيانات النوع
  const genderData = (report?.students_by_gender?.map(g => ({
    name: g.gender === 'male' ? t("male") : t("female"),
    value: g.total,
    color: g.gender === 'male' ? '#3b82f6' : '#ec4899'
  })) || []).filter(g => g.value > 0);

  // ✅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ معالجة بيانات المحافظات (GOVERNORATES)
  // ✅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const governorateDataFromAPI = report?.students_by_governorate || [];
  
  const governorateData = governorateDataFromAPI
    .filter(g => g.total > 0)
    .map(g => ({
      name: lang === 'ar' 
        ? (governorateNames[g.governorate.toLowerCase()]?.ar || g.governorate)
        : (governorateNames[g.governorate.toLowerCase()]?.en || g.governorate),
      value: g.total,
      originalName: g.governorate,
      key: g.governorate,
    }))
    .sort((a, b) => b.value - a.value);
  
  const hasGovernorateData = governorateData.length > 0;
  const totalGovernorateStudents = governorateData.reduce((sum, g) => sum + g.value, 0);
  
  console.log("✅ Governorates loaded:", {
    count: governorateData.length,
    totalStudents: totalGovernorateStudents,
    topGovernorate: governorateData[0]?.name,
    data: governorateData,
  });

  // ✅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ معالجة بيانات المناطق (REGIONS)
  // ✅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const regionDataFromAPI = report?.students_by_region || [];
  
  const regionData = regionDataFromAPI
    .filter(r => r.total > 0)
    .map(r => {
      const regionKey = r.region?.toLowerCase() || '';
      return {
        name: lang === 'ar' 
          ? (regionNames[regionKey]?.ar || r.region)
          : (regionNames[regionKey]?.en || r.region),
        value: r.total,
        originalName: r.region,
        key: r.region,
      };
    })
    .sort((a, b) => b.value - a.value);
  
  const hasRegionData = regionData.length > 0;
  const totalRegionStudents = regionData.reduce((sum, r) => sum + r.value, 0);
  
  console.log("✅ Regions loaded:", {
    count: regionData.length,
    totalStudents: totalRegionStudents,
    topRegion: regionData[0]?.name,
    data: regionData,
  });
  
  // بيانات المراحل الدراسية
  const stageData = report?.students_by_stage?.map(s => ({
    name: s.name,
    value: s.total,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  })) || [];

  // QUICK ACTIONS
  const QUICK_ACTIONS = [
    { 
      icon: BookOpen, 
      label: t("newCourse"), 
      color: "from-blue-500 to-cyan-500", 
      bg: "bg-blue-50 dark:bg-blue-950/20",
      onClick: () => navigate('/instructor/my-courses')
    },
    { 
      icon: FileQuestion, 
      label: t("createExam"), 
      color: "from-red-500 to-rose-500", 
      bg: "bg-red-50 dark:bg-red-950/20",
      onClick: () => navigate('/instructor/exams')
    },
    { 
      icon: Users, 
      label: t("inviteStudents"), 
      color: "from-green-500 to-emerald-500", 
      bg: "bg-green-50 dark:bg-green-950/20",
      onClick: () => navigate('/instructor/students')
    },
    { 
      icon: Ticket, 
      label: t("createCoupon"), 
      color: "from-purple-500 to-pink-500", 
      bg: "bg-purple-50 dark:bg-purple-950/20",
      onClick: () => navigate('/instructor/payment-codes')
    },
  ];

  const ACHIEVEMENTS = [
    { icon: Medal, label: t("topCreator"), requirement: t("reqCourses"), achieved: totalCourses >= 10, color: "text-amber-500" },
    { icon: Users, label: t("popularMentor"), requirement: t("reqStudents"), achieved: (report?.students_count || 0) >= 50, color: "text-emerald-500" },
    { icon: Trophy, label: t("examMaster"), requirement: t("reqExams"), achieved: (report?.exams_count || 0) >= 20, color: "text-indigo-500" },
    { icon: Flame, label: t("risingStar"), requirement: t("reqActive"), achieved: false, color: "text-orange-500" },
  ];

  const mainStats = [
    { label: t("onlineCourses"), value: report?.online_courses || 0, icon: MonitorPlay, gradient: "from-blue-500 to-cyan-500", trend: "+12%", trendUp: true },
    { label: t("centerCourses"), value: report?.center_courses || 0, icon: School, gradient: "from-purple-500 to-indigo-500", trend: "+5%", trendUp: true },
    { label: t("students"), value: report?.students_count || 0, icon: Users, gradient: "from-green-500 to-emerald-500", trend: "+8%", trendUp: true },
    { label: t("earnings"), value: `${totalRevenue.toLocaleString()} EGP`, icon: Wallet, gradient: "from-orange-500 to-amber-500", trend: totalRevenue ? "+15%" : "0%", trendUp: totalRevenue > 0 },
    { label: t("exams"), value: report?.exams_count || 0, icon: FileQuestion, gradient: "from-red-500 to-rose-500", trend: "0%", trendUp: false },
    { label: "الكوبونات", value: report?.used_coupons || 0, icon: Gift, gradient: "from-pink-500 to-fuchsia-500", trend: "+3%", trendUp: true },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse text-lg">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const isRTL = dir === 'rtl' || lang === 'ar';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 ${isRTL ? 'font-arabic' : ''}`}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      `}</style>
      <div className={`mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8 ${isRTL ? 'text-right' : 'text-left'}`}>
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-white/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-32 -ml-32 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
          
          <div className={`relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div className="space-y-2">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="rounded-2xl bg-white/20 backdrop-blur-sm p-3 shadow-lg"
                >
                  <Crown className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-white/80 text-sm font-medium">{greeting}!</p>
                  <h1 className="text-2xl sm:text-4xl font-bold text-white">
                    {user?.name || 'Instructor'}
                    <span className="text-yellow-300 mx-2">✨</span>
                  </h1>
                  <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" />
                    {t("dashboardSubtitle")}
                  </p>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchInstructorReport} 
                  className="gap-2 rounded-xl bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("refresh")}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => setReportDialogOpen(true)} 
                  className="gap-2 rounded-xl bg-white text-indigo-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                >
                  <Download className="h-4 w-4" />
                  {t("downloadReport")}
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 sm:grid-cols-5 lg:grid-cols-7">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalCourses}</p>
              <p className="text-white/60 text-xs">{t("myCourses")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{report?.students_count || 0}</p>
              <p className="text-white/60 text-xs">{t("students")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalRevenue.toLocaleString()} EGP</p>
              <p className="text-white/60 text-xs">{t("earnings")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{report?.exams_count || 0}</p>
              <p className="text-white/60 text-xs">{t("exams")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{report?.books_count || 0}</p>
              <p className="text-white/60 text-xs">{t("books")}</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map((action, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className={`group flex flex-col items-center gap-2 rounded-2xl ${action.bg} p-4 text-center transition-all duration-300 hover:shadow-lg cursor-pointer`}
            >
              <div className={`rounded-xl bg-gradient-to-r ${action.color} p-2.5 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-110`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </motion.button>
          ))}
        </div>
        
        {/* Main Tabs Section */}
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <TabsList className="grid w-full max-w-md grid-cols-3 rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-sm transition-all">
                {t("overview")}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-sm transition-all">
                {t("analytics")}
              </TabsTrigger>
              <TabsTrigger value="performance" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-sm transition-all">
                {t("performance")}
              </TabsTrigger>
            </TabsList>
            
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border-indigo-200 dark:border-indigo-800">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-medium">{t("lastUpdated")}</span>
            </Badge>
          </div>

          {/* ============================================================ */}
          {/* OVERVIEW TAB */}
          {/* ============================================================ */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Main Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {mainStats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -4 }}
                  className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-lg transition-all duration-300 hover:shadow-xl border border-slate-200/50 dark:border-slate-800/50"
                >
                  <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} h-24 w-24 rounded-full bg-gradient-to-r ${stat.gradient} opacity-10 blur-2xl -translate-y-1/2 ${isRTL ? '-translate-x-1/2' : 'translate-x-1/2'}`} />
                  <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="text-2xl font-bold">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                    <div className={`rounded-xl bg-gradient-to-r ${stat.gradient} p-2 shadow-md`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {stat.trendUp ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>{stat.trend}</span>
                    <span className="text-xs text-muted-foreground">{isRTL ? "مقابل الشهر الماضي" : "vs last month"}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Revenue Chart */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="p-5">
                  <div className={`flex items-center justify-between flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <h3 className={`font-semibold text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <ChartLine className="h-5 w-5 text-indigo-500" />
                        {t("revenueOverview")}
                      </h3>
                      <p className="text-xs text-muted-foreground">{isRTL ? "آخر 12 شهر" : "Last 12 months"}</p>
                    </div>
                    <Badge variant="outline" className="gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      {t("totalRevenue")}: {totalRevenue.toLocaleString()} EGP
                    </Badge>
                  </div>
                  <div className="mt-4 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: "16px", border: "none" }} />
                        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} name={t("earnings")} dot={{ r: 4, fill: "#6366f1" }} />
                        <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2.5} name={t("students")} dot={{ r: 4, fill: "#10b981" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* Course Distribution */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="p-5">
                  <h3 className={`font-semibold text-lg flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <ChartPie className="h-5 w-5 text-purple-500" />
                    {t("courseDistribution")}
                  </h3>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={courseDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} label>
                          {courseDistribution.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">{report?.online_courses || 0}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <MonitorPlay className="h-3 w-3" /> {t("online")}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 p-3 text-center">
                      <p className="text-2xl font-bold text-purple-600">{report?.center_courses || 0}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <School className="h-3 w-3" /> {t("center")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Student Growth & Gender Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="p-5">
                  <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Users className="h-5 w-5 text-green-500" />
                      {t("studentGrowth")}
                    </h3>
                    <Badge variant="outline" className="rounded-full bg-green-50 dark:bg-green-950/30">
                      +{report?.students_count || 0} {t("totalStudents")}
                    </Badge>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={studentGrowthData}>
                        <defs>
                          <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: "16px", border: "none" }} />
                        <Area type="monotone" dataKey="students" name={t("students")} stroke="#10b981" strokeWidth={2.5} fill="url(#studentGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* Gender Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="p-5">
                  <h3 className={`font-semibold text-lg flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <UsersRound className="h-5 w-5 text-pink-500" />
                    {t("studentsByGender")}
                  </h3>
                  <div className="h-64">
                    {genderData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={genderData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} label>
                            {genderData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">{t("noDataAvailable")}</p>
                      </div>
                    )}
                  </div>
                  {genderData.length > 0 && (
                    <div className="mt-3 text-center">
                      <p className="text-xs text-muted-foreground">
                        {lang === 'ar' ? 'نسبة الذكور: ' : 'Male: '}
                        <span className="font-bold text-blue-600">{Math.round((genderData.find(g => g.name === t("male"))?.value || 0) / (report?.students_count || 1) * 100)}%</span>
                        {' • '}
                        {lang === 'ar' ? 'نسبة الإناث: ' : 'Female: '}
                        <span className="font-bold text-pink-600">{Math.round((genderData.find(g => g.name === t("female"))?.value || 0) / (report?.students_count || 1) * 100)}%</span>
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* ✅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* ✅ GOVERNORATE DISTRIBUTION - قسم المحافظات */}
            {/* ✅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {hasGovernorateData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-lg border border-emerald-200/50 dark:border-emerald-800/50"
              >
                <div className="p-5">
                  <div className={`flex items-center justify-between flex-wrap gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <h3 className={`font-semibold text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Building2 className="h-5 w-5 text-emerald-500" />
                        {t("studentsByGovernorate")}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("geographicalDistribution")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("realData")}
                      </Badge>
                      <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
                        {governorateData.length} {t("totalGovernorates")}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart Column */}
                    <div className="lg:col-span-2 h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={governorateData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                          <XAxis 
                            type="number" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false} 
                            width={100}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: "16px", border: "none", backgroundColor: "rgba(0,0,0,0.8)", color: "white" }}
                            formatter={(value: number) => [`${value} ${lang === 'ar' ? 'طالب' : 'students'}`, t("numberOfStudents")]}
                            cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
                          />
                          <Bar 
                            dataKey="value" 
                            name={lang === 'ar' ? 'الطلاب' : 'Students'} 
                            radius={[0, 8, 8, 0]}
                            animationDuration={1000}
                            animationBegin={300}
                          >
                            {governorateData.map((entry, idx) => (
                              <Cell 
                                key={`cell-${idx}`} 
                                fill={`hsl(${140 + (idx * 8)}, 70%, 55%)`}
                                stroke={`hsl(${140 + (idx * 8)}, 70%, 45%)`}
                                strokeWidth={1}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Stats & Info Column */}
                    <div className="space-y-4">
                      {/* Top Governorate Card */}
                      <div className="rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 text-center border border-amber-200/50 dark:border-amber-800/50">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Trophy className="h-5 w-5 text-amber-500" />
                          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                            {t("topGovernorate")}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{governorateData[0].name}</p>
                        <p className="text-3xl font-bold mt-2 text-amber-600">{governorateData[0].value}</p>
                        <p className="text-xs text-muted-foreground">{t("students")}</p>
                        <div className="mt-2">
                          <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                            {Math.round((governorateData[0].value / totalGovernorateStudents) * 100)}% {t("ofTotalStudents")}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Total Stats Card */}
                      <div className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 p-4 border border-emerald-200/50 dark:border-emerald-800/50">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">{totalGovernorateStudents}</p>
                            <p className="text-xs text-muted-foreground">{t("totalStudents")}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">{governorateData.length}</p>
                            <p className="text-xs text-muted-foreground">{t("totalGovernorates")}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t("avgStudentsPerGovernorate")}</span>
                            <span className="font-bold text-emerald-600">{(totalGovernorateStudents / governorateData.length).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Governorate List Preview */}
                      <div className="rounded-xl bg-white/50 dark:bg-slate-900/50 p-4 border border-slate-200/50 dark:border-slate-800/50">
                        <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                          {t("governoratesList")}
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                          {governorateData.map((gov, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 group">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: `hsl(${140 + (idx * 8)}, 70%, 55%)` }}
                                />
                                <span className="text-sm font-medium group-hover:text-emerald-600 transition-colors">
                                  {gov.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-emerald-600">{gov.value}</span>
                                <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(gov.value / totalGovernorateStudents) * 100}%` }}
                                    transition={{ delay: 0.6 + idx * 0.03, duration: 0.5 }}
                                    className="h-full rounded-full" 
                                    style={{ backgroundColor: `hsl(${140 + (idx * 8)}, 70%, 55%)` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-10">
                                  {Math.round((gov.value / totalGovernorateStudents) * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          {t("eachColorRepresents")}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {t("sortedDescending")}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs gap-1">
                        <Users className="h-3 w-3" />
                        {totalGovernorateStudents} {t("students")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ✅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* ✅ REGION DISTRIBUTION - قسم المناطق الجديد */}
            {/* ✅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {hasRegionData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-lg border border-blue-200/50 dark:border-blue-800/50"
              >
                <div className="p-5">
                  <div className={`flex items-center justify-between flex-wrap gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <h3 className={`font-semibold text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <MapPin className="h-5 w-5 text-blue-500" />
                        {t("studentsByRegion")}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {lang === 'ar' ? 'تفصيل جغرافي أدق داخل المحافظات' : 'Detailed geographical breakdown within governorates'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("realData")}
                      </Badge>
                      <Badge className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
                        {regionData.length} {lang === 'ar' ? 'منطقة' : 'Regions'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart for Regions */}
                    <div className="lg:col-span-2 h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={regionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                          <XAxis 
                            type="number" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false} 
                            width={120}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: "16px", border: "none", backgroundColor: "rgba(0,0,0,0.8)", color: "white" }}
                            formatter={(value: number) => [`${value} ${lang === 'ar' ? 'طالب' : 'students'}`, t("numberOfStudentsInRegion")]}
                            cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                          />
                          <Bar 
                            dataKey="value" 
                            name={lang === 'ar' ? 'الطلاب' : 'Students'} 
                            radius={[0, 8, 8, 0]}
                            animationDuration={1000}
                            animationBegin={300}
                          >
                            {regionData.map((entry, idx) => (
                              <Cell 
                                key={`cell-${idx}`} 
                                fill={`hsl(${200 + (idx * 15)}, 70%, 55%)`}
                                stroke={`hsl(${200 + (idx * 15)}, 70%, 45%)`}
                                strokeWidth={1}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Stats & Info Column for Regions */}
                    <div className="space-y-4">
                      {/* Top Region Card */}
                      <div className="rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 text-center border border-amber-200/50 dark:border-amber-800/50">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Trophy className="h-5 w-5 text-amber-500" />
                          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                            {t("topRegion")}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{regionData[0].name}</p>
                        <p className="text-3xl font-bold mt-2 text-amber-600">{regionData[0].value}</p>
                        <p className="text-xs text-muted-foreground">{t("students")}</p>
                        <div className="mt-2">
                          <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                            {Math.round((regionData[0].value / totalRegionStudents) * 100)}% {t("ofTotalStudents")}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Total Stats Card for Regions */}
                      <div className="rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 p-4 border border-blue-200/50 dark:border-blue-800/50">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{totalRegionStudents}</p>
                            <p className="text-xs text-muted-foreground">{t("totalStudents")}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{regionData.length}</p>
                            <p className="text-xs text-muted-foreground">{t("totalRegions")}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200/50 dark:border-blue-800/50">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t("avgStudentsPerRegion")}</span>
                            <span className="font-bold text-blue-600">{(totalRegionStudents / regionData.length).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Region List Preview */}
                      <div className="rounded-xl bg-white/50 dark:bg-slate-900/50 p-4 border border-slate-200/50 dark:border-slate-800/50">
                        <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-blue-500" />
                          {t("regionsList")}
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                          {regionData.map((region, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: `hsl(${200 + (idx * 15)}, 70%, 55%)` }}
                                />
                                <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">
                                  {region.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-blue-600">{region.value}</span>
                                <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(region.value / totalRegionStudents) * 100}%` }}
                                    transition={{ delay: 0.6 + idx * 0.03, duration: 0.5 }}
                                    className="h-full rounded-full" 
                                    style={{ backgroundColor: `hsl(${200 + (idx * 15)}, 70%, 55%)` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-10">
                                  {Math.round((region.value / totalRegionStudents) * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          {lang === 'ar' ? 'كل لون يمثل منطقة' : 'Each color represents a region'}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {t("sortedDescending")}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs gap-1">
                        <Users className="h-3 w-3" />
                        {totalRegionStudents} {t("students")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Activity Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {performanceData.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 p-4 shadow-md transition-all duration-300 hover:shadow-xl border border-slate-200/50 dark:border-slate-800/50 cursor-pointer"
                >
                  <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} h-20 w-20 rounded-full ${item.bg} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <p className="text-2xl font-bold">{item.value}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {item.name}
                      </p>
                    </div>
                    <div className={`rounded-xl ${item.bg} p-2.5`}>
                      <item.icon className={`h-5 w-5 ${item.text}`} />
                    </div>
                  </div>
                  <div className="mt-3 h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, item.value * 10)}%` }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                      className={`h-full rounded-full ${item.text.replace('text', 'bg')}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ============================================================ */}
          {/* ANALYTICS TAB */}
          {/* ============================================================ */}
          <TabsContent value="analytics" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="p-5">
                  <h3 className={`font-semibold text-lg flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <RadarChart className="h-5 w-5 text-indigo-500" />
                    {t("performanceRadar")}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">{isRTL ? "تمثيل بصري لأداء المقاييس الرئيسية" : "Visual representation of your key metrics performance"}</p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                        <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={9} domain={[0, 100]} />
                        <Radar name={t("performance")} dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} strokeWidth={2} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="p-5">
                  <h3 className={`font-semibold text-lg flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Gauge className="h-5 w-5 text-emerald-500" />
                    {t("progressMetrics")}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">{isRTL ? "معدلات الإكمال والتفاعل" : "Completion and engagement rates"}</p>
                  <div className="space-y-6">
                    <div>
                      <div className={`flex justify-between mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-medium">{t("completionRate")}</span>
                        <span className="text-sm font-semibold text-indigo-500">{completionRate}%</span>
                      </div>
                      <Progress value={completionRate} className="h-2.5 rounded-full" />
                    </div>
                    <div>
                      <div className={`flex justify-between mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-medium">{t("engagementRate")}</span>
                        <span className="text-sm font-semibold text-emerald-500">{engagementRate}%</span>
                      </div>
                      <Progress value={engagementRate} className="h-2.5 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
                        <p className="text-2xl font-bold text-indigo-600">{report?.exams_count || 0}</p>
                        <p className="text-xs text-muted-foreground">{t("examsTaken")}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{report?.assignments_count || 0}</p>
                        <p className="text-xs text-muted-foreground">{t("assignments")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
            >
              <div className="p-5">
                <h3 className={`font-semibold text-lg flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  {t("monthlyTrends")}
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "16px", border: "none" }} />
                      <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2.5} name={t("students")} dot={{ r: 4, fill: "#10b981" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Governorate Pie Chart in Analytics */}
            {hasGovernorateData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="p-5">
                  <div className={`flex items-center justify-between flex-wrap gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <PieChartIcon2 className="h-5 w-5 text-purple-500" />
                      {t("governorateDistribution")}
                    </h3>
                    <Badge className="rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      {totalGovernorateStudents} {t("students")}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={governorateData} 
                            dataKey="value" 
                            nameKey="name"
                            cx="50%" 
                            cy="50%" 
                            innerRadius={40} 
                            outerRadius={90}
                            paddingAngle={2}
                            label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                          >
                            {governorateData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={`hsl(${140 + (idx * 8)}, 70%, 55%)`} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value} ${lang === 'ar' ? 'طالب' : 'students'}`, t("numberOfStudents")]} />
                          <Legend 
                            layout="vertical" 
                            align={isRTL ? "left" : "right"}
                            verticalAlign="middle"
                            wrapperStyle={{ fontSize: "11px" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-purple-500" />
                        {lang === 'ar' ? 'تفاصيل المحافظات' : 'Governorate Details'}
                      </p>
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                        {governorateData.map((gov, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${140 + (idx * 8)}, 70%, 55%)` }} />
                              {gov.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-purple-600">{gov.value}</span>
                              <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(gov.value / totalGovernorateStudents) * 100}%` }}
                                  transition={{ delay: 0.5 + idx * 0.05, duration: 0.5 }}
                                  className="h-full rounded-full" 
                                  style={{ backgroundColor: `hsl(${140 + (idx * 8)}, 70%, 55%)` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-12">
                                {Math.round((gov.value / totalGovernorateStudents) * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Region Pie Chart in Analytics */}
            {hasRegionData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="p-5">
                  <div className={`flex items-center justify-between flex-wrap gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <PieChartIcon2 className="h-5 w-5 text-cyan-500" />
                      {t("regionDistribution")}
                    </h3>
                    <Badge className="rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      {totalRegionStudents} {t("students")}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={regionData} 
                            dataKey="value" 
                            nameKey="name"
                            cx="50%" 
                            cy="50%" 
                            innerRadius={40} 
                            outerRadius={90}
                            paddingAngle={2}
                            label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                          >
                            {regionData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={`hsl(${200 + (idx * 15)}, 70%, 55%)`} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value} ${lang === 'ar' ? 'طالب' : 'students'}`, t("numberOfStudentsInRegion")]} />
                          <Legend 
                            layout="vertical" 
                            align={isRTL ? "left" : "right"}
                            verticalAlign="middle"
                            wrapperStyle={{ fontSize: "11px" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-cyan-500" />
                        {lang === 'ar' ? 'تفاصيل المناطق' : 'Region Details'}
                      </p>
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                        {regionData.map((region, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${200 + (idx * 15)}, 70%, 55%)` }} />
                              {region.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-cyan-600">{region.value}</span>
                              <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(region.value / totalRegionStudents) * 100}%` }}
                                  transition={{ delay: 0.5 + idx * 0.05, duration: 0.5 }}
                                  className="h-full rounded-full" 
                                  style={{ backgroundColor: `hsl(${200 + (idx * 15)}, 70%, 55%)` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-12">
                                {Math.round((region.value / totalRegionStudents) * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {stageData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="p-5">
                  <h3 className={`font-semibold text-lg flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <GraduationCap className="h-5 w-5 text-cyan-500" />
                    {isRTL ? "الطلاب حسب المرحلة" : "Students by Stage"}
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: "16px", border: "none" }} />
                        <Bar dataKey="value" name={t("students")} fill="#06b6d4" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
            >
              <div className="p-5">
                <h3 className={`font-semibold text-lg flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Database className="h-5 w-5 text-cyan-500" />
                  {t("detailedStats")}
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{report?.online_courses || 0}</p>
                    <p className="text-xs text-muted-foreground">{t("onlineCourses")}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-purple-500/5 to-purple-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{report?.center_courses || 0}</p>
                    <p className="text-xs text-muted-foreground">{t("centerCourses")}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-green-500/5 to-green-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{report?.students_count || 0}</p>
                    <p className="text-xs text-muted-foreground">{t("totalStudents")}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-amber-500/5 to-amber-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{report?.semesters_count || 0}</p>
                    <p className="text-xs text-muted-foreground">{t("semesters")}</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-pink-500/5 to-pink-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-pink-600">{report?.used_coupons || 0}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? "الكوبونات المستخدمة" : "Coupons Used"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ============================================================ */}
          {/* PERFORMANCE TAB */}
          {/* ============================================================ */}
          <TabsContent value="performance" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="p-5">
                  <h3 className={`font-semibold text-lg flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Medal className="h-5 w-5 text-yellow-500" />
                    {t("achievements")}
                  </h3>
                  <div className="space-y-3">
                    {ACHIEVEMENTS.map((achievement, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        className={`group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 hover:from-slate-100 dark:hover:from-slate-800 transition-all duration-300 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`rounded-xl p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 group-hover:scale-110 transition-transform duration-300`}>
                            <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
                          </div>
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <p className="text-sm font-medium">{achievement.label}</p>
                            <p className="text-xs text-muted-foreground">{achievement.requirement}</p>
                          </div>
                        </div>
                        {achievement.achieved ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="p-5">
                  <h3 className={`font-semibold text-lg flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <BadgeDollarSign className="h-5 w-5 text-emerald-500" />
                    {t("earningsSummary")}
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5">
                      <p className="text-3xl font-bold text-emerald-600">{totalRevenue.toLocaleString()} EGP</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("lifetimeEarnings")}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <p className="text-xl font-bold">{totalCourses}</p>
                        <p className="text-xs text-muted-foreground">{t("activeCourses")}</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <p className="text-xl font-bold">{totalCourses > 0 ? Math.round(totalRevenue / totalCourses) : 0} EGP</p>
                        <p className="text-xs text-muted-foreground">{t("avgPerCourse")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800/50"
            >
              <div className="p-5">
                <h3 className={`font-semibold text-lg flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Gauge className="h-5 w-5 text-indigo-500" />
                  {t("performanceInsights")}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-gradient-to-r from-indigo-500/5 to-indigo-500/10 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t("efficiencyScore")}</p>
                    <p className="text-2xl font-bold text-indigo-600">{completionRate}%</p>
                    <div className="mt-2 h-1.5 rounded-full bg-indigo-200 dark:bg-indigo-900">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-full rounded-full bg-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t("studentGrowth2")}</p>
                    <p className="text-2xl font-bold text-emerald-600">+{report?.students_count || 0}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-900">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (report?.students_count || 0))}%` }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-full rounded-full bg-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-r from-amber-500/5 to-amber-500/10 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t("engagementRate")}</p>
                    <p className="text-2xl font-bold text-amber-600">{engagementRate}%</p>
                    <div className="mt-2 h-1.5 rounded-full bg-amber-200 dark:bg-amber-900">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${engagementRate}%` }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-full rounded-full bg-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Download Report Dialog */}
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className={`flex items-center gap-2 text-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Download className="h-5 w-5 text-primary" />
                {t("downloadReport")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("fromDate")}</Label>
                <div className="relative">
                  <Calendar className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input type="date" className={`${isRTL ? 'pr-9' : 'pl-9'} rounded-xl`} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("toDate")}</Label>
                <div className="relative">
                  <Calendar className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input type="date" className={`${isRTL ? 'pr-9' : 'pl-9'} rounded-xl`} value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter className={`flex gap-2 ${isRTL ? 'sm:justify-start' : 'sm:justify-end'}`}>
              <Button variant="outline" onClick={() => setReportDialogOpen(false)} className="rounded-xl">{t("cancel")}</Button>
              <Button onClick={handleDownloadReport} disabled={downloading} className="gap-2 rounded-xl">
                {downloading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("downloading")}</> : <><Download className="h-4 w-4" />{t("downloadPDF")}</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}