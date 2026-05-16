// src/config/navigation.config.ts

import { TranslationKey } from "@/i18n/translations";
import { NavStructure } from "@/types/navigation.types";
import {
  LayoutDashboard,
  GraduationCap,
  Book,
  Users,
  BookOpen,
  CreditCard,
  Star,
  Settings,
  ClipboardList,
  FileEdit,
  Upload,
  BarChart3,
  DollarSign,
  UserCog,
  Globe2,
  ChevronDown,
  ChevronUp,
  // 🔥 أيقونات جديدة للـ website section
  Layout,
  Info,
  Star as StarIcon,
  FileText
} from "lucide-react";

// 🔥 Admin Navigation with Sections
export const adminNavSections: NavStructure = [
  {
    titleKey: "main",
    icon: LayoutDashboard,
    collapsible: false,
    defaultOpen: true,
    items: [
      { to: "dashboard", labelKey: "dashboard", icon: LayoutDashboard },
    ]
  },
  {
    titleKey: "academic",
    icon: GraduationCap,
    collapsible: true,
    defaultOpen: true,
    items: [
      { to: "stage", labelKey: "stage", icon: GraduationCap },
      { to: "subject", labelKey: "subject", icon: Book },
    ]
  },
  {
    titleKey: "users_management",
    icon: Users,
    collapsible: true,
    defaultOpen: true,
    items: [
      { to: "users", labelKey: "users", icon: Users },
      { to: "instructors", labelKey: "instructors", icon: GraduationCap },
      { to: "AssistantInstructors", labelKey: "AssistantInstructors", icon: UserCog },
    ]
  },
  {
    titleKey: "content_management",
    icon: BookOpen,
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: "courses", labelKey: "courses", icon: BookOpen },
      { to: "payments", labelKey: "payments", icon: CreditCard },
      { to: "reviews", labelKey: "reviews", icon: Star },
    ]
  },
  // 🔥 القسم الجديد - Website
  {
    titleKey: "website",
    icon: Globe2,
    collapsible: true,
    defaultOpen: true,
    items: [
      { to: "hero", labelKey: "hero", icon: Layout },
      { to: "about", labelKey: "about", icon: Info },
      { to: "features", labelKey: "features", icon: StarIcon },
      { to: "footer", labelKey: "footer", icon: FileText },
    ]
  },
  {
    titleKey: "settings",
    icon: Settings,
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: "settings", labelKey: "settings", icon: Settings },
    ]
  }
];

// 🔥 Instructor Navigation with Sections
export const instructorNavSections: NavStructure = [
  {
    titleKey: "main",
    icon: LayoutDashboard,
    collapsible: false,
    defaultOpen: true,
    items: [
      { to: "dashboard", labelKey: "dashboard", icon: LayoutDashboard },
    ]
  },
  {
    titleKey: "teaching",
    icon: BookOpen,
    collapsible: true,
    defaultOpen: true,
    items: [
      { to: "my-courses", labelKey: "myCourses", icon: BookOpen },
      { to: "students", labelKey: "students", icon: Users },
    ]
  },
  {
    titleKey: "assessments",
    icon: ClipboardList,
    collapsible: true,
    defaultOpen: true,
    items: [
      { to: "exams", labelKey: "exams", icon: ClipboardList },
      { to: "assignments", labelKey: "assignments", icon: FileEdit },
    ]
  },
  {
    titleKey: "content",
    icon: Upload,
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: "content", labelKey: "content", icon: Upload },
      // 🔥 أضف website section للمدربين برضه
      { to: "hero", labelKey: "hero", icon: Layout },
      { to: "about", labelKey: "about", icon: Info },
      { to: "features", labelKey: "features", icon: StarIcon },
      { to: "footer", labelKey: "footer", icon: FileText },
    ]
  },
  {
    titleKey: "analytics",
    icon: BarChart3,
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: "analytics", labelKey: "analytics", icon: BarChart3 },
      { to: "earnings", labelKey: "earnings", icon: DollarSign },
    ]
  },
  {
    titleKey: "management",
    icon: UserCog,
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: "assistants", labelKey: "assistants", icon: UserCog },
    ]
  },
  {
    titleKey: "settings",
    icon: Settings,
    collapsible: true,
    defaultOpen: false,
    items: [
      { to: "settings", labelKey: "settings", icon: Settings },
    ]
  }
];