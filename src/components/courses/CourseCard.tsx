// src/components/courses/CourseCard.tsx

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Star, Users, DollarSign, Eye, Edit, Trash2,
  RefreshCw, Archive, Power, PowerOff, CheckCircle, XCircle,
  Percent, Clock, Calendar, TrendingDown, Gift, Zap, Flame
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { Course } from '@/types/course.types';
import { motion } from 'framer-motion';
import { Switch } from '../ui/switch';
import { Progress } from '@/components/ui/progress';

interface CourseCardProps {
  course: Course;
  onView?: (course: Course) => void;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onRestore?: (course: Course) => void;
  onForceDelete?: (course: Course) => void;
  onToggleActive?: (course: Course) => void;
  onToggleStar?: (course: Course) => void;
  handleactivecourese?: (course: Course) => void;
  showActions?: boolean;
  isDeleted?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onForceDelete,
  onToggleActive,
  onToggleStar,
  handleactivecourese,
  showActions = true,
  isDeleted = false,
}) => {
  const { t, lang } = useApp();
  const isRTL = lang === 'ar';
  const [isHovered, setIsHovered] = useState(false);

  const title = isRTL ? course.title_ar : course.title;
  const description = isRTL ? course.description_ar : course.description;
  const subjectName = isRTL ? course.subject?.name_ar : course.subject?.name;
  const stageName = isRTL ? course.stage?.name_ar : course.stage?.name;
  const semesterName = isRTL ? course.semester?.name_ar : course.semester?.name;

  const isStarEnabled = course.star === 1;
  const hasDiscount = parseFloat(course.discount) > 0;
  const discountPercent = parseFloat(course.discount);
  const originalPrice = parseFloat(course.original_price || course.price);
  const finalPrice = parseFloat(course.price);
  const savedAmount = originalPrice - finalPrice;

  // حساب نسبة الإكمال (مثال - ممكن تعدل حسب منطقك)
  const completionRate = course.details?.length > 0 
    ? Math.min(100, Math.floor((course.details.filter((d: any) => d.attended).length / course.details.length) * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isDeleted ? 'bg-muted/30 border-red-200/50' : 'hover:shadow-xl'
        }`}>
        {/* Course Image */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-900 to-gray-800">
          {course.image?.fullUrl || course.imageUrl ? (
            <img
              src={course.image?.fullUrl || course.imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white/20" />
            </div>
          )}

          {/* ✅ Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* ✅ Badges Row - Top */}
          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
            {/* Star Featured Badge */}
            {isStarEnabled && (
              <Badge className="gap-1 bg-yellow-500 text-white border-none shadow-lg">
                <Star className="h-3 w-3 fill-white" />
                {lang === 'ar' ? 'مميز' : 'Featured'}
              </Badge>
            )}

            {/* Discount Badge */}
            {hasDiscount && !isDeleted && (
              <Badge className="gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white border-none shadow-lg">
                <Percent className="h-3 w-3" />
                -{discountPercent}% OFF
              </Badge>
            )}

            {/* Offer Badge (من العرض) */}
            {course.offer_id && !isDeleted && (
              <Badge className="gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-lg">
                <Gift className="h-3 w-3" />
                {lang === 'ar' ? 'عرض خاص' : 'Special Offer'}
              </Badge>
            )}
          </div>

          {/* Status Badge - Top Right */}
          <div className="absolute top-3 right-3">
            {isDeleted ? (
              <Badge variant="destructive" className="gap-1 shadow-lg">
                <Archive className="h-3 w-3" />
                {t('deleted')}
              </Badge>
            ) : (
              <Badge variant={course.active === 1 ? "default" : "secondary"} className={`gap-1 shadow-lg ${course.active === 1 ? 'bg-green-500' : 'bg-gray-500'}`}>
                {course.active === 1 ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {course.active === 1 ? t('active') : t('inactive')}
              </Badge>
            )}
          </div>

          {/* ✅ Price Badge - Bottom Left */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/70 backdrop-blur-md rounded-xl px-3 py-1.5">
              {hasDiscount ? (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 line-through">
                    {originalPrice.toLocaleString()} EGP
                  </span>
                  <span className="text-lg font-bold text-white">
                    {finalPrice.toLocaleString()} EGP
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-white">
                  {finalPrice.toLocaleString()} EGP
                </span>
              )}
            </div>
          </div>

          {/* ✅ Type Badge - Bottom Right */}
          <div className="absolute bottom-3 right-3">
            <Badge variant="outline" className="bg-black/50 text-white border-white/20 backdrop-blur-sm gap-1">
              {course.type === 'online' ? (
                <>
                  <Zap className="h-3 w-3 text-blue-400" />
                  {lang === 'ar' ? 'أونلاين' : 'Online'}
                </>
              ) : (
                <>
                  <Users className="h-3 w-3 text-green-400" />
                  {lang === 'ar' ? 'سنتر' : 'Center'}
                </>
              )}
            </Badge>
          </div>

          {/* Actions Menu - appears on hover */}
          {showActions && isHovered && (
            <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} flex gap-1 flex-wrap`}>
              {onView && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-sm"
                  onClick={() => onView(course)}
                >
                  <Eye className="h-4 w-4 text-white" />
                </Button>
              )}
              {!isDeleted && onEdit && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-sm"
                  onClick={() => onEdit(course)}
                >
                  <Edit className="h-4 w-4 text-white" />
                </Button>
              )}
              {!isDeleted && onToggleActive && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-sm"
                  onClick={() => onToggleActive(course)}
                >
                  {course.active === 1 ? (
                    <PowerOff className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <Power className="h-4 w-4 text-green-400" />
                  )}
                </Button>
              )}
              {/* Star Toggle */}
              {!isDeleted && onToggleStar && (
                <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm">
                  <Star className={`h-3 w-3 ${isStarEnabled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                  <Switch
                    checked={isStarEnabled}
                    onCheckedChange={() => onToggleStar(course)}
                    className="scale-75 data-[state=checked]:bg-yellow-500"
                  />
                </div>
              )}
              {!isDeleted && onDelete && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-lg bg-red-500/70 hover:bg-red-600/90 backdrop-blur-sm"
                  onClick={() => onDelete(course)}
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </Button>
              )}
              {isDeleted && onRestore && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-lg bg-green-500/70 hover:bg-green-600/90 backdrop-blur-sm"
                  onClick={() => onRestore(course)}
                >
                  <RefreshCw className="h-4 w-4 text-white" />
                </Button>
              )}
              {isDeleted && onForceDelete && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-lg bg-red-500/70 hover:bg-red-600/90 backdrop-blur-sm"
                  onClick={() => onForceDelete(course)}
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="p-4 space-y-3">
          {/* Subject & Stage */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {subjectName || (lang === 'ar' ? 'بدون مادة' : 'No Subject')}
            </span>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {course.count_student || 0} {lang === 'ar' ? 'طالب' : 'students'}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base line-clamp-1">{title}</h3>

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
          )}

          {/* ✅ Stats Row */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {/* Duration */}
            <div className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1.5">
              <Clock className="h-3 w-3 text-blue-500" />
              <span className="text-muted-foreground">
                {course.hour_time_course || '0'}h
              </span>
            </div>

            {/* Semester */}
            <div className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1.5">
              <Calendar className="h-3 w-3 text-purple-500" />
              <span className="text-muted-foreground truncate">
                {semesterName || (lang === 'ar' ? 'بدون ترم' : 'No Semester')}
              </span>
            </div>

            {/* Stage */}
            <div className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1.5">
              <BookOpen className="h-3 w-3 text-green-500" />
              <span className="text-muted-foreground truncate">
                {stageName || (lang === 'ar' ? 'بدون مرحلة' : 'No Stage')}
              </span>
            </div>
          </div>

          {/* ✅ Rating Stars */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              {isStarEnabled ? (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-1">
                    ({lang === 'ar' ? 'مميز' : 'Featured'})
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-muted-foreground">
                  {lang === 'ar' ? 'بدون تقييم' : 'No rating'}
                </span>
              )}
            </div>

            {/* Discount Savings Badge */}
            {hasDiscount && !isDeleted && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <TrendingDown className="h-3 w-3" />
                <span>وفر {savedAmount.toLocaleString()} EGP</span>
              </div>
            )}
          </div>

          {/* ✅ Progress Bar for completion (optional) */}
          {completionRate > 0 && completionRate < 100 && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{lang === 'ar' ? 'نسبة الإنجاز' : 'Completion'}</span>
                <span>{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-1.5" />
            </div>
          )}

          {/* ✅ Date Range */}
          {course.start_date && course.end_date && (
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-gray-100 dark:border-gray-800">
              <span>{new Date(course.start_date).toLocaleDateString()}</span>
              <span>→</span>
              <span>{new Date(course.end_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};