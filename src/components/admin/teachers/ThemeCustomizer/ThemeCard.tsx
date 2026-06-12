// ==================== src/components/admin/teachers/components/ThemeCustomizer/ThemeCard.tsx (المُصَحح) ====================
import { CheckCircle, Globe, Users, BookOpen, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ThemeConfig } from '@/hooks/useTeacherTheme';

interface ThemeCardProps {
  theme: ThemeConfig;
  isActive: boolean;
  onClick: () => void;
}

export const ThemeCard = ({ theme, isActive, onClick }: ThemeCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 300 }}
    className={`group cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
      isActive 
        ? 'border-primary shadow-xl shadow-primary/20 bg-gradient-to-br from-primary/5 to-transparent' 
        : 'border-border hover:border-primary/40 hover:shadow-lg'
    }`}
    onClick={onClick}
  >
    {/* Preview Header */}
    <div className="relative h-36 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
      </div>
      
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Award className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-medium opacity-90">Teacher</p>
              <p className="text-white text-[10px] opacity-70">Online Academy</p>
            </div>
          </div>
          <Globe className="h-4 w-4 text-white/70" />
        </div>
        
        <div className="mt-3">
          <div className="h-1.5 w-16 bg-white/30 rounded-full" />
          <div className="h-1.5 w-24 bg-white/20 rounded-full mt-1.5" />
        </div>
        
        <div className="flex gap-2 mt-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-white/30 border border-white/40" />
            ))}
          </div>
          <div className="flex gap-1">
            <BookOpen className="h-3 w-3 text-white/70" />
            <Users className="h-3 w-3 text-white/70" />
          </div>
        </div>
      </div>
    </div>
    
    {/* Theme Info */}
    <div className="p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg">{theme.label}</h3>
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold"
          >
            ACTIVE
          </motion.div>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {theme.description}
      </p>
      
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {theme.colors.map((color, i) => (
              <div 
                key={i} 
                className="w-6 h-6 rounded-full border-2 border-background shadow-sm transition-transform group-hover:scale-110" 
                style={{ backgroundColor: color }} 
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Color Palette</span>
        </div>
        
        {!isActive && (
          <div className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Click to activate →
          </div>
        )}
      </div>
    </div>
  </motion.div>
);