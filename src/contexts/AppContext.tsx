// src/contexts/AppContext.tsx

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/auth.types';
import { translations, Lang, TranslationKey } from '@/i18n/translations';
import api from '@/lib/api';

type Theme = "light" | "dark";
type UserRole = "admin" | "teacher" | "student";

// تعريف نوع بيانات المعلم (Instructor)
interface InstructorData {
  id: number;
  name: string;
  email?: string;
  type?: string;
  role: string;
  imageUrl?: string;
  image?: {
    id: number;
    name: string;
    mimeType: string;
    size: number;
    authorId: number | null;
    previewUrl: string;
    fullUrl: string;
    createdAt: string;
  };
}

interface AppContextType {
  user: User | null;
  instructorData: InstructorData | null;
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
  setRole: (role: UserRole) => void;
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
  const { user, token, isLoading, isAuthenticated, login, logout, error } = useAuth();
  
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);
  const [isLoadingInstructor, setIsLoadingInstructor] = useState(false);
  
  const [uiRole, setUiRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem("lms-ui-role") as UserRole;
    return savedRole || user?.role || "admin";
  });
  
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("lms-lang") as Lang) || "en");
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("lms-theme") as Theme) || "light");
  
  // 🟢 معالجة الدور بشكل صحيح - تحويل "teacher" إلى "instructor" للتوافق
  const role = uiRole || user?.role || null;
  const isAdmin = role === 'admin';
  const isInstructor = role === 'teacher' || role === 'instructor'; // ✅ دعم كلا القيمتين
  const isStudent = role === 'student';
  
  const dir = lang === "ar" ? "rtl" : "ltr";

  // دالة لجلب بيانات المعلم من الـ API
  const fetchInstructorData = async () => {
    if (!isAuthenticated || !token) {
      console.log('⏭️ Skipping instructor fetch: Not authenticated');
      return;
    }

    // جلب فقط إذا كان المستخدم معلم (teacher أو instructor)
    if (role !== 'teacher' && role !== 'instructor') {
      console.log('⏭️ Skipping instructor fetch: User is not an instructor');
      return;
    }

    setIsLoadingInstructor(true);
    try {
      console.log('🔄 Fetching instructor data...');
      
      const response = await api.get('/admin/check-auth');
      
      console.log('✅ Instructor data fetched:', response.data);
      
      if (response.data?.result === 'Success' && response.data?.data) {
        const data = response.data.data;
        
        setInstructorData({
          id: data.id,
          name: data.name,
          type: data.type,
          role: data.role || 'teacher',
          imageUrl: data.imageUrl || data.image?.fullUrl,
          image: data.image,
          email: data.email,
        });
        
        console.log('✅ Instructor data set successfully:', instructorData);
      } else {
        console.warn('⚠️ Unexpected instructor data structure:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching instructor data:', error);
    } finally {
      setIsLoadingInstructor(false);
    }
  };

  // جلب بيانات المعلم عند تغيير التوكن أو الدور
  useEffect(() => {
    if (isAuthenticated && token && (role === 'teacher' || role === 'instructor')) {
      fetchInstructorData();
    } else {
      setInstructorData(null);
    }
  }, [isAuthenticated, token, role]);

  // جلب البيانات مرة أخرى عند تغيير الـ UI role
  useEffect(() => {
    if (uiRole === 'teacher' || uiRole === 'instructor') {
      fetchInstructorData();
    }
  }, [uiRole]);

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
    instructorName: instructorData?.name,
    instructorRole: instructorData?.role,
    lang,
    theme
  });

  const value: AppContextType = {
    user,
    instructorData,
    role,
    token,
    isLoading: isLoading || isLoadingInstructor,
    isAuthenticated,
    isAdmin,
    isInstructor, // ✅ الآن سيكون true لكل من 'teacher' و 'instructor'
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