// src/pages/instructor/StudentAttendance/types/attendance.types.ts

export interface Course {
  id: number;
  title: string;
  title_ar: string;
  type: string;
  count_student: number;
  image?: { fullUrl: string };
}

export interface Lesson {
  id: number;
  course_id: number;
  titles: string[];
  titles_ar: string[];
  description: string;
  description_ar: string;
  lession_date: string;
  lession_time: string;
  price: string;
  attended: boolean;
  course?: Course;
  image?: { fullUrl: string };
}

export interface Student {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  barcode?: string;
  teacher_id?: number;
}

export interface AttendanceRecord {
  lessonId: number;
  studentId: number;
  attended: boolean;
  timestamp: string;
}

export type AttendanceTab = 'manual' | 'qr' | 'batch-qr';

// ✅ إضافة الـ Props Interfaces
export interface CourseSelectorProps {
  courses: Course[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  isRTL: boolean;
}

export interface LessonSelectorProps {
  lessons: Lesson[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (lesson: Lesson | null) => void;
  isRTL: boolean;
  courseSelected: boolean;
}

export interface AttendanceHeaderProps {
  isRTL: boolean;
  onRefresh: () => void;
}

export interface QRScannerViewProps {
  onScan: (studentId: string) => void;
  isRTL: boolean;
  active: boolean;
}

export interface BatchQRScannerProps {
  lessonId: number;
  teacherId: number;
  onAttendanceRecorded: (studentIds: number[]) => void;
  isRTL: boolean;
}

export interface StudentAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  onRecordAttendance: (studentId: number, attended: boolean) => void;
  lang: string;
  teacherId?: number;
}