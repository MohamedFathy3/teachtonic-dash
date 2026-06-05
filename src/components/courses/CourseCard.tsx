// src/components/courses/CourseCard.tsx

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Star, Users, DollarSign, Eye, Edit, Trash2,
  RefreshCw, Archive, Power, PowerOff, CheckCircle, XCircle
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { Course } from '@/types/course.types';
import { motion } from 'framer-motion';

interface CourseCardProps {
  course: Course;
  onView?: (course: Course) => void;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onRestore?: (course: Course) => void;
  onForceDelete?: (course: Course) => void;
  onToggleActive?: (course: Course) => void;
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
  showActions = true,
  isDeleted = false,
}) => {
  const { t, lang } = useApp();
  const isRTL = lang === 'ar';
  const [isHovered, setIsHovered] = useState(false);

  const title = isRTL ? course.title_ar : course.title;
  const description = isRTL ? course.description_ar : course.description;
  const subjectName = isRTL ? course.subject?.name_ar : course.subject?.name;
  const stageName = isRTL ? course.stage.name_ar : course.stage.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`overflow-hidden rounded-xl border transition-all duration-200 ${isDeleted ? 'bg-muted/30 border-red-200/50' : 'hover:shadow-md'
        }`}>
        {/* Course Image */}
        <div className="relative aspect-video bg-muted">
          {course.image?.fullUrl || course.imageUrl ? (
            <img
              src={course.image?.fullUrl || course.imageUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 end-2">
            {isDeleted ? (
              <Badge variant="destructive" className="gap-1">
                <Archive className="h-3 w-3" />
                {t('deleted')}
              </Badge>
            ) : (
              <Badge variant={course.active === 1 ? "success" : "secondary"} className="gap-1">
                {course.active === 1 ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {course.active === 1 ? t('active') : t('inactive')}
              </Badge>
            )}
          </div>

          {/* Actions Menu - يظهر عند hover */}
          {showActions && isHovered && (
            <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} flex gap-1`}>
              {onView && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 rounded-md bg-black/70 hover:bg-black/90"
                  onClick={() => onView(course)}
                >
                  <Eye className="h-3.5 w-3.5 text-white" />
                </Button>
              )}
              {!isDeleted && onEdit && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 rounded-md bg-black/70 hover:bg-black/90"
                  onClick={() => onEdit(course)}
                >
                  <Edit className="h-3.5 w-3.5 text-white" />
                </Button>
              )}
              {!isDeleted && onToggleActive && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 rounded-md bg-black/70 hover:bg-black/90"
                  onClick={() => onToggleActive(course)}
                >
                  {course.active === 1 ? (
                    <PowerOff className="h-3.5 w-3.5 text-yellow-400" />
                  ) : (
                    <Power className="h-3.5 w-3.5 text-green-400" />
                  )}
                </Button>
              )}
              {!isDeleted && onDelete && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 rounded-md bg-red-500/70 hover:bg-red-600/90"
                  onClick={() => onDelete(course)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-white" />
                </Button>
              )}
              {isDeleted && onRestore && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 rounded-md bg-green-500/70 hover:bg-green-600/90"
                  onClick={() => onRestore(course)}
                >
                  <RefreshCw className="h-3.5 w-3.5 text-white" />
                </Button>
              )}
              {isDeleted && onForceDelete && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7 rounded-md bg-red-500/70 hover:bg-red-600/90"
                  onClick={() => onForceDelete(course)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-white" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {subjectName}
            </span>
            <span className="text-xs text-muted-foreground">
              {stageName}
            </span>
          </div>

          <h3 className="font-semibold text-sm line-clamp-1">{title}</h3>

          {description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{description}</p>
          )}

          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {/* <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">4.5</span>
              </span> */}
              <span className="flex items-center gap-0.5">
                <Users className="h-3 w-3" />
                {course.count_student}
              </span>
            </div>
            <span className="flex items-center gap-0.5 font-bold text-primary">
              EGP {course.price}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};