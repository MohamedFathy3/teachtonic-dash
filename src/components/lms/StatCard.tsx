import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  variant?: "primary" | "accent" | "warm" | "info";
  children?: ReactNode;
}

const variantBg: Record<NonNullable<StatCardProps["variant"]>, string> = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  warm: "gradient-warm",
  info: "bg-info",
};

export function StatCard({ label, value, delta, icon: Icon, variant = "primary", children }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-smooth hover:shadow-elevated hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {delta !== undefined && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
              <span className={cn(
                "flex items-center gap-0.5 rounded-full px-2 py-0.5",
                positive ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
              )}>
                {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(delta)}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-glow", variantBg[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {children}
    </div>
  );
}
