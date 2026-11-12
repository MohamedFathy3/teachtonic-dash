/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ReactNode, useEffect, useState } from "react";

import { Sidebar } from "@/components/lms/Sidebar";
import { Topbar } from "@/components/lms/Topbar";

interface DashboardLayoutProps {
  active: string;
  onNavigate: (to: string) => void;
  children: ReactNode;
}

export function DashboardLayout({
  active,
  onNavigate,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);

    const checkTheme = () => {
      const html = document.documentElement;

      if (
        html.classList.contains("dark") ||
        localStorage.getItem("lms-theme") === "dark"
      ) {
        setIsDark(true);
      } else {
        setIsDark(false);
      }
    };

    checkTheme();

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }

    const observer = new MutationObserver(checkTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  // دالة للتعامل مع الضغط على الروابط
  const handleNavigate = (to: string) => {
    onNavigate(to);
    // غلق السايد بار على الموبايل بعد الضغط
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div
      className={`
        relative flex min-h-screen overflow-hidden
        ${
          isDark
            ? "bg-[#050816]"
            : "bg-gradient-to-br from-[#f8fafc] via-white to-orange-50"
        }
      `}
    >
      {/* Static background: no infinite animations or large GPU blur surfaces. */}
      <div className="pointer-events-none absolute inset-0 bg-black/[0.02] dark:bg-white/[0.02]" />

      {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="
              fixed inset-0 z-40
              bg-black/50
              lg:hidden
            "
          />
        )}

      {/* DESKTOP SIDEBAR */}
      <div
        style={{ width: sidebarOpen ? 280 : 92 }}
        className={`
          relative z-50 hidden lg:flex
          border-r
          ${
            isDark
              ? `
                border-white/10
                bg-white/5
                shadow-sm
                shadow-sm
              `
              : `
                border-black/5
                bg-white/80
                shadow-sm
                shadow-sm
              `
          }
        `}
      >
        <Sidebar
          active={active}
          onNavigate={handleNavigate}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* MOBILE SIDEBAR */}
        {sidebarOpen && (
          <div
            className={`
              fixed top-0 left-0 bottom-0 z-50
              w-[280px]
              border-r lg:hidden
              ${
                isDark
                  ? `
                    border-white/10
                    bg-[#07111f]/95
                    shadow-sm
                  `
                  : `
                    border-black/5
                    bg-white/90
                    shadow-sm
                  `
              }
            `}
          >
            <Sidebar
              active={active}
              onNavigate={handleNavigate}
              open={true}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        )}

      {/* MAIN */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* TOPBAR */}
        <div
          className={`
            sticky top-0 z-30
            border-b
            ${
              isDark
                ? `
                  border-white/10
                  bg-[#07111f]

                `
                : `
                  border-black/5
                  bg-white

                  shadow-sm
                `
            }
          `}
        >
          <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* PAGE */}
        <main className="relative flex-1 overflow-hidden">
          {/* No animated inner glow: keep scrolling and repainting cheap. */}

          {/* CONTENT */}
          <div
            className="
              relative z-10
              p-4 sm:p-6 lg:p-8
            "
          >
            <div
              className={`
                rounded-[32px]
                border
                p-5 sm:p-6 lg:p-8
                ${
                  isDark
                    ? `
                      border-white/10
                      bg-white/5

                      shadow-sm
                    `
                    : `
                      border-black/5
                      bg-white

                      shadow-sm
                    `
                }
              `}
            >
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
