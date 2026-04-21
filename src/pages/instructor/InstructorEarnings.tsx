import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/lms/PageHeader";
import { StatCard } from "@/components/lms/StatCard";
import { Card } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthlyRevenue } from "@/lib/mockData";
import { DollarSign, Wallet, TrendingUp, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstructorEarnings() {
  const { t } = useApp();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title={t("earnings")}
        description="Track your revenue and request payouts"
        actions={<Button className="rounded-xl gradient-accent border-0 shadow-glow">Request payout</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total earnings" value="$48,200" delta={18.7} icon={DollarSign} variant="warm" />
        <StatCard label="Available" value="$12,840" delta={8.2} icon={Wallet} variant="accent" />
        <StatCard label="This month" value="$5,890" delta={12.4} icon={TrendingUp} variant="primary" />
        <StatCard label="Pending" value="$1,420" icon={Banknote} variant="info" />
      </div>

      <Card className="rounded-2xl border-border p-6 shadow-soft">
        <h3 className="font-semibold">Revenue over time</h3>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="earn-2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--warning))" strokeWidth={2.5} fill="url(#earn-2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
