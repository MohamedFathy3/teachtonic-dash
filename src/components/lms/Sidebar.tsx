import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CreditCard, Star, Settings,
  ClipboardList, FileEdit, Upload, BarChart3, DollarSign, UserCog, Globe2, X,
  Sparkles
} from "lucide-react";
import { TranslationKey } from "@/i18n/translations";

interface NavItem {
  to: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
}

const adminNav: NavItem[] = [
  { to: "dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { to: "users", labelKey: "users", icon: Users },
  { to: "instructors", labelKey: "instructors", icon: GraduationCap },
  { to: "courses", labelKey: "courses", icon: BookOpen },
  { to: "payments", labelKey: "payments", icon: CreditCard },
  { to: "reviews", labelKey: "reviews", icon: Star },
  { to: "settings", labelKey: "settings", icon: Settings },
];

const instructorNav: NavItem[] = [
  { to: "dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { to: "my-courses", labelKey: "myCourses", icon: BookOpen },
  { to: "students", labelKey: "students", icon: Users },
  { to: "exams", labelKey: "exams", icon: ClipboardList },
  { to: "assignments", labelKey: "assignments", icon: FileEdit },
  { to: "content", labelKey: "content", icon: Upload },
  { to: "analytics", labelKey: "analytics", icon: BarChart3 },
  { to: "earnings", labelKey: "earnings", icon: DollarSign },
  { to: "assistants", labelKey: "assistants", icon: UserCog },
  { to: "website", labelKey: "websiteBuilder", icon: Globe2 },
  { to: "settings", labelKey: "settings", icon: Settings },
];

interface SidebarProps {
  active: string;
  onNavigate: (to: string) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ active, onNavigate, open, onClose }: SidebarProps) {
  const { t, role } = useApp();
  const items = role === "admin" ? adminNav : instructorNav;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-72 flex-col border-e border-sidebar-border bg-sidebar transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          "start-0",
          open ? "translate-x-0" : "rtl:translate-x-full ltr:-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold">{t("brand")}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {role === "admin" ? t("admin") : t("instructor")}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-sidebar-accent lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.to;
              return (
                <li key={item.to}>
                  <button
                    onClick={() => {
                      onNavigate(item.to);
                      onClose();
                    }}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-smooth",
                        isActive ? "gradient-primary text-white shadow-glow" : "bg-sidebar-accent/40 text-sidebar-foreground group-hover:bg-sidebar-accent"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-start">{t(item.labelKey)}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Upgrade card */}
        <div className="m-3 overflow-hidden rounded-2xl gradient-primary p-4 text-white shadow-glow">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Pro plan</span>
          </div>
          <p className="mt-2 text-sm font-medium leading-snug">Unlock advanced analytics and unlimited courses.</p>
          <button className="mt-3 w-full rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-smooth hover:bg-white/25">
            Upgrade
          </button>
        </div>
      </aside>
    </>
  );
}
