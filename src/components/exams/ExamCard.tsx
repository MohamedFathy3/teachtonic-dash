// src/components/exams/ExamCard.tsx

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Edit2, Trash2, RefreshCw, Power, PowerOff, 
  Clock, FileText, Users, Calendar, CheckCircle, XCircle,
  MoreHorizontal, Sparkles, Trophy, Star, Zap, Award
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/AppContext';
import type { Exam } from '@/types/exam.types';
import { motion, AnimatePresence } from 'framer-motion';

interface ExamCardProps {
  exam: Exam;
  onView?: (exam: Exam) => void;
  onEdit?: (exam: Exam) => void;
  onDelete?: (exam: Exam) => void;
  onRestore?: (exam: Exam) => void;
  onForceDelete?: (exam: Exam) => void;
  onToggleActive?: (exam: Exam) => void;
  onAddQuestions?: (exam: Exam) => void;
  onTakeExam?: (exam: Exam) => void;
  isDeleted?: boolean;
  showActions?: boolean;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onForceDelete,
  onToggleActive,
  onAddQuestions,
  onTakeExam,
  isDeleted = false,
  showActions = true,
}) => {
  const { t, lang } = useApp();
  const isRTL = lang === 'ar';
  const [isHovered, setIsHovered] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  const title = isRTL && exam.title_ar ? exam.title_ar : exam.title;
  const description = isRTL && exam.description_ar ? exam.description_ar : exam.description;

  // Random gradient for each card based on exam id
  const gradients = [
    "from-purple-500/20 to-pink-500/20",
    "from-blue-500/20 to-cyan-500/20",
    "from-green-500/20 to-emerald-500/20",
    "from-orange-500/20 to-red-500/20",
    "from-indigo-500/20 to-violet-500/20",
  ];
  const gradientIndex = exam.id % gradients.length;
  const bgGradient = gradients[gradientIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 15 }
      }}
      onHoverStart={() => {
        setIsHovered(true);
        setIsGlowing(true);
        setTimeout(() => setIsGlowing(false), 300);
      }}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={isGlowing ? {
          boxShadow: [
            "0 0 0 0 rgba(99, 102, 241, 0)",
            "0 0 0 20px rgba(99, 102, 241, 0.3)",
            "0 0 0 0 rgba(99, 102, 241, 0)"
          ]
        } : {}}
        transition={{ duration: 0.5 }}
      >
        <Card className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 backdrop-blur-sm ${
          isDeleted 
            ? 'bg-gradient-to-br from-red-950/20 to-red-900/10 border-red-500/30' 
            : `bg-gradient-to-br ${bgGradient} border-white/20 hover:border-primary/50`
        } shadow-xl hover:shadow-2xl`}>
          
          {/* Animated Background Particles */}
          <AnimatePresence>
            {isHovered && !isDeleted && (
              <>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
                />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.4 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: 0.1 }}
                  className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"
                />
              </>
            )}
          </AnimatePresence>

          {/* Decorative floating stars */}
          <motion.div
            className="absolute top-3 left-3 opacity-30"
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          </motion.div>
          
          <motion.div
            className="absolute bottom-3 right-3 opacity-30"
            animate={{ 
              rotate: -360,
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkles className="h-3 w-3 text-primary" />
          </motion.div>

          {/* Image Section with Parallax */}
          <motion.div 
            className="relative h-36 overflow-hidden"
            animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${bgGradient}`} />
            {exam.image?.fullUrl || exam.imageUrl ? (
              <motion.img
                src={exam.image?.fullUrl || exam.imageUrl}
                alt={title}
                className="h-full w-full object-cover"
                animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                animate={isHovered ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                <FileText className="h-14 w-14 text-white/30" />
              </motion.div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Status Badge with Animation */}
            <motion.div 
              className="absolute top-3 end-3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
              whileHover={{ scale: 1.1 }}
            >
              {isDeleted ? (
                <Badge variant="destructive" className="gap-2 px-3 py-1 rounded-full shadow-lg">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </motion.div>
                  {t('deleted')}
                </Badge>
              ) : (
                <motion.div
                  animate={exam.active === 1 ? {
                    boxShadow: ["0 0 0 0 rgba(34, 197, 94, 0.7)", "0 0 0 8px rgba(34, 197, 94, 0)"],
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Badge 
                    variant={exam.active === 1 ? "default" : "secondary"} 
                    className={`gap-2 px-3 py-1 rounded-full shadow-lg ${
                      exam.active === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : ''
                    }`}
                  >
                    {exam.active === 1 ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </motion.div>
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {exam.active === 1 ? t('active') : t('inactive')}
                  </Badge>
                </motion.div>
              )}
            </motion.div>

            {/* Quick Stats Overlay with Animation */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-around text-white text-xs">
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.1 }}
                >
                  <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="font-semibold">{exam.total_marks}</span>
                  <span className="text-white/70">{t('marks')}</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.1 }}
                >
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  <span className="font-semibold">{exam.duration_minutes}</span>
                  <span className="text-white/70">{t('min')}</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Content Section */}
          <motion.div 
            className="p-5 relative z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <motion.div>
              <motion.h3 
                className="font-bold text-lg line-clamp-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                animate={isHovered ? { x: 5 } : { x: 0 }}
              >
                {title}
              </motion.h3>
              {description && (
                <motion.p 
                  className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed"
                  animate={isHovered ? { opacity: 0.8 } : { opacity: 1 }}
                >
                  {description}
                </motion.p>
              )}
            </motion.div>
            
            <motion.div 
              className="mt-4 flex items-center justify-between text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="flex items-center gap-2 text-muted-foreground"
                whileHover={{ scale: 1.05 }}
              >
                <Calendar className="h-3 w-3" />
                <span>{new Date(exam.created_at || Date.now()).toLocaleDateString()}</span>
              </motion.div>
              
              {/* Floating action indicator on hover */}
              <AnimatePresence>
                {isHovered && !isDeleted && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-1 text-primary"
                  >
                    <Zap className="h-3 w-3" />
                    <span className="text-xs">Ready!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Actions Buttons with Awesome Animations */}
            {showActions && (
              <motion.div 
                className="mt-5 flex gap-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {!isDeleted ? (
                  <>
                    <motion.div 
                      className="flex-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        className="w-full h-9 gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg rounded-xl text-xs font-semibold"
                        onClick={() => onTakeExam?.(exam)}
                      >
                        <motion.div
                          animate={isHovered ? { x: [0, 3, 0] } : {}}
                          transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
                        >
                          <Zap className="h-3.5 w-3.5" />
                        </motion.div>
                        {t('takeExam')}
                      </Button>
                    </motion.div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl border-2">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl p-1 min-w-[180px]">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <DropdownMenuItem 
                            onClick={() => onView?.(exam)}
                            className="rounded-lg cursor-pointer gap-3 py-2"
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                            {t('view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onAddQuestions?.(exam)}
                            className="rounded-lg cursor-pointer gap-3 py-2"
                          >
                            <FileText className="h-4 w-4 text-green-500" />
                            {t('addQuestions')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onEdit?.(exam)}
                            className="rounded-lg cursor-pointer gap-3 py-2"
                          >
                            <Edit2 className="h-4 w-4 text-yellow-500" />
                            {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onToggleActive?.(exam)}
                            className="rounded-lg cursor-pointer gap-3 py-2"
                          >
                            {exam.active === 1 ? (
                              <PowerOff className="h-4 w-4 text-orange-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                            {exam.active === 1 ? t('deactivate') : t('activate')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete?.(exam)}
                            className="rounded-lg cursor-pointer gap-3 py-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t('delete')}
                          </DropdownMenuItem>
                        </motion.div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <motion.div 
                    className="flex gap-2 w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    <motion.div 
                      className="flex-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2 text-green-600 border-green-500/50 hover:bg-green-50 rounded-xl"
                        onClick={() => onRestore?.(exam)}
                      >
                        <motion.div
                          animate={{ rotate: [0, 180, 360] }}
                          transition={{ duration: 0.5 }}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </motion.div>
                        {t('restore')}
                      </Button>
                    </motion.div>
                    <motion.div 
                      className="flex-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2 text-red-600 border-red-500/50 hover:bg-red-50 rounded-xl"
                        onClick={() => onForceDelete?.(exam)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('permanentDelete')}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Animated Border on Hover */}
          <AnimatePresence>
            {isHovered && !isDeleted && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent)",
                  }}
                  animate={{
                    x: [-200, 200],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
};