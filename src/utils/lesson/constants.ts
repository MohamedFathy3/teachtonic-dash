// src/utils/lesson/constants.ts

export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export const tabItems = [
  { value: 'overview', label: 'نظرة عامة', icon: 'Info' },
  { value: 'videos', label: 'فيديوهات', icon: 'Video' },
  { value: 'exams', label: 'امتحانات', icon: 'FileQuestion' },
  { value: 'assignments', label: 'واجبات', icon: 'ClipboardList' },
  { value: 'students', label: 'طلاب', icon: 'Users' },
  { value: 'attendance', label: 'الحضور', icon: 'CheckCircle2' },
];