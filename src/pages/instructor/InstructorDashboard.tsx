import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { StatCard } from "@/components/lms/StatCard";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, DollarSign, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Pie, PieChart, Legend } from "recharts";
import { monthlyRevenue, categoryData, recentActivity } from "@/lib/mockData";
import { AvatarBadge } from "@/components/lms/AvatarBadge";

export function InstructorDashboard() {
  const { t } = useApp();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Welcome back, Ahmed 👋"
        description="Your courses are gaining momentum. Keep it up!"
        actions={<Button className="gap-2 rounded-xl gradient-primary border-0 shadow-glow"><Sparkles className="h-4 w-4" />New course</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("myCourses")} value="12" delta={2} icon={BookOpen} variant="primary" />
        <StatCard label={t("students")} value="3,420" delta={14.2} icon={Users} variant="accent" />
        <StatCard label={t("earnings")} value="$48.2K" delta={18.7} icon={DollarSign} variant="warm" />
        <StatCard label={t("rating")} value="4.9" delta={0.2} icon={Star} variant="info" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl border-border p-6 shadow-soft">
          <h3 className="font-semibold">{t("earnings")}</h3>
          <p className="text-sm text-muted-foreground">Last 12 months</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
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
        </Card>

        <Card className="rounded-2xl border-border p-6 shadow-soft">
          <h3 className="font-semibold">By category</h3>
          <p className="text-sm text-muted-foreground">Course distribution</p>
          <div className="mt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {categoryData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border-border p-6 shadow-soft">
        <h3 className="font-semibold">{t("recentActivity")}</h3>
        <ul className="mt-4 divide-y divide-border">
          {recentActivity.slice(0, 5).map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-3">
              <AvatarBadge initials={a.user.split(" ").map(n => n[0]).join("")} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{a.user}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="font-medium">{a.target}</span>
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
