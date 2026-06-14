/* eslint-disable @typescript-eslint/no-explicit-any */
// ==================== src/hooks/useTeacherTheme.ts ====================
import { useState, useCallback, useEffect } from 'react';
import { teacherWebsiteThemeService } from '@/services/teacherTheme.service';
import { toast } from 'sonner';

interface WebsiteThemeState {
  activeTheme: string | null;
  backgroundColor: string | null;  // ✅ changed to allow null
  fontColor: string | null;        // ✅ changed to allow null
  isLoading: boolean;
  error: string | null;
}

interface ThemeActionResult {
  success: boolean;
  message?: string;
}

// Theme configurations - unified source of truth
export const THEMES_CONFIG = [
  { 
    name: 'theme1', 
    label: 'Scientific Theme', 
    description: 'Clean, modern design with professional gradients perfect for academic content and serious learning environments.',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    colors: ['#3b82f6', '#6366f1', '#8b5cf6'],
    defaultBg: "#ffffff",
    defaultFont: "#1e293b"
  },
  { 
    name: 'theme2', 
    label: 'Basic Theme', 
    description: 'Simple and elegant design with soft, comfortable colors that make reading easy and enjoyable for all ages.',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    colors: ['#10b981', '#14b8a6', '#06b6d4'],
    defaultBg: "#f8fafc",
    defaultFont: "#0f172a"
  },
];

export type ThemeConfig = typeof THEMES_CONFIG[0];

export const useTeacherTheme = (teacherId: number) => {
  const [state, setState] = useState<WebsiteThemeState>({
    activeTheme: null,
    backgroundColor: null,      // ✅ changed to null
    fontColor: null,            // ✅ changed to null
    isLoading: false,
    error: null
  });
  
  // جلب الثيم الحالي من السيرفر
  const fetchTheme = useCallback(async () => {
    if (!teacherId) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await teacherWebsiteThemeService.getWebsiteTheme(teacherId);
      console.log("Fetched theme response:", response);
      
      // ✅ التصحيح: response فيه الحقول مباشرة مش response.data
      if (response?.status) {
        setState({
          activeTheme: response.active_theme,
          backgroundColor: response.active_backgroud_color || null,    // ✅ null if not set
          fontColor: response.active_font_color || null,              // ✅ null if not set
          isLoading: false,
          error: null
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error: any) {
      console.error("Error fetching theme:", error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.response?.data?.message || "Failed to fetch theme" 
      }));
    }
  }, [teacherId]);
  
  // تفعيل الثيم (مع أو بدون ألوان)
// في activateTheme داخل useTeacherTheme
const activateTheme = useCallback(async (
  themeName: string,
  backgroundColor?: string | null,
  fontColor?: string | null
): Promise<ThemeActionResult> => {
  setState(prev => ({ ...prev, isLoading: true, error: null }));
  
  try {
    // ✅ نحول null لـ "null" عشان نبعتها كـ string
    const bgColor = backgroundColor === null ? "null" : backgroundColor;
    const fColor = fontColor === null ? "null" : fontColor;
    
    const response = await teacherWebsiteThemeService.activateWebsiteTheme(
      teacherId,
      themeName,
      bgColor,
      fColor
    );
    
    console.log("Activation response:", response);
    
    if (response?.status && response?.data) {
      setState({
        activeTheme: response.data.active_theme,
        // ✅ لو الراجع "null" نحوله لـ null في الـ state
        backgroundColor: response.data.active_backgroud_color === "null" ? null : response.data.active_backgroud_color,
        fontColor: response.data.active_font_color === "null" ? null : response.data.active_font_color,
        isLoading: false,
        error: null
      });
      
      toast.success(response.message);
      return { success: true, message: response.message };
    }
    
    setState(prev => ({ ...prev, isLoading: false }));
    return { success: false, message: response?.message || "Failed to activate theme" };
  } catch (error: any) {
    console.error("Error activating theme:", error);
    const errorMsg = error.response?.data?.message || "Failed to activate theme";
    setState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
    toast.error(errorMsg);
    return { success: false, message: errorMsg };
  }
}, [teacherId]);
  
  // تحديث الألوان فقط
  const updateColors = useCallback(async (backgroundColor: string | null, fontColor: string | null): Promise<ThemeActionResult> => {
    if (!state.activeTheme) {
      toast.error("Please select a theme first");
      return { success: false, message: "No active theme" };
    }
    
    return activateTheme(state.activeTheme, backgroundColor, fontColor);
  }, [state.activeTheme, activateTheme]);
  
  useEffect(() => {
    if (teacherId) {
      fetchTheme();
    }
  }, [teacherId, fetchTheme]);
  
  return {
    activeTheme: state.activeTheme,
    backgroundColor: state.backgroundColor,
    fontColor: state.fontColor,
    isLoading: state.isLoading,
    error: state.error,
    activateTheme,
    updateColors,
    refreshTheme: fetchTheme,
    availableThemes: THEMES_CONFIG
  };
};