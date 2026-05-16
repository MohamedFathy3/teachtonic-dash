// src/contexts/AppContext.tsx

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/auth.types';
import { translations, Lang, TranslationKey } from '@/i18n/translations';

type Theme = "light" | "dark";
type UserRole = "admin" | "teacher" | "student";

interface AppContextType {
  // Auth related
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  login: (email: string, password: string) => Promise<{ role: string }>;
  logout: () => void;
  error: string | null;
  
  // UI Role switcher (demo only - doesn't affect auth)
  setRole: (role: UserRole) => void;
  
  // Language & Theme related
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  toggleTheme: () => void;
  dir: "ltr" | "rtl";
  t: (key: TranslationKey) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Auth state
  const { user, token, isLoading, isAuthenticated, login, logout, error } = useAuth();
  
  // UI Role state (for demo role switching - independent of auth)
  const [uiRole, setUiRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem("lms-ui-role") as UserRole;
    return savedRole || user?.role || "admin";
  });
  
  // Language & Theme state
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("lms-lang") as Lang) || "en");
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("lms-theme") as Theme) || "light");
  
  // Use UI role if available, otherwise use auth role
  const role = uiRole || user?.role || null;
  const isAdmin = role === 'admin';
  const isInstructor = role === 'teacher';
  const isStudent = role === 'student';
  
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Save UI role to localStorage
  useEffect(() => {
    localStorage.setItem("lms-ui-role", uiRole);
  }, [uiRole]);

  // Update UI role when auth user changes
  useEffect(() => {
    if (user?.role) {
      setUiRole(user.role);
    }
  }, [user]);

  // Apply language to document
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem("lms-lang", lang);
  }, [lang, dir]);

  // Apply theme to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("lms-theme", theme);
  }, [theme]);

  // Translation function
  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations.en[key] || key;
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  console.log('🔄 AppContext value updated:', { 
    isAuthenticated, 
    role,
    uiRole,
    authRole: user?.role,
    hasUser: !!user,
    userName: user?.name,
    lang,
    theme
  });

  const value: AppContextType = {
    user,
    role,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    isInstructor,
    isStudent,
    login,
    logout,
    error,
    setRole: setUiRole,
    lang,
    setLang: setLangState,
    theme,
    toggleTheme,
    dir,
    t,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};