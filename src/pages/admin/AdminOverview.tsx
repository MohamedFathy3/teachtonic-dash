import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { StatCard } from "@/components/lms/StatCard";
import { AvatarBadge } from "@/components/lms/AvatarBadge";
import { Users, BookOpen, DollarSign, GraduationCap, TrendingUp, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthlyRevenue, recentActivity } from "@/lib/mockData";

export function AdminOverview() {
  const { t } = useApp();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title={`${t("dashboard")} ✨`}
        description="Welcome back. Here's what's happening on your platform today."
        actions={
          <Button className="gap-2 rounded-xl gradient-primary shadow-glow border-0">
            <Sparkles className="h-4 w-4" />
            Generate report
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("totalUsers")} value="12,847" delta={12.4} icon={Users} variant="primary" />
        <StatCard label={t("totalCourses")} value="486" delta={8.1} icon={BookOpen} variant="accent" />
        <StatCard label={t("totalRevenue")} value="$284K" delta={23.5} icon={DollarSign} variant="warm" />
        <StatCard label={t("activeInstructors")} value="142" delta={-2.1} icon={GraduationCap} variant="info" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl border-border p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">{t("monthlyRevenue")}</h3>
              <p className="text-sm text-muted-foreground">Last 12 months</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <TrendingUp className="h-3.5 w-3.5" />
              +24% YoY
            </div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl border-border p-6 shadow-soft">
          <h3 className="text-base font-semibold">{t("enrollmentTrend")}</h3>
          <p className="text-sm text-muted-foreground">New users per month</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="users" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border-border p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{t("recentActivity")}</h3>
          <Button variant="ghost" size="sm" className="text-primary">{t("viewAll")}</Button>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {recentActivity.map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-3">
              <AvatarBadge initials={a.user.split(" ").map(n => n[0]).join("")} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{a.user}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="font-medium">{a.target}</span>
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
