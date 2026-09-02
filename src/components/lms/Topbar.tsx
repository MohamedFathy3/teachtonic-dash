/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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

import {
  Bell,
  Globe,
  Moon,
  Search,
  Sun,
  Menu,
  LogOut,
  User,
  Settings as SettingsIcon,
  Shield,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { AvatarBadge } from "@/components/lms/AvatarBadge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface TopbarProps {
  onToggleSidebar: () => void;
}

interface ExpiryData {
  expire_date: string | null;
  show_expire_message: boolean;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const {
    t,
    theme,
    toggleTheme,
    lang,
    setLang,
    role,
    user,
    logout,
  } = useApp();

  const navigate = useNavigate();
  
  // ✅ State لتاريخ الانتهاء
  const [expiryData, setExpiryData] = useState<ExpiryData | null>(null);
  const [loadingExpiry, setLoadingExpiry] = useState(false);

  // ✅ جلب تاريخ الانتهاء
  useEffect(() => {
    const fetchExpiryData = async () => {
      // فقط للمعلمين
      if (role !== 'teacher') return;
      
      setLoadingExpiry(true);
      try {
        const response = await api.get('/admin/check-auth');
        if (response.data?.data) {
          setExpiryData({
            expire_date: response.data.data.expire_date || null,
            show_expire_message: response.data.data.show_expire_message || false,
          });
        }
      } catch (error) {
        console.error('Failed to fetch expiry data:', error);
      } finally {
        setLoadingExpiry(false);
      }
    };

    fetchExpiryData();
  }, [role]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleIcon = () => {
    if (role === "admin") {
      return <Shield className="h-3.5 w-3.5" />;
    }
    return <GraduationCap className="h-3.5 w-3.5" />;
  };

  const getRoleBadgeClass = () => {
    if (role === "admin") {
      return `
        from-purple-500/20
        to-pink-500/20
        text-purple-300
        border-purple-500/20
      `;
    }
    return `
      from-blue-500/20
      to-cyan-500/20
      text-cyan-300
      border-cyan-500/20
    `;
  };

  // ✅ تنسيق التاريخ
  const formatExpiryDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (lang === 'ar') {
        return date.toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ✅ حساب الأيام المتبقية
  const getDaysRemaining = (dateStr: string | null): number | null => {
    if (!dateStr) return null;
    try {
      const expireDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = expireDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const daysRemaining = expiryData?.expire_date ? getDaysRemaining(expiryData.expire_date) : null;
  const isExpired = daysRemaining !== null && daysRemaining < 0;
  const isNearExpiry = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;

  // ✅ تحديد لون الخلفية حسب الحالة
  const getExpiryBadgeClass = () => {
    if (isExpired) {
      return "bg-red-500/20 border-red-500/40 text-red-400";
    }
    if (isNearExpiry) {
      return "bg-orange-500/20 border-orange-500/40 text-orange-400";
    }
    return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
  };

  // ✅ تحديد أيقونة حسب الحالة
  const getExpiryIcon = () => {
    if (isExpired) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    if (isNearExpiry) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  // ✅ نص الحالة
  const getExpiryStatusText = () => {
    if (isExpired) {
      return lang === 'ar' ? 'منتهي' : 'Expired';
    }
    if (isNearExpiry) {
      return lang === 'ar' ? 'ينتهي قريباً' : 'Expiring soon';
    }
    return lang === 'ar' ? 'ينتهي في' : 'Expires on';
  };

  const shouldShowExpiry = role === 'teacher' && expiryData?.show_expire_message && expiryData?.expire_date;

  return (
    <header
      className="
        sticky top-0 z-40
        border-b border-white/10
        bg-[#07111f]/70
        backdrop-blur-2xl
      "
    >
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 60, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
          className="
            absolute top-[-100px] left-[10%]
            w-[300px] h-[300px]
            rounded-full
            bg-orange-500/10
            blur-[100px]
          "
        />
      </div>

      <div
        className="
          relative z-10
          flex h-[78px]
          items-center gap-3
          px-4 sm:px-6
        "
      >
        {/* MOBILE MENU */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="lg:hidden"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="
              rounded-2xl
              border border-white/10
              bg-white/5
              text-white
              hover:bg-white/10
            "
          >
            <Menu className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* SEARCH */}
        <div className="relative hidden flex-1 max-w-xl md:block">
          <Search
            className="
              absolute start-4 top-1/2
              h-4 w-4 -translate-y-1/2
              text-gray-400
            "
          />

          <Input
            placeholder={t("search")}
            className="
              h-12 rounded-2xl
              border border-white/10
              bg-white/5
              ps-11
              text-white
              placeholder:text-gray-500
              backdrop-blur-xl

              focus-visible:ring-2
              focus-visible:ring-orange-500
              focus-visible:border-orange-500

              transition-all
            "
          />

          {/* SEARCH GLOW */}
          <div
            className="
              pointer-events-none
              absolute inset-0 rounded-2xl
              opacity-0 hover:opacity-100
              transition
              bg-gradient-to-r
              from-orange-500/5
              to-pink-500/5
            "
          />
        </div>

        <div className="flex-1 md:hidden" />

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">
          {/* ✅ EXPIRY BADGE - فقط للمعلمين */}
          {shouldShowExpiry && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                `
                  flex items-center gap-2
                  rounded-2xl
                  border
                  px-3 py-1.5
                  backdrop-blur-xl
                  relative
                  overflow-hidden
                `,
                getExpiryBadgeClass()
              )}
            >
              {/* ✅ تأثير الوميض (blink) */}
              <AnimatePresence>
                {(isExpired || isNearExpiry) && (
                  <motion.div
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="
                      absolute inset-0
                      bg-gradient-to-r
                      from-transparent
                      via-white/10
                      to-transparent
                      -skew-x-12
                    "
                  />
                )}
              </AnimatePresence>

              {/* ✅ أيقونة */}
              <div className="relative z-10">
                {getExpiryIcon()}
              </div>

              {/* ✅ النص */}
              <div className="relative z-10 flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-widest opacity-70">
                  {getExpiryStatusText()}
                </span>
                <span className="text-xs font-semibold">
                  {formatExpiryDate(expiryData.expire_date)}
                </span>
              </div>

              {/* ✅ عرض الأيام المتبقية */}
              {daysRemaining !== null && !isExpired && (
                <div className="relative z-10 flex items-center gap-1 bg-black/20 rounded-full px-2 py-0.5">
                  <span className="text-[10px] font-bold">
                    {daysRemaining}
                  </span>
                  <span className="text-[8px] uppercase opacity-60">
                    {lang === 'ar' ? 'يوم' : 'days'}
                  </span>
                </div>
              )}

              {/* ✅ عرض "منتهي" إذا انتهى */}
              {isExpired && (
                <div className="relative z-10 flex items-center gap-1 bg-red-500/20 rounded-full px-2 py-0.5">
                  <span className="text-[10px] font-bold uppercase">
                    {lang === 'ar' ? 'منتهي' : 'Expired'}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* ROLE BADGE */}
          <motion.div
            whileHover={{
              scale: 1.04,
            }}
            className={cn(
              `
                hidden lg:flex
                items-center gap-2
                rounded-2xl
                border
                px-4 py-2
                bg-gradient-to-r
                backdrop-blur-xl
              `,
              getRoleBadgeClass()
            )}
          >
            <div
              className="
                flex h-8 w-8
                items-center justify-center
                rounded-xl
                bg-white/10
              "
            >
              {getRoleIcon()}
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase tracking-widest opacity-70">
                {t("role")}
              </span>

              <span className="font-semibold text-sm">
                {role === "admin"
                  ? t("admin")
                  : t("instructor")}
              </span>
            </div>
          </motion.div>

          {/* LANGUAGE */}
          <motion.div
            whileHover={{
              rotate: 10,
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.9,
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setLang(lang === "en" ? "ar" : "en")
              }
              className="
                h-11 w-11 rounded-2xl
                border border-white/10
                bg-white/5
                text-white
                hover:bg-white/10
              "
            >
              <Globe className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* THEME */}
          <motion.div
            whileHover={{
              rotate: 15,
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.9,
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="
                h-11 w-11 rounded-2xl
                border border-white/10
                bg-white/5
                text-white
                hover:bg-white/10
              "
            >
              <AnimatePresence mode="wait">
                {theme === "light" ? (
                  <motion.div
                    key="moon"
                    initial={{
                      rotate: -90,
                      opacity: 0,
                    }}
                    animate={{
                      rotate: 0,
                      opacity: 1,
                    }}
                    exit={{
                      rotate: 90,
                      opacity: 0,
                    }}
                  >
                    <Moon className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{
                      rotate: -90,
                      opacity: 0,
                    }}
                    animate={{
                      rotate: 0,
                      opacity: 1,
                    }}
                    exit={{
                      rotate: 90,
                      opacity: 0,
                    }}
                  >
                    <Sun className="h-5 w-5 text-yellow-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* NOTIFICATIONS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.92,
                }}
                className="
                  relative
                  flex h-11 w-11
                  items-center justify-center
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  text-white
                  hover:bg-white/10
                "
              >
                <Bell className="h-5 w-5" />

                {/* badge */}
                <span
                  className="
                    absolute top-2 right-2
                    flex h-2.5 w-2.5
                  "
                >
                  <span
                    className="
                      absolute inline-flex
                      h-full w-full
                      animate-ping
                      rounded-full
                      bg-red-400
                      opacity-75
                    "
                  />

                  <span
                    className="
                      relative inline-flex
                      h-2.5 w-2.5
                      rounded-full
                      bg-red-500
                    "
                  />
                </span>
              </motion.button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="
                w-[360px]
                border border-white/10
                bg-[#0b1525]/95
                backdrop-blur-2xl
                text-white
              "
            >
              <DropdownMenuLabel
                className="
                  flex items-center gap-2
                  py-4
                "
              >
                <Sparkles className="w-4 h-4 text-orange-400" />
                {t("notifications")}
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-white/10" />

              {[
                {
                  title: "New Enrollment",
                  desc: "Sarah joined React Course",
                  time: "2m",
                },
                {
                  title: "Payment Received",
                  desc: "$129 from Ahmed",
                  time: "1h",
                },
                {
                  title: "Course Review",
                  desc: "New 5-Star review",
                  time: "3h",
                },
              ].map((n, i) => (
                <DropdownMenuItem
                  key={i}
                  className="
                    group
                    flex flex-col items-start gap-1
                    rounded-xl
                    py-4
                    focus:bg-white/5
                    cursor-pointer
                  "
                >
                  <div className="flex w-full items-center justify-between">
                    <p className="font-medium text-sm">
                      {n.title}
                    </p>

                    <span className="text-xs text-gray-500">
                      {n.time}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    {n.desc}
                  </p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* PROFILE */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{
                  scale: 1.04,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className="
                  ms-1
                  flex items-center gap-2
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  px-2 py-1.5
                  hover:bg-white/10
                  transition-all
                "
              >
                <AvatarBadge
                  initials={
                    user?.name?.charAt(0) || "U"
                  }
                  size="md"
                  variant="primary"
                />

                <div className="hidden md:flex flex-col text-left">
                  <span className="text-sm font-semibold text-white line-clamp-1">
                    {user?.name || "User"}
                  </span>

                  <span className="text-xs text-gray-400">
                    {role}
                  </span>
                </div>

                <ChevronDown className="hidden md:block h-4 w-4 text-gray-400" />
              </motion.button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="
                w-64
                border border-white/10
                bg-[#0b1525]/95
                backdrop-blur-2xl
                text-white
              "
            >
              <DropdownMenuLabel className="py-4">
                <div className="flex items-center gap-3">
                  <AvatarBadge
                    initials={
                      user?.name?.charAt(0) || "U"
                    }
                    size="md"
                    variant="primary"
                  />

                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {user?.name || "User"}
                    </span>

                    <span className="text-xs text-gray-400">
                      {user?.email ||
                        "user@example.com"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem
                className="
                  h-11 rounded-xl
                  focus:bg-white/5
                  cursor-pointer
                "
              >
                <User className="me-2 h-4 w-4" />
                {t("profile")}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="
                  h-11 rounded-xl
                  focus:bg-white/5
                  cursor-pointer
                "
              >
                <SettingsIcon className="me-2 h-4 w-4" />
                {t("settings")}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="
                  h-11 rounded-xl
                  text-red-400
                  focus:bg-red-500/10
                  cursor-pointer
                "
              >
                <LogOut className="me-2 h-4 w-4" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}