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
  },
  error: {
    bg: "from-red-500 to-rose-600",
    shadow: "shadow-red-500/30",
    icon: "text-red-500",
    ring: "ring-red-500/20",
  },
  warning: {
    bg: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/30",
    icon: "text-amber-500",
    ring: "ring-amber-500/20",
  },
  info: {
    bg: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/30",
    icon: "text-blue-500",
    ring: "ring-blue-500/20",
  },
};

export function Toaster() {
  const { toasts, dismiss } = useToast(); // ✅ استدعاء dismiss
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ToastProvider>
      <AnimatePresence mode="sync">
        {toasts.map(({ id, title, description, action, variant = "success", ...props }) => {
          const Icon = ICONS[variant as keyof typeof ICONS] || ICONS.info;
          const colors = COLORS[variant as keyof typeof COLORS] || COLORS.info;
          const isDark = document.documentElement.classList.contains('dark');

          // ✅ دالة إغلاق الـ Toast
          const handleDismiss = () => {
            dismiss(id);
          };

          return (
            <motion.div
              key={id}
              initial={{ 
                opacity: 0,
                scale: 0.9,
                y: 30,
              }}
              animate={{ 
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{ 
                opacity: 0,
                scale: 0.9,
                y: -30,
                transition: { duration: 0.2 }
              }}
              transition={{ 
                type: "spring",
                damping: 20,
                stiffness: 300,
                duration: 0.4
              }}
              className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none"
            >
              {/* ✅ خلفية مظللة مع Blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
                onClick={handleDismiss} // ✅ إغلاق عند الضغط على الخلفية
              />

              {/* ✅ الـ Toast - بدون Border */}
              <motion.div
                className={`
                  relative pointer-events-auto
                  w-[90%] max-w-sm mx-auto
                  rounded-3xl
                  bg-white dark:bg-gray-900
                  shadow-2xl ${colors.shadow}
                  ring-1 ${colors.ring}
                  overflow-hidden
                  transition-all duration-300
                `}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", damping: 20 }}
                onClick={(e) => e.stopPropagation()} // ✅ منع انتشار الضغط للخلفية
              >
                {/* ✅ شريط علوي ملون */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${colors.bg}`} />

                <div className="p-6 flex flex-col items-center text-center">
                  {/* ✅ أيقونة كبيرة مع خلفية دائرية */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring",
                      damping: 15,
                      stiffness: 200,
                      delay: 0.1
                    }}
                    className={`
                      w-20 h-20 rounded-full 
                      flex items-center justify-center
                      bg-gradient-to-br from-gray-50 to-gray-100
                      dark:from-gray-800 dark:to-gray-700
                      shadow-inner
                      mb-4
                    `}
                  >
                    <Icon className={`w-10 h-10 ${colors.icon}`} strokeWidth={1.5} />
                  </motion.div>

                  {/* ✅ العنوان */}
                  {title && (
                    <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {title}
                    </div>
                  )}

                  {/* ✅ الوصف */}
                  {description && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                      {description}
                    </div>
                  )}

                  {/* ✅ الأكشن */}
                  {action && (
                    <div className="mt-4">
                      {action}
                    </div>
                  )}

                  {/* ✅ زر الإغلاق */}
                  <button
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    onClick={handleDismiss} // ✅ إغلاق مباشر
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
      <ToastViewport />
    </ToastProvider>
  );
}