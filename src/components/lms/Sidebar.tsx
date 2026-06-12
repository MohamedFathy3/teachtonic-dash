/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Book,
  Star,
  Settings,
  ClipboardList,
  FileEdit,
  Globe2,
  X,
  Sparkles,
  ChevronDown,
  Layout,
  Info,
  FileText,
  TagIcon,
  Layers3,
} from "lucide-react";

import { TranslationKey } from "@/i18n/translations";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/assets/1.png";

interface NavItem {
  to: string;
  labelKey: TranslationKey;
  icon: any;
}

// Website items - show only for Admin
const websiteItems: NavItem[] = [
  { to: "hero", labelKey: "hero", icon: Layout },
  { to: "about", labelKey: "about", icon: Info },
  { to: "features", labelKey: "features", icon: Star },
  { to: "footer", labelKey: "footer", icon: FileText },
];

const adminNav: NavItem[] = [
  { to: "dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { to: "stage", labelKey: "stage", icon: GraduationCap },
  { to: "subject", labelKey: "subject", icon: Book },
  { to: "instructors", labelKey: "instructors", icon: GraduationCap },
  { to: "AssistantInstructors", labelKey: "AssistantInstructors", icon: GraduationCap },
  { to: "courses", labelKey: "courses", icon: BookOpen },
  { to: "reviews", labelKey: "reviews", icon: Star },
  // { to: "settings", labelKey: "settings", icon: Settings },
];

const instructorNav: NavItem[] = [
  { to: "dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { to: "semesters", labelKey: "semesters", icon: GraduationCap },
  { to: "my-courses", labelKey: "myCourses", icon: BookOpen },
  // { to: "redeem-requests", labelKey: "redeemRequests", icon: Sparkles },
  { to: "students", labelKey: "students", icon: Users },
  { to: "exams", labelKey: "exams", icon: ClipboardList },
  { to: "bank-questions", labelKey: "bankQuestions", icon: ClipboardList },
  { to: "center-hours", labelKey: "centerhours", icon: TagIcon },
  { to: "books", labelKey: "books", icon: BookOpen },
  { to: "payment-codes", labelKey: "paymentCodes", icon: TagIcon },
  { to: "assignments", labelKey: "assignments", icon: FileEdit },
];

interface SidebarProps {
  active: string;
  onNavigate: (to: string) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ active, onNavigate, open, onClose }: SidebarProps) {
  const { t, role } = useApp();
  const [websiteOpen, setWebsiteOpen] = useState(true);

  const items = role === "admin" ? adminNav : instructorNav;
  const isAdmin = role === "admin";

  return (
    <>
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside
        className={cn(
          `
          fixed inset-y-0 z-50
          flex flex-col
          w-[290px]
          transition-all duration-300
          border-r border-white/10
          bg-white/80 dark:bg-[#07111f]/95
          backdrop-blur-3xl
          shadow-[0_0_80px_rgba(255,140,0,0.05)]
          lg:sticky lg:translate-x-0
        `,
          open ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"
        )}
      >
        {/* BACKGROUND EFFECTS */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:22px_22px]" />
          
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute -top-[200px] -left-[200px] w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[120px]"
          />

          <motion.div
            animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
            transition={{ duration: 16, repeat: Infinity }}
            className="absolute -bottom-[200px] -right-[200px] w-[450px] h-[450px] rounded-full bg-purple-500/10 blur-[140px]"
          />
        </div>

        {/* HEADER WITH LOGO ONLY */}
        <div className="relative z-10 h-20 px-5 flex items-center justify-between border-b border-black/5 dark:border-white/10">
          <img
            src={Logo}
            alt="Teachtomic logo"
            className="w-full h-full object-contain"
          />

          <button
            onClick={onClose}
            className="lg:hidden w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1.5">
            {items.map((item, index) => {
              const Icon = item.icon;
              const isActive = active === item.to;

              return (
                <motion.button
                  key={item.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(item.to)}
                  className={cn(
                    `relative group w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 overflow-hidden`,
                    isActive
                      ? `bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-[0_10px_40px_rgba(249,115,22,.35)]`
                      : `text-gray-700 dark:text-gray-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]`
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebar"
                      className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500"
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-3 w-full">
                    <div
                      className={cn(
                        `w-10 h-10 rounded-xl flex items-center justify-center transition-all`,
                        isActive
                          ? "bg-white/20"
                          : `bg-black/[0.04] dark:bg-white/[0.06] group-hover:bg-orange-500/10`
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <span className="font-semibold text-sm flex-1 text-start">
                      {t(item.labelKey)}
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="dot"
                        className="w-2 h-2 rounded-full bg-white"
                      />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* WEBSITE SECTION - SHOW ONLY FOR ADMIN */}
          {isAdmin && (
            <div className="mt-6">
              <button
                onClick={() => setWebsiteOpen(!websiteOpen)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-gray-800 dark:text-white"
              >
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-sm">
                    {t("website") || "Website"}
                  </span>
                </div>

                <motion.div animate={{ rotate: websiteOpen ? 180 : 0 }}>
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {websiteOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-1 pl-3">
                      {websiteItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = active === item.to;

                        return (
                          <motion.button
                            key={item.to}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.04 }}
                            whileHover={{ x: 4 }}
                            onClick={() => onNavigate(item.to)}
                            className={cn(
                              `w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300`,
                              isActive
                                ? `bg-orange-500/10 text-orange-500 border border-orange-500/20`
                                : `text-gray-700 dark:text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]`
                            )}
                          >
                            <div
                              className={cn(
                                `w-9 h-9 rounded-xl flex items-center justify-center`,
                                isActive
                                  ? "bg-orange-500 text-white"
                                  : `bg-black/[0.04] dark:bg-white/[0.04]`
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">
                              {t(item.labelKey)}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* FOOTER */}
        <div className="relative z-10 p-4 border-t border-black/5 dark:border-white/10">
          <div className="rounded-2xl p-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Layers3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  LMS Dashboard
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Modern Education Platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}