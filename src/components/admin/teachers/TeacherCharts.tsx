// src/components/admin/teachers/TeacherCharts.tsx
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface TeacherChartsProps {
  report: {
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
  } | null;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export function TeacherCharts({ report }: TeacherChartsProps) {
  if (!report) return null;

  // بيانات توزيع الكورسات
  const coursesDistribution = [
    { name: 'Online Courses', value: report.online_courses, color: '#3b82f6' },
    { name: 'Center Courses', value: report.center_courses, color: '#8b5cf6' },
  ];

  // بيانات الأداء
  const performanceData = [
    { name: 'Exams', value: report.exams_count },
    { name: 'Assignments', value: report.assignments_count },
    { name: 'Semesters', value: report.semesters_count },
    { name: 'Books', value: report.books_count },
    { name: 'Coupons', value: report.used_coupons },
    { name: 'Requests', value: report.requests_count },
  ];

  // بيانات شهرية (مثال - ممكن تجيبها من API)
  const monthlyData = [
    { month: 'Jan', students: 0, revenue: 0 },
    { month: 'Feb', students: 0, revenue: 0 },
    { month: 'Mar', students: 1, revenue: 0 },
    { month: 'Apr', students: 2, revenue: 0 },
    { month: 'May', students: report.students_count, revenue: report.profits },
    { month: 'Jun', students: 0, revenue: 0 },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
          <p className="text-sm text-muted-foreground font-medium">Total Students</p>
          <p className="text-3xl font-bold text-blue-600">{report.students_count}</p>
          <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
          <p className="text-sm text-muted-foreground font-medium">Total Profits</p>
          <p className="text-3xl font-bold text-green-600">${report.profits}</p>
          <p className="text-xs text-muted-foreground mt-1">+8% from last month</p>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
          <p className="text-sm text-muted-foreground font-medium">Total Exams</p>
          <p className="text-3xl font-bold text-purple-600">{report.exams_count}</p>
          <p className="text-xs text-muted-foreground mt-1">+5 new this month</p>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30">
          <p className="text-sm text-muted-foreground font-medium">Active Requests</p>
          <p className="text-3xl font-bold text-orange-600">{report.requests_count}</p>
          <p className="text-xs text-muted-foreground mt-1">+3 pending</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Course Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-500 rounded-full" />
            Course Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={coursesDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {coursesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart - Performance Metrics */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            Performance Metrics
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Area Chart - Growth Trend */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-purple-500 rounded-full" />
            Growth Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="students"
                  stroke="#3b82f6"
                  fill="url(#studentGradient)"
                  name="Students"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fill="url(#revenueGradient)"
                  name="Revenue ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-amber-500 rounded-full" />
          Detailed Statistics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-semibold">Metric</th>
                <th className="text-left py-3 font-semibold">Count</th>
                <th className="text-left py-3 font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-3">Online Courses</td>
                <td className="py-3 font-medium">{report.online_courses}</td>
                <td className="py-3"><span className="text-green-600">↑ +2</span></td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-3">Center Courses</td>
                <td className="py-3 font-medium">{report.center_courses}</td>
                <td className="py-3"><span className="text-green-600">↑ +1</span></td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-3">Total Students</td>
                <td className="py-3 font-medium">{report.students_count}</td>
                <td className="py-3"><span className="text-green-600">↑ +12%</span></td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-3">Total Exams</td>
                <td className="py-3 font-medium">{report.exams_count}</td>
                <td className="py-3"><span className="text-green-600">↑ +4</span></td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-3">Assignments</td>
                <td className="py-3 font-medium">{report.assignments_count}</td>
                <td className="py-3"><span className="text-yellow-600">→ No change</span></td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-3">Semesters</td>
                <td className="py-3 font-medium">{report.semesters_count}</td>
                <td className="py-3"><span className="text-green-600">↑ +2</span></td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-3">Used Coupons</td>
                <td className="py-3 font-medium">{report.used_coupons}</td>
                <td className="py-3"><span className="text-green-600">↑ +6</span></td>
              </tr>
              <tr className="border-b hover:bg-muted/20">
                <td className="py-3">Books</td>
                <td className="py-3 font-medium">{report.books_count}</td>
                <td className="py-3"><span className="text-green-600">↑ +1</span></td>
              </tr>
              <tr>
                <td className="py-3">Pending Requests</td>
                <td className="py-3 font-medium">{report.requests_count}</td>
                <td className="py-3"><span className="text-red-600">⚠ Needs attention</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}