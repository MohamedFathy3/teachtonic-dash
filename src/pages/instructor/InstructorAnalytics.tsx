import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { StatCard } from "@/components/lms/StatCard";
import { Card } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthlyRevenue } from "@/lib/mockData";
import { Activity, Eye, Clock, TrendingUp } from "lucide-react";

const engagement = monthlyRevenue.map((m) => ({ month: m.month, completion: 50 + Math.round((m.users / 1200) * 40), engagement: 60 + Math.round((m.users / 1500) * 30) }));

export function InstructorAnalytics() {
  const { t } = useApp();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("analytics")} description="Performance, engagement, and completion across your courses" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Course views" value="48.2K" delta={12.3} icon={Eye} variant="primary" />
        <StatCard label="Avg watch time" value="42m" delta={5.8} icon={Clock} variant="accent" />
        <StatCard label="Completion rate" value="78%" delta={3.4} icon={Activity} variant="warm" />
        <StatCard label="Engagement" value="89%" delta={2.1} icon={TrendingUp} variant="info" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border p-6 shadow-soft">
          <h3 className="font-semibold">Completion rate</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                <Line type="monotone" dataKey="completion" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ fill: "hsl(var(--accent))", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="rounded-2xl border-border p-6 shadow-soft">
          <h3 className="font-semibold">Engagement</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
