/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    console.log("📱 DashboardLayout - Navigating to:", to);
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
        transition-all duration-500
        ${
          isDark
            ? "bg-[#050816]"
            : "bg-gradient-to-br from-[#f8fafc] via-white to-orange-50"
        }
      `}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        {/* GRID */}
        <div
          className={`
            absolute inset-0 opacity-[0.05]
            bg-[radial-gradient(#000000_1px,transparent_1px)]
            dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)]
            bg-[length:24px_24px]
          `}
        />

        {/* GLOW 1 */}
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
          }}
          className={`
            absolute top-[-250px] left-[-250px]
            w-[600px] h-[600px]
            rounded-full blur-[160px]
            ${
              isDark
                ? "bg-orange-500/20"
                : "bg-orange-300/30"
            }
          `}
        />

        {/* GLOW 2 */}
        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
          }}
          className={`
            absolute bottom-[-300px] right-[-300px]
            w-[700px] h-[700px]
            rounded-full blur-[180px]
            ${
              isDark
                ? "bg-purple-500/20"
                : "bg-pink-300/30"
            }
          `}
        />
      </div>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="
              fixed inset-0 z-40
              bg-black/50 backdrop-blur-sm
              lg:hidden
            "
          />
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 92,
        }}
        transition={{
          duration: 0.35,
          ease: "easeInOut",
        }}
        className={`
          relative z-50 hidden lg:flex
          border-r transition-all duration-500
          ${
            isDark
              ? `
                border-white/10
                bg-white/5
                backdrop-blur-3xl
                shadow-[0_0_50px_rgba(255,140,0,0.06)]
              `
              : `
                border-black/5
                bg-white/80
                backdrop-blur-3xl
                shadow-[0_10px_40px_rgba(0,0,0,0.06)]
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
      </motion.div>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 260,
            }}
            className={`
              fixed top-0 left-0 bottom-0 z-50
              w-[280px]
              border-r lg:hidden
              ${
                isDark
                  ? `
                    border-white/10
                    bg-[#07111f]/95
                    backdrop-blur-3xl
                  `
                  : `
                    border-black/5
                    bg-white/90
                    backdrop-blur-3xl
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* TOPBAR */}
        <div
          className={`
            sticky top-0 z-30
            border-b transition-all duration-500
            ${
              isDark
                ? `
                  border-white/10
                  bg-[#07111f]/70
                  backdrop-blur-2xl
                `
                : `
                  border-black/5
                  bg-white/70
                  backdrop-blur-2xl
                  shadow-sm
                `
            }
          `}
        >
          <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* PAGE */}
        <main className="relative flex-1 overflow-hidden">
          {/* INNER GLOW */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
              className={`
                absolute top-0 right-0
                w-[400px] h-[400px]
                rounded-full blur-[120px]
                ${
                  isDark
                    ? "bg-orange-500/10"
                    : "bg-orange-200/40"
                }
              `}
            />
          </div>

          {/* CONTENT */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="
              relative z-10
              p-4 sm:p-6 lg:p-8
            "
          >
            <div
              className={`
                rounded-[32px]
                border transition-all duration-500
                p-5 sm:p-6 lg:p-8
                ${
                  isDark
                    ? `
                      border-white/10
                      bg-white/5
                      backdrop-blur-2xl
                      shadow-[0_0_80px_rgba(255,140,0,0.05)]
                    `
                    : `
                      border-black/5
                      bg-white/70
                      backdrop-blur-2xl
                      shadow-[0_10px_50px_rgba(0,0,0,0.08)]
                    `
                }
              `}
            >
              {children}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}