/* eslint-disable @typescript-eslint/no-explicit-any */
// ==================== src/services/teacherTheme.service.ts ====================
import api from '@/lib/api';

export interface WebsiteThemeData {
  status: boolean;
  teacher_id: number;
  active_theme: string | null;
  active_backgroud_color: string;
  active_font_color: string;
}

export interface ActivateThemeResponse {
  status: boolean;
  message: string;
  data: {
    teacher_id: number;
    active_theme: string;
    active_backgroud_color: string;
    active_font_color: string;
    themes: Array<{
      name: string;
      active: boolean;
    }>;
  };
}

class TeacherWebsiteThemeService {
  private static instance: TeacherWebsiteThemeService;
  
  private constructor() {}
  
  public static getInstance(): TeacherWebsiteThemeService {
    if (!TeacherWebsiteThemeService.instance) {
      TeacherWebsiteThemeService.instance = new TeacherWebsiteThemeService();
    }
    return TeacherWebsiteThemeService.instance;
  }
  
  /**
   * Get current theme settings for teacher's website
   * POST {{api}}/teachers/theme
   * Body: { teacher_id: 7 }
   * Response: { status: true, teacher_id: 7, active_theme: "theme2", active_backgroud_color: "#5343", active_font_color: "#5643" }
   */
  async getWebsiteTheme(teacherId: number): Promise<WebsiteThemeData> {
    const response = await api.post(`/teachers/theme`, { 
      teacher_id: teacherId 
    });
    return response.data;
  }
  
  /**
   * Activate theme for teacher's public website
   * POST {{api}}/activate/theme
   * Body: { theme: "theme2", teacher_id: 7, backgroud_color: "#5343", font_color: "#5643" }
   */
  async activateWebsiteTheme(
    teacherId: number,
    theme: string,
    backgroundColor?: string,
    fontColor?: string
  ): Promise<ActivateThemeResponse> {
    const payload: any = {
      theme: theme,
      teacher_id: teacherId
    };
    
    if (backgroundColor) {
      payload.backgroud_color = backgroundColor;
    }
    if (fontColor) {
      payload.font_color = fontColor;
    }
    
    const response = await api.post<ActivateThemeResponse>('/activate/theme', payload);
    return response.data;
  }
}

export const teacherWebsiteThemeService = TeacherWebsiteThemeService.getInstance();