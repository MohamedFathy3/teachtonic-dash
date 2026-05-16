// src/types/navigation.types.ts

import { TranslationKey } from "@/i18n/translations";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
}

export interface NavSection {
  titleKey: TranslationKey;
  icon?: LucideIcon;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export type NavStructure = NavSection[];