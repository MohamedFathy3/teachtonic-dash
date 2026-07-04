// components/ui/toaster.tsx

import { useToast } from "@/hooks/use-toast";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const COLORS = {
  success: {
    bg: "from-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-500/30",
    icon: "text-emerald-500",
    ring: "ring-emerald-500/20",
    border: "border-emerald-500/20",
  },
  error: {
    bg: "from-red-500 to-rose-600",
    shadow: "shadow-red-500/30",
    icon: "text-red-500",
    ring: "ring-red-500/20",
    border: "border-red-500/20",
  },
  warning: {
    bg: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/30",
    icon: "text-amber-500",
    ring: "ring-amber-500/20",
    border: "border-amber-500/20",
  },
  info: {
    bg: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/30",
    icon: "text-blue-500",
    ring: "ring-blue-500/20",
    border: "border-blue-500/20",
  },
};

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ToastProvider>
      {/* ✅ حاوية الـ Toasts في الجنب الأيمن تحت */}
      <div className="fixed bottom-4 right-4 z-[999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="sync">
          {toasts.map(({ id, title, description, action, variant = "success", ...props }) => {
            const Icon = ICONS[variant as keyof typeof ICONS] || ICONS.info;
            const colors = COLORS[variant as keyof typeof COLORS] || COLORS.info;

            return (
              <motion.div
                key={id}
                initial={{ 
                  opacity: 0,
                  x: 100, // ✅ تدخل من اليمين
                  scale: 0.95,
                }}
                animate={{ 
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{ 
                  opacity: 0,
                  x: 100,
                  scale: 0.95,
                  transition: { duration: 0.2 }
                }}
                transition={{ 
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  duration: 0.4
                }}
                className="pointer-events-auto w-full"
              >
                {/* ✅ الـ Toast كـ notification عادي */}
                <motion.div
                  className={`
                    relative
                    bg-white dark:bg-gray-900
                    rounded-2xl
                    shadow-2xl shadow-black/10 dark:shadow-black/40
                    border ${colors.border}
                    overflow-hidden
                    transition-all duration-300
                  `}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", damping: 20 }}
                >
                  {/* ✅ شريط علوي ملون صغير */}
                  <div className={`h-1 w-full bg-gradient-to-r ${colors.bg}`} />

                  <div className="p-4 flex items-start gap-3">
                    {/* ✅ أيقونة صغيرة */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring",
                        damping: 15,
                        stiffness: 200,
                        delay: 0.1
                      }}
                      className="flex-shrink-0 mt-0.5"
                    >
                      <Icon className={`w-5 h-5 ${colors.icon}`} strokeWidth={2} />
                    </motion.div>

                    {/* ✅ المحتوى */}
                    <div className="flex-1 min-w-0">
                      {title && (
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {title}
                        </div>
                      )}
                      {description && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 break-words">
                          {description}
                        </div>
                      )}
                      {action && (
                        <div className="mt-2">
                          {action}
                        </div>
                      )}
                    </div>

                    {/* ✅ زر الإغلاق */}
                    <button
                      className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      onClick={() => dismiss(id)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* ✅ شريط تقدم متحرك */}
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ 
                      duration: (props.duration || 5000) / 1000,
                      ease: "linear"
                    }}
                    className={`
                      absolute bottom-0 left-0 h-1
                      bg-gradient-to-r ${colors.bg}
                    `}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}