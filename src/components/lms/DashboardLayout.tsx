import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/lms/Sidebar";
import { Topbar } from "@/components/lms/Topbar";

interface DashboardLayoutProps {
  active: string;
  onNavigate: (to: string) => void;
  children: ReactNode;
}

export function DashboardLayout({ active, onNavigate, children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar active={active} onNavigate={onNavigate} open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleSidebar={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
