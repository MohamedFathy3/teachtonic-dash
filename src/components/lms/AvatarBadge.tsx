import { cn } from "@/lib/utils";

interface AvatarBadgeProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "primary" | "accent" | "warm" | "info";
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const variants = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  warm: "gradient-warm",
  info: "bg-info",
};

// Deterministic variant from initials
function pickVariant(seed: string) {
  const v = ["primary", "accent", "warm", "info"] as const;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return v[h % v.length];
}

export function AvatarBadge({ initials, size = "md", className, variant }: AvatarBadgeProps) {
  const v = variant ?? pickVariant(initials);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-soft",
        sizes[size],
        variants[v],
        className
      )}
    >
      {initials}
    </div>
  );
}
