/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/AdminCourses.tsx

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/lms/StatusBadge";
import {
  BookOpen,
  Star,
  Users,
  Plus,
  Search,
  Filter,
  X,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Grid3x3,
  List,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Globe2,
  TrendingUp,
  GraduationCap,
  Building2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PieChart,
  Activity,
  School,
  BookMarked,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Course {
  id: number;
  title: string;
  title_ar: string;
  description: string;
  type: "online" | "center";
  price: string;
  discount: string;
  price_before_discount: number;
  count_student: number;
  active: number;
  imageUrl: string;
  start_date: string;
  end_date: string;
  hour_time_course: string;
  teacher: { id: number; name: string; email: string };
  stage: { id: number; name: string; name_ar: string };
  subject: { id: number; name: string; name_ar: string };
  semester: { id: number; name: string; name_ar: string; price: string };
  details: any[];
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  type: string;
  status: string;
  search: string;
  price_min: string;
  price_max: string;
}

export function AdminCourses() {
  const { t, dir } = useApp();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [perPage, setPerPage] = useState(12);

  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    status: "all",
    search: "",
    price_min: "",
    price_max: "",
  });
  
  // Fetch courses
// src/pages/admin/AdminCourses.tsx

const fetchCourses = useCallback(async () => {
  setLoading(true);
  try {
    const filtersObj: any = {};
    
    if (filters.type && filters.type !== "all") {
      filtersObj.type = filters.type;
    }
    if (filters.status && filters.status !== "all") {
      filtersObj.active = filters.status === "active" ? 1 : 0;
    }
    if (filters.search && filters.search.trim()) {
      filtersObj.search = filters.search.trim();
    }
    
    // ✅ بناء الـ Request Body مع الـ Pagination
    const requestBody: any = {
      filters: filtersObj,
      orderBy: 'id',
      orderByDirection: 'desc',
      perPage: 12, // ✅ عدد العناصر في الصفحة
      page: currentPage,
      paginate: true,
      delete: false,
    };

    console.log('📤 Request Body:', requestBody);

    const response = await api.post("/course/index", requestBody);
    
    console.log('📥 Response:', response.data);

    // ✅ استخراج البيانات من الـ Response
    const courseData = response.data?.data || [];
    const meta = response.data?.meta || {};
    const links = response.data?.links || {};
    
    setCourses(courseData);
    setTotalPages(meta.last_page || 1);
    setTotalCourses(meta.total || courseData.length);
    setCurrentPage(meta.current_page || 1);
    
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    toast.error(t("error") + ": " + (error.response?.data?.message || t("tryAgain")));
  } finally {
    setLoading(false);
  }
}, [filters, currentPage, t]);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: "all",
      status: "all",
      search: "",
      price_min: "",
      price_max: "",
    });
    setCurrentPage(1);
  };

  // Delete course
  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    try {
      await api.delete(`/course/${selectedCourse.id}`);
      toast.success(t("deleted") || "Course deleted");
      fetchCourses();
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("error"));
    }
  };

  // Toggle active status
  const handleToggleActive = async (course: Course) => {
    try {
      await api.patch(`/course/${course.id}/toggle-active`);
      toast.success(course.active === 1 ? t("deactivated") : t("activated"));
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("error"));
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== "" && v !== "all").length;

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(parseFloat(price));
  };

  // Stats
  const stats = {
    total: courses.length,
    online: courses.filter(c => c.type === "online").length,
    center: courses.filter(c => c.type === "center").length,
    active: courses.filter(c => c.active === 1).length,
    inactive: courses.filter(c => c.active === 0).length,
    totalStudents: courses.reduce((sum, c) => sum + (c.count_student || 0), 0),
    totalRevenue: courses.reduce((sum, c) => sum + parseFloat(c.price), 0),
  };

  // Chart data
  const typeChartData = [
    { name: t("online") || "Online", value: stats.online, color: "#3b82f6" },
    { name: t("center") || "Center", value: stats.center, color: "#8b5cf6" },
  ];
  
  const statusChartData = [
    { name: t("active") || "Active", value: stats.active, color: "#10b981" },
    { name: t("inactive") || "Inactive", value: stats.inactive, color: "#ef4444" },
  ];

  // Generate monthly data from real courses
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = new Array(12).fill(0);
    const monthlyCourses = new Array(12).fill(0);
    
    courses.forEach(course => {
      const date = new Date(course.createdAt);
      const month = date.getMonth();
      monthlyRevenue[month] += parseFloat(course.price);
      monthlyCourses[month] += 1;
    });
    
    return months.map((month, i) => ({
      month,
      revenue: monthlyRevenue[i],
      courses: monthlyCourses[i],
    })).filter(m => m.revenue > 0 || m.courses > 0);
  };

  const monthlyData = getMonthlyData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 p-6 backdrop-blur-sm">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-orange-500/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-purple-500/30 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 p-2">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-400 dark:to-pink-400 bg-clip-text text-transparent">
                  {t("courses") || "Courses Management"}
                </h1>
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {t("manageAndCreateCourses") || "Manage and create courses for your platform"}
              </p>
            </div>
          
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {[
            { label: t("totalCourses") || "Total", value: stats.total, icon: BookOpen, color: "blue" },
            { label: t("active") || "Active", value: stats.active, icon: CheckCircle, color: "green" },
            { label: t("inactive") || "Inactive", value: stats.inactive, icon: XCircle, color: "red" },
            { label: t("online") || "Online", value: stats.online, icon: Globe2, color: "purple" },
            { label: t("center") || "Center", value: stats.center, icon: Building2, color: "orange" },
            { label: t("students") || "Students", value: stats.totalStudents.toLocaleString(), icon: Users, color: "emerald" },
            { label: t("revenue") || "Revenue", value: formatPrice(stats.totalRevenue.toString()), icon: DollarSign, color: "amber" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`rounded-2xl bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/10 border border-${stat.color}-500/20 p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-${stat.color}-500/20`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-xl">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    {t("revenueTrend") || "Revenue Trend"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t("revenueOverTime") || "Revenue over time"}</p>
                </div>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData.length ? monthlyData : [{ month: "No Data", revenue: 0 }]}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v/1000}k`} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }} />
                    <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#revenueGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Distribution Pies */}
          <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-xl">
            <div className="p-5">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <PieChart className="h-5 w-5 text-purple-500" />
                {t("courseDistribution") || "Course Distribution"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground text-center mb-2">{t("byType") || "By Type"}</p>
                  <ResponsiveContainer width="100%" height={140}>
                    <RePieChart>
                      <Pie data={typeChartData} dataKey="value" innerRadius={30} outerRadius={50} paddingAngle={2}>
                        {typeChartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend iconType="circle" fontSize={10} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground text-center mb-2">{t("byStatus") || "By Status"}</p>
                  <ResponsiveContainer width="100%" height={140}>
                    <RePieChart>
                      <Pie data={statusChartData} dataKey="value" innerRadius={30} outerRadius={50} paddingAngle={2}>
                        {statusChartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend iconType="circle" fontSize={10} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-xl">
          <div className="p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchCourses") || "Search by title..."}
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-9 rounded-xl border-2 focus:border-orange-500 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && fetchCourses()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={showFilters ? "default" : "outline"}
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2 rounded-xl"
                  >
                    <Filter className="h-4 w-4" />
                    {t("filters") || "Filters"}
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 bg-orange-500 text-white">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                  <div className="flex rounded-xl border-2 border-border overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      className="rounded-none"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      className="rounded-none"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="icon" onClick={fetchCourses} className="rounded-xl">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>{t("type") || "Type"}</Label>
                        <Select value={filters.type} onValueChange={(v) => setFilters(prev => ({ ...prev, type: v }))}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder={t("all") || "All"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t("all") || "All"}</SelectItem>
                            <SelectItem value="online">{t("online") || "Online"}</SelectItem>
                            <SelectItem value="center">{t("center") || "Center"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("status") || "Status"}</Label>
                        <Select value={filters.status} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder={t("all") || "All"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t("all") || "All"}</SelectItem>
                            <SelectItem value="active">{t("active") || "Active"}</SelectItem>
                            <SelectItem value="inactive">{t("inactive") || "Inactive"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("priceRange") || "Price Range"}</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder={t("min") || "Min"}
                            value={filters.price_min}
                            onChange={(e) => setFilters(prev => ({ ...prev, price_min: e.target.value }))}
                            className="rounded-xl"
                          />
                          <Input
                            type="number"
                            placeholder={t("max") || "Max"}
                            value={filters.price_max}
                            onChange={(e) => setFilters(prev => ({ ...prev, price_max: e.target.value }))}
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button variant="outline" onClick={resetFilters} className="gap-2 rounded-xl w-full">
                          <X className="h-4 w-4" />
                          {t("clearFilters") || "Clear"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.type && filters.type !== "all" && (
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                {t("type")}: {filters.type === "online" ? t("online") : t("center")}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, type: "all" }))} />
              </Badge>
            )}
            {filters.status && filters.status !== "all" && (
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                {t("status")}: {filters.status === "active" ? t("active") : t("inactive")}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, status: "all" }))} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 text-xs">
              {t("clearAll") || "Clear all"}
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
              <p className="text-muted-foreground">{t("loading") || "Loading courses..."}</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <Card className="py-32 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20">
              <BookOpen className="h-10 w-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("noCoursesFound") || "No courses found"}</h3>
            <p className="text-muted-foreground mb-6">{t("tryAdjustingFilters") || "Try adjusting your filters or create a new course"}</p>
            <Button onClick={() => navigate("/admin/courses/create")} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("createCourse") || "Create Course"}
            </Button>
          </Card>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
                  <div className="relative aspect-video overflow-hidden" onClick={() => navigate(`/admin/courses/${course.id}`)}>
                    <img
                      src={course.imageUrl}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={course.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={course.active === 1 ? "active" : "inactive"} />
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-white/20 backdrop-blur-md text-white border border-white/30">
                        {course.type === "online" ? (t("online") || "Online") : (t("center") || "Center")}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="rounded-full bg-white/20 p-4 backdrop-blur-md border border-white/30">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg leading-tight line-clamp-1">
                        {dir === "rtl" ? course.title_ar || course.title : course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {course.teacher?.name || "Unknown"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-600">
                          <Star className="h-3 w-3 fill-yellow-500" />
                          4.8
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-600">
                          <Users className="h-3 w-3" />
                          {course.count_student}
                        </span>
                      </div>


<div className="text-right">
  {parseFloat(course.discount) > 0 ? (
    <>
      <span className="text-xs line-through text-muted-foreground">
        {formatPrice(course.price || "0")}
      </span>
      <span className="text-base font-bold text-orange-600 ml-1">
        {formatPrice((course.price_before_discount || course.price || "0").toString())}
      </span>
    </>
  ) : (
    <span className="text-base font-bold text-orange-600">
      {formatPrice(course.price || "0")}
    </span>
  )}
</div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                            {t("actions") || "Actions"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="rounded-xl">
                          <DropdownMenuItem onClick={() => navigate(`/admin/courses/${course.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t("view") || "View"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/courses/${course.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t("edit") || "Edit"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(course)}>
                            {course.active === 1 ? (
                              <><XCircle className="h-4 w-4 mr-2" />{t("deactivate") || "Deactivate"}</>
                            ) : (
                              <><CheckCircle className="h-4 w-4 mr-2" />{t("activate") || "Activate"}</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedCourse(course);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("delete") || "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          // List View
          <Card className="overflow-hidden rounded-2xl border-0 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900">
                  <tr>
                    <th className="text-left p-4 font-semibold">{t("title") || "Title"}</th>
                    <th className="text-left p-4 font-semibold">{t("teacher") || "Teacher"}</th>
                    <th className="text-left p-4 font-semibold">{t("type") || "Type"}</th>
                    <th className="text-left p-4 font-semibold">{t("students") || "Students"}</th>
                    <th className="text-left p-4 font-semibold">{t("price") || "Price"}</th>
                    <th className="text-left p-4 font-semibold">{t("status") || "Status"}</th>
                    <th className="text-left p-4 font-semibold">{t("actions") || "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={course.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt={course.title} />
                          <span className="font-medium">
                            {dir === "rtl" ? course.title_ar || course.title : course.title}
                          </span>
                        </div>
                       </td>
                      <td className="p-4">{course.teacher?.name || "-"}</td>
                      <td className="p-4">
                        <Badge variant={course.type === "online" ? "default" : "secondary"} className="gap-1">
                          {course.type === "online" ? <Globe2 className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                          {course.type === "online" ? (t("online") || "Online") : (t("center") || "Center")}
                        </Badge>
                       </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {course.count_student}
                        </span>
                       </td>
                      <td className="p-4 font-semibold text-orange-600">{formatPrice(course.price)}</td>
                      <td className="p-4">
                        <StatusBadge status={course.active === 1 ? "active" : "inactive"} />
                       </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/courses/${course.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/courses/${course.id}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => {
                            setSelectedCourse(course);
                            setDeleteDialogOpen(true);
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t("showing") || "Showing"} {courses.length} {t("of") || "of"} {totalCourses} {t("courses") || "courses"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1 text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                {t("confirmDelete") || "Confirm Deletion"}
              </DialogTitle>
              <DialogDescription>
                {t("confirmDeleteCourse") || "Are you sure you want to delete this course? This action can be undone from trash."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {t("cancel") || "Cancel"}
              </Button>
              <Button variant="destructive" onClick={handleDeleteCourse}>
                {t("delete") || "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}