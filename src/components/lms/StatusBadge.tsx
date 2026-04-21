import { cn } from "@/lib/utils";

type Status = "active" | "inactive" | "pending" | "completed" | "draft" | "published" | "refunded" | "graded" | "revision";

const styles: Record<Status, string> = {
  active: "bg-accent/10 text-accent ring-accent/20",
  completed: "bg-accent/10 text-accent ring-accent/20",
  published: "bg-accent/10 text-accent ring-accent/20",
  graded: "bg-accent/10 text-accent ring-accent/20",
  inactive: "bg-muted text-muted-foreground ring-border",
  pending: "bg-warning/10 text-warning ring-warning/20",
  draft: "bg-muted text-muted-foreground ring-border",
  refunded: "bg-destructive/10 text-destructive ring-destructive/20",
  revision: "bg-info/10 text-info ring-info/20",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = (status.toLowerCase() as Status) in styles ? (status.toLowerCase() as Status) : "inactive";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 capitalize",
        styles[key],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
