import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Globe, Moon, Search, Sun, Menu, ChevronDown, LogOut, User, Settings as SettingsIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AvatarBadge } from "@/components/lms/AvatarBadge";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { t, theme, toggleTheme, lang, setLang, role, setRole } = useApp();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("search")}
          className="h-10 ps-10 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-border rounded-xl"
        />
      </div>

      <div className="flex flex-1 md:flex-none" />

      <div className="flex items-center gap-1">
        {/* Role switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl hidden sm:flex">
              <span className="text-xs text-muted-foreground">{t("role")}:</span>
              <span className="font-semibold capitalize">{t(role)}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{t("switchRole")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setRole("admin")}>👑 {t("admin")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRole("instructor")}>🎓 {t("instructor")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language */}
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setLang(lang === "en" ? "ar" : "en")} aria-label="Toggle language">
          <Globe className="h-5 w-5" />
        </Button>

        {/* Theme */}
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="h-5 w-5" />
              <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{t("notifications")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { title: "New enrollment", desc: "Sarah enrolled in React Patterns", time: "2m" },
              { title: "Payment received", desc: "$129 from Priya Patel", time: "1h" },
              { title: "Course review", desc: "Diego left a 5-star review", time: "3h" },
            ].map((n, i) => (
              <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 py-3">
                <div className="flex w-full items-center justify-between">
                  <p className="text-sm font-medium">{n.title}</p>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ms-1 rounded-full ring-2 ring-transparent transition-smooth hover:ring-primary/30">
              <AvatarBadge initials="AM" size="md" variant="primary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">Ahmed M.</span>
                <span className="text-xs font-normal text-muted-foreground">ahmed@eduflow.app</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><User className="me-2 h-4 w-4" />{t("profile")}</DropdownMenuItem>
            <DropdownMenuItem><SettingsIcon className="me-2 h-4 w-4" />{t("settings")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive"><LogOut className="me-2 h-4 w-4" />{t("logout")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
